import { useEffect, useState } from "react";
import { getProducer } from "@/lib/data";
import { LOGISTICA, pesoKg, pesoPedido, updateOrder, type Order, type OrderItem } from "@/lib/orders";

/**
 * Lógica del distribuidor sobre los pedidos compartidos (src/lib/orders.ts).
 * Todo se deriva del estado de los pedidos, para que consumidor, productor y
 * distribuidor vean siempre la misma información.
 */

export const LOCAL_DISTRIBUIDOR = "Local Milpa · Col. Obispado, Monterrey";

/** Parada de recolección: un productor con uno o varios pedidos listos */
export type ParadaRecoleccion = {
  /** Clave de la parada para la URL: "santiago" o "santiago-local" */
  key: string;
  slug: string;
  /** true si el productor lleva el producto al local del distribuidor */
  enLocal: boolean;
  nombre: string;
  lugar: string;
  pedidos: { order: Order; items: OrderItem[]; lote: string }[];
  kg: number;
};

const pendienteDe = (o: Order, slug: string) => !(o.recolectados ?? []).includes(slug);

export function paradasRecoleccion(orders: Order[]): ParadaRecoleccion[] {
  const map = new Map<string, ParadaRecoleccion>();
  for (const o of orders) {
    if (o.status !== "empacado" || !o.traslado) continue;
    const enLocal = o.traslado === "productor_lleva";
    for (const slug of Object.keys(o.lots)) {
      if (!pendienteDe(o, slug)) continue;
      const key = enLocal ? `${slug}-local` : slug;
      const producer = getProducer(slug);
      const items = o.items.filter((i) => i.producerSlug === slug);
      const parada = map.get(key) ?? {
        key,
        slug,
        enLocal,
        nombre: producer.name,
        lugar: enLocal ? LOCAL_DISTRIBUIDOR : producer.region,
        pedidos: [],
        kg: 0,
      };
      parada.pedidos.push({ order: o, items, lote: o.lots[slug] });
      parada.kg += items.reduce((n, i) => n + pesoKg(i), 0);
      map.set(key, parada);
    }
  }
  return [...map.values()];
}

/** Pedidos que ya tiene el distribuidor y faltan por entregar */
export function entregasPendientes(orders: Order[]) {
  return orders.filter((o) => o.status === "en_recoleccion" || o.status === "en_ruta");
}

/** Pedidos que aún dependen del productor (sin confirmar o sin empacar) */
export function esperandoProductor(orders: Order[]) {
  return orders.filter((o) => o.status === "nuevo" || o.status === "aceptado" || o.status === "con_problema");
}

const ENTREGADOS: Order["status"][] = ["entregado", "recibido", "calificado"];
export const fueEntregado = (o: Order) => ENTREGADOS.includes(o.status);

/** Marca recolectado el lote de un productor; el pedido avanza cuando están todos sus lotes */
export function confirmarRecoleccion(o: Order, slug: string, temperatura?: number) {
  const recolectados = [...new Set([...(o.recolectados ?? []), slug])];
  const completo = Object.keys(o.lots).every((s) => recolectados.includes(s));
  updateOrder(o.id, {
    recolectados,
    temperaturaRecoleccion: temperatura ?? o.temperaturaRecoleccion,
    ...(completo ? { status: "en_recoleccion" as const } : {}),
  });
}

// --- Mapa y navegación de la ruta ---

export type Coords = [number, number];

/** Coordenadas aproximadas de las direcciones y puntos de entrega del demo */
const UBICACIONES: Record<string, Coords> = {
  [LOCAL_DISTRIBUIDOR]: [25.6751, -100.3406],
  "Punto Milpa · Mercado Juárez, Centro": [25.6731, -100.3168],
  "Calle Hidalgo 214, Col. Roma, Monterrey": [25.6565, -100.3567],
  "Av. Vasconcelos 150, San Pedro Garza García": [25.6524, -100.3698],
};

export const coordsDe = (lugar: string): Coords | undefined => UBICACIONES[lugar];

/** Parada en el mapa; `n` es el mismo número que tiene en la lista de la ruta */
export type PuntoMapa = { n: number; tipo: "recoleccion" | "entrega"; titulo: string; coords: Coords };

export function puntosMapa(recolecciones: ParadaRecoleccion[], entregas: Order[]): PuntoMapa[] {
  const puntos: (PuntoMapa | null)[] = [
    ...recolecciones.map((r, i) => {
      const coords = r.enLocal ? coordsDe(LOCAL_DISTRIBUIDOR) : getProducer(r.slug)?.coords;
      return coords ? { n: i + 1, tipo: "recoleccion" as const, titulo: r.nombre, coords } : null;
    }),
    ...entregas.map((o, i) => {
      const coords = coordsDe(o.direccion);
      return coords ? { n: recolecciones.length + i + 1, tipo: "entrega" as const, titulo: o.cliente, coords } : null;
    }),
  ];
  return puntos.filter((p): p is PuntoMapa => p !== null);
}

/**
 * Link de Google Maps con las paradas fuera del local, en orden.
 * Usa coordenadas cuando las hay para que Google no adivine la dirección;
 * sin origen, Google parte de la ubicación actual del teléfono.
 */
export function urlNavegacion(recolecciones: ParadaRecoleccion[], entregas: Order[]) {
  const destinos = [
    ...recolecciones.filter((r) => !r.enLocal).map((r) => getProducer(r.slug)?.coords ?? r.lugar),
    ...entregas.map((o) => coordsDe(o.direccion) ?? o.direccion),
  ].map((d) => (typeof d === "string" ? d : d.join(",")));
  if (destinos.length === 0) return "";
  const destino = encodeURIComponent(destinos[destinos.length - 1]);
  const paradas = destinos.length > 1 ? `&waypoints=${encodeURIComponent(destinos.slice(0, -1).join("|"))}` : "";
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${destino}${paradas}`;
}

/** Historial previo del distribuidor de ejemplo, para que los indicadores no arranquen en cero */
const HISTORIAL = { entregas: 48, aTiempo: 46, kg: 310, mermaKg: 6.5 };

export function kpis(orders: Order[]) {
  const entregados = orders.filter(fueEntregado);
  const conProblema = entregados.filter((o) => o.history.some((h) => h.status === "con_problema")).length;
  const entregas = HISTORIAL.entregas + entregados.length;
  const aTiempo = HISTORIAL.aTiempo + entregados.length - conProblema;
  const kg = HISTORIAL.kg + entregados.reduce((n, o) => n + pesoPedido(o), 0);
  const mermaKg = HISTORIAL.mermaKg + orders.reduce((n, o) => n + (o.merma?.kg ?? 0), 0);
  return {
    entregas,
    entregasHoy: entregados.length,
    aTiempoPct: Math.round((aTiempo / entregas) * 100),
    mermaPct: Math.round((mermaKg / kg) * 1000) / 10,
    mermaKg: Math.round(mermaKg * 10) / 10,
    activos: orders.filter((o) => !["rechazado", "calificado", "recibido", "entregado"].includes(o.status)).length,
  };
}

/** Dinero del distribuidor: logística ganada y efectivo que cobró al entregar */
export function finanzas(orders: Order[]) {
  const entregados = orders.filter(fueEntregado);
  const logistica = entregados.length * LOGISTICA;
  const efectivo = entregados.filter((o) => o.pago === "Efectivo").reduce((n, o) => n + o.total, 0);
  const pedidosEfectivo = entregados.filter((o) => o.pago === "Efectivo").length;
  return {
    entregados,
    logistica,
    efectivo,
    /** Del efectivo cobrado se queda su logística; el resto lo liquida a productores y Milpa */
    porLiquidar: efectivo - pedidosEfectivo * LOGISTICA,
  };
}

/** Minutos estimados de ruta: 25 por recolección en campo y 15 por entrega */
export function tiempoEstimado(recolecciones: ParadaRecoleccion[], entregas: Order[]) {
  const min = recolecciones.filter((r) => !r.enLocal).length * 25 + entregas.length * 15;
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ""}`.trim() : `${min} min`;
}

// --- Estado de la ruta del día (si ya se inició) ---

const RUTA_KEY = "milpa-ruta";
const RUTA_EVENT = "milpa-ruta-change";

export function rutaIniciada() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(RUTA_KEY) === "1";
}

export function setRutaIniciada(v: boolean) {
  window.localStorage.setItem(RUTA_KEY, v ? "1" : "0");
  window.dispatchEvent(new Event(RUTA_EVENT));
}

export function useRutaIniciada() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const sync = () => setV(rutaIniciada());
    sync();
    window.addEventListener(RUTA_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(RUTA_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return v;
}

// --- Reservas de cosecha compartida (para la proyección de volumen) ---

export type Reserva = { producerSlug: string; plan: string; semanas: number; kgSemana: number; at: string };
const RESERVAS_KEY = "milpa-reservas";

export function readReservas(): Reserva[] {
  if (typeof window === "undefined") return [];
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(RESERVAS_KEY) || "[]");
    return Array.isArray(data) ? (data as Reserva[]) : [];
  } catch {
    return [];
  }
}

export function addReserva(r: Omit<Reserva, "at">) {
  window.localStorage.setItem(RESERVAS_KEY, JSON.stringify([...readReservas(), { ...r, at: new Date().toISOString() }]));
}
