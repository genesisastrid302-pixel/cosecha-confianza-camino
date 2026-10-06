import { useEffect, useState } from "react";
import { products } from "@/lib/data";
import type { CartLine } from "@/lib/cart";
import { nombreCorto, readConsumer, readDistributor } from "@/lib/accounts";
import { sesionDe, suscribirSesion } from "@/lib/acceso";
import { readProducer } from "@/lib/producer-store";

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

/** Cuenta real que hizo algo en el pedido: su id y su nombre corto */
export type Persona = { id: string; nombre: string };

export type Order = {
  id: string; // MLP-0000, MLP-0001… en el orden en que se hicieron
  /** Cuenta del consumidor que lo pidió; solo esa cuenta lo ve en sus Pedidos */
  consumidorId?: string;
  cliente: string;
  /** Productor que lo aceptó y empacó */
  productor?: Persona;
  /** Distribuidor que lo recolectó y entregó */
  distribuidor?: Persona;
  createdAt: string; // ISO
  items: OrderItem[];
  /** Un lote por productor que participa en el pedido */
  lots: Record<string, string>; // producerSlug -> LT-0000 (mismo número que su pedido)
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
/** Número que le toca al siguiente pedido (el primero es 0000) */
const SEQ_KEY = "milpa-pedido-siguiente";
const EVENT = "milpa-orders-change";

// Borrón único: los pedidos de prueba de la numeración anterior (MLP-06xx) no estaban
// ligados a ninguna cuenta. Se quitan una sola vez para que el seguimiento empiece en 0000.
const VERSION_KEY = "milpa-datos-version";
const VERSION = "2";
if (typeof window !== "undefined" && window.localStorage.getItem(VERSION_KEY) !== VERSION) {
  ["milpa-orders", "milpa-order-seq", "milpa-ruta", "milpa-avisos-vistos"].forEach((k) => window.localStorage.removeItem(k));
  window.localStorage.setItem(VERSION_KEY, VERSION);
}

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

/** Consecutivo de pedidos: 0000, 0001, 0002… Nunca se repite ni se salta. */
function nextNumber() {
  const guardado = Number(window.localStorage.getItem(SEQ_KEY));
  // Si el contador se perdió, sigue después del pedido más alto que exista
  const usados = readOrders().map((o) => Number(o.id.replace(/\D/g, "")) + 1);
  const n = Math.max(Number.isFinite(guardado) ? guardado : 0, 0, ...usados);
  window.localStorage.setItem(SEQ_KEY, String(n + 1));
  return String(n).padStart(4, "0");
}

function codigoNuevo() {
  return String(1000 + (window.crypto.getRandomValues(new Uint32Array(1))[0] % 9000));
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
    consumidorId: sesionDe("consumidor") ?? undefined,
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
    codigoEntrega: codigoNuevo(),
  };
  writeOrders([order, ...readOrders()]);
  return order;
}

export function setOrderStatus(id: string, status: OrderStatus) {
  updateOrder(id, { status });
}

const PASOS_PRODUCTOR: OrderStatus[] = ["aceptado", "rechazado", "empacado"];
const PASOS_DISTRIBUIDOR: OrderStatus[] = ["en_recoleccion", "en_ruta", "entregado", "con_problema"];

/** Quién dio el paso: la cuenta de productor o de distribuidor con sesión iniciada */
function firma(status: OrderStatus): Pick<Order, "productor" | "distribuidor"> {
  if (PASOS_PRODUCTOR.includes(status)) {
    const id = sesionDe("productor");
    return id ? { productor: { id, nombre: nombreCorto(readProducer().profile.name) } } : {};
  }
  if (PASOS_DISTRIBUIDOR.includes(status)) {
    const id = sesionDe("distribuidor");
    return id ? { distribuidor: { id, nombre: nombreCorto(readDistributor().nombre) } } : {};
  }
  return {};
}

/** Actualiza campos de un pedido; si trae status, lo agrega al historial y anota quién dio el paso */
export function updateOrder(id: string, patch: Partial<Omit<Order, "id" | "history">>) {
  const now = new Date().toISOString();
  writeOrders(
    readOrders().map((o) => {
      if (o.id !== id) return o;
      const cambia = patch.status && patch.status !== o.status;
      const history = cambia ? [...o.history, { status: patch.status!, at: now }] : o.history;
      return { ...o, ...(cambia ? firma(patch.status!) : {}), ...patch, history };
    }),
  );
}

/** Nombre de quien reparte el pedido; mientras nadie lo recolecta, "el distribuidor" */
export function repartidor(o: Order | undefined, inicio = false) {
  return o?.distribuidor?.nombre.split(" ")[0] || (inicio ? "El distribuidor" : "el distribuidor");
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

/** Título de la pantalla del pedido del productor según su estado */
export function tituloPedidoProductor(o: Order) {
  if (o.status === "nuevo") return "Nuevo pedido";
  if (o.status === "aceptado") return "Prepara el pedido";
  if (o.status === "rechazado") return "Pedido rechazado";
  if (o.status === "con_problema") return "Revisa este pedido";
  if (o.status === "en_recoleccion") return "Pedido recolectado";
  if (o.status === "en_ruta") return "Pedido en camino";
  if (["entregado", "recibido", "calificado"].includes(o.status)) return "Pedido entregado";
  return "Pedido listo";
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

/** Pedidos de la cuenta de consumidor con sesión iniciada */
export function misPedidos(orders: Order[] = readOrders()) {
  const id = sesionDe("consumidor");
  return id ? orders.filter((o) => o.consumidorId === id) : [];
}

/** Lo que ve el consumidor: solo sus pedidos, nunca los de otra cuenta del mismo navegador */
export function useMisPedidos() {
  const orders = useOrders();
  const [, setTick] = useState(0);
  useEffect(() => suscribirSesion(() => setTick((t) => t + 1)), []);
  return misPedidos(orders);
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
