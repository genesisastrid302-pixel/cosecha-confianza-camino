import { useEffect, useState } from "react";
import { products } from "@/lib/data";
import type { CartLine } from "@/lib/cart";
import { nombreCorto, readConsumer } from "@/lib/accounts";

// Estados acordados en docs/decisiones.md
export type OrderStatus =
  | "nuevo"
  | "aceptado"
  | "empacado"
  | "en_recoleccion"
  | "en_ruta"
  | "entregado"
  | "recibido"
  | "calificado"
  | "rechazado"
  | "con_problema";

export type Entrega = "domicilio" | "pickup";
export type MetodoPago = "Tarjeta" | "CoDi" | "Efectivo";

export type OrderItem = {
  productId: string;
  name: string;
  producerSlug: string;
  unit: string;
  price: number;
  quantity: number;
};

export type Empaque = {
  temperatura: number; // °C al entregar
  tipo: "Bolsa" | "Caja" | "Contenedor refrigerado";
  refrigeracion: boolean;
  condiciones: string;
  hora: string; // HH:mm
  foto?: string; // data URL de la foto del empaque
  registradoEn: string;
};

export type Traslado = "productor_lleva" | "distribuidor_recoge";

/** Problema que reporta el distribuidor al recolectar; alerta al productor */
export type Problema = { motivo: string; detalle: string; foto?: string; at: string };

/** Merma que registra el distribuidor después de entregar */
export type Merma = { kg: number; motivo: "Daño" | "Temperatura" | "Otro"; lote: string; foto?: string; at: string };

/** Lo que el distribuidor confirma al entregar */
export type EntregaRegistro = { at: string; firmado: boolean; identidad: boolean; cobroEfectivo: boolean };

/** Calificación del consumidor al recibir */
export type Feedback = { estrellas: number; merma: boolean; nota: string; at: string };

export type Order = {
  id: string; // MLP-0601
  cliente: string;
  createdAt: string; // ISO
  items: OrderItem[];
  /** Un lote por productor que participa en el pedido */
  lots: Record<string, string>; // producerSlug -> LT-0601
  entrega: Entrega;
  direccion: string;
  pago: MetodoPago;
  subtotal: number;
  logistica: number;
  plataforma: number;
  total: number;
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  empaque?: Empaque;
  traslado?: Traslado;
  qrGeneradoEn?: string;
  /** Código de 4 dígitos que el consumidor da al recibir */
  codigoEntrega?: string;
  /** Productores cuyo lote ya recolectó (o recibió en su local) el distribuidor */
  recolectados?: string[];
  /** Temperatura medida por el distribuidor al recolectar, en °C */
  temperaturaRecoleccion?: number;
  problema?: Problema;
  entregaRegistro?: EntregaRegistro;
  merma?: Merma;
  feedback?: Feedback;
};

export const LOGISTICA = 18;
export const PLATAFORMA = 10;

/** Orden lineal del flujo feliz, para pintar la línea de tiempo */
export const FLOW: OrderStatus[] = [
  "nuevo",
  "aceptado",
  "empacado",
  "en_recoleccion",
  "en_ruta",
  "entregado",
  "recibido",
  "calificado",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  nuevo: "Pedido realizado",
  aceptado: "Aceptado por el productor",
  empacado: "Empacado",
  en_recoleccion: "Recolectado",
  en_ruta: "En camino",
  entregado: "Entregado",
  recibido: "Recibido",
  calificado: "Calificado",
  rechazado: "El productor no pudo surtirlo",
  con_problema: "Revisando un problema en la recolección",
};

const KEY = "milpa-orders";
const SEQ_KEY = "milpa-order-seq";
const EVENT = "milpa-orders-change";

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? (data as Order[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  window.localStorage.setItem(KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(EVENT));
}

function nextNumber() {
  const current = Number(window.localStorage.getItem(SEQ_KEY) || "600");
  const next = current + 1;
  window.localStorage.setItem(SEQ_KEY, String(next));
  return String(next).padStart(4, "0");
}

export function createOrder(input: {
  lines: CartLine[];
  entrega: Entrega;
  direccion: string;
  pago: MetodoPago;
}): Order {
  const items: OrderItem[] = input.lines.flatMap((line) => {
    const p = products.find((x) => x.id === line.id);
    return p
      ? [{ productId: p.id, name: p.name, producerSlug: p.producerSlug, unit: p.unit, price: p.price, quantity: line.quantity }]
      : [];
  });
  const n = nextNumber();
  const lots: Record<string, string> = {};
  const producers = [...new Set(items.map((i) => i.producerSlug))];
  producers.forEach((slug, idx) => {
    lots[slug] = `LT-${n}${producers.length > 1 ? `-${String.fromCharCode(65 + idx)}` : ""}`;
  });
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const now = new Date().toISOString();
  const order: Order = {
    id: `MLP-${n}`,
    cliente: nombreCorto(readConsumer().nombre),
    createdAt: now,
    items,
    lots,
    entrega: input.entrega,
    direccion: input.direccion,
    pago: input.pago,
    subtotal,
    logistica: LOGISTICA,
    plataforma: PLATAFORMA,
    total: subtotal + LOGISTICA + PLATAFORMA,
    status: "nuevo",
    history: [{ status: "nuevo", at: now }],
    codigoEntrega: String(1000 + ((Number(n) * 7919) % 9000)),
  };
  writeOrders([order, ...readOrders()]);
  return order;
}

export function setOrderStatus(id: string, status: OrderStatus) {
  const now = new Date().toISOString();
  writeOrders(
    readOrders().map((o) => (o.id === id ? { ...o, status, history: [...o.history, { status, at: now }] } : o)),
  );
}

/** Actualiza campos de un pedido; si trae status, lo agrega al historial */
export function updateOrder(id: string, patch: Partial<Omit<Order, "id" | "history">>) {
  const now = new Date().toISOString();
  writeOrders(
    readOrders().map((o) => {
      if (o.id !== id) return o;
      const history = patch.status && patch.status !== o.status ? [...o.history, { status: patch.status, at: now }] : o.history;
      return { ...o, ...patch, history };
    }),
  );
}

/** El consumidor ve su código de entrega mientras el distribuidor tiene el pedido */
export const muestraCodigo = (o: Order) => o.status === "en_recoleccion" || o.status === "en_ruta";

/** Del que más pide atención del consumidor al que menos */
const URGENCIA: OrderStatus[] = ["en_ruta", "entregado", "en_recoleccion", "recibido", "con_problema", "empacado", "aceptado", "nuevo"];

/** Pedidos del consumidor que siguen abiertos, el más urgente primero (p. ej. el que va en camino) */
export function pedidosEnCurso(orders: Order[]) {
  return orders
    .filter((o) => URGENCIA.includes(o.status))
    .sort((a, b) => URGENCIA.indexOf(a.status) - URGENCIA.indexOf(b.status));
}

/** Código de entrega del pedido (los pedidos viejos lo derivan de su número) */
export function codigoDe(o: Order) {
  return o.codigoEntrega ?? String(1000 + ((Number(o.id.replace(/\D/g, "")) * 7919) % 9000));
}

/** Peso aproximado de un renglón en kg (manojos y piezas cuentan 0.25 kg) */
export function pesoKg(i: OrderItem) {
  return i.unit === "kilo" ? i.quantity : i.quantity * 0.25;
}

export function pesoPedido(o: Order) {
  return o.items.reduce((n, i) => n + pesoKg(i), 0);
}

/** Pedido de ejemplo ya empacado, para probar la ruta del distribuidor sin pasar por los otros roles */
export function crearPedidoEjemplo() {
  const o = createOrder({
    lines: [
      { id: "jitomate", quantity: 2 },
      { id: "cilantro", quantity: 1 },
    ],
    entrega: "domicilio",
    direccion: "Calle Hidalgo 214, Col. Roma, Monterrey",
    pago: "Tarjeta",
  });
  const now = new Date().toISOString();
  updateOrder(o.id, { status: "aceptado" });
  updateOrder(o.id, {
    status: "empacado",
    traslado: "distribuidor_recoge",
    qrGeneradoEn: now,
    empaque: {
      temperatura: 6,
      tipo: "Caja",
      refrigeracion: true,
      condiciones: "Sombra y ventilación; cámara fría hasta la recolección.",
      hora: "07:30",
      registradoEn: now,
    },
  });
  return o.id;
}

export function getOrder(id: string) {
  return readOrders().find((o) => o.id === id);
}

/**
 * Qué sigue después del estado actual, en las mismas palabras para los tres
 * roles: así consumidor, productor y distribuidor leen la misma historia.
 */
export function siguientePaso(o: Order): string {
  switch (o.status) {
    case "nuevo":
      return "El productor confirma si puede surtirlo.";
    case "aceptado":
      return "El productor lo empaca y registra la cadena de frío.";
    case "empacado":
      return o.traslado === "productor_lleva"
        ? "El productor lo lleva al local del distribuidor."
        : "El distribuidor lo recoge en el campo.";
    case "en_recoleccion":
      return "El distribuidor termina sus recolecciones y sale a entregar.";
    case "en_ruta":
      return o.entrega === "domicilio"
        ? "El distribuidor lo entrega en el domicilio con el código de 4 dígitos."
        : "El consumidor lo recoge en el punto de entrega con el código de 4 dígitos.";
    case "entregado":
      return "El consumidor confirma que lo recibió.";
    case "recibido":
      return "El consumidor califica su canasta.";
    case "con_problema":
      return "El productor revisa el problema y lo deja listo otra vez.";
    default:
      return "Pedido cerrado.";
  }
}

export const TRASLADO_LABEL: Record<Traslado, string> = {
  productor_lleva: "El productor lo lleva al local del distribuidor",
  distribuidor_recoge: "El distribuidor recoge en el campo",
};

export function subscribeOrders(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const update = () => setOrders(readOrders());
    update();
    return subscribeOrders(update);
  }, []);
  return orders;
}

/** Porcentaje del subtotal que llega a productores (el resto es logística y plataforma) */
export function shareToProducers(subtotal: number) {
  const total = subtotal + LOGISTICA + PLATAFORMA;
  return total > 0 ? Math.round((subtotal / total) * 100) : 0;
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
  return sameDay ? `Hoy · ${time}` : `${d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} · ${time}`;
}
