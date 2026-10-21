import { useEffect, useState } from "react";
import { Leaf, Sprout, TreeDeciduous, type LucideIcon } from "lucide-react";
import { sesionDe, suscribirSesion } from "@/lib/acceso";
import type { Entrega, MetodoPago, Order } from "@/lib/orders";

/**
 * Planes del consumidor: suscripción a una canasta semanal o quincenal y, después
 * de su 3ª canasta recibida, Cosecha compartida con un productor.
 * Prototipo sin backend: la suscripción se guarda en el navegador, una por cuenta.
 */

export type PlanId = "individual" | "pareja" | "familiar";

export type Plan = {
  id: PlanId;
  nombre: string;
  /** Precio por canasta; ya incluye entrega y plataforma */
  precio: number;
  personas: string;
  productos: string;
  nota: string;
  icono: LucideIcon;
  popular?: boolean;
  /** Kilos aproximados por canasta, solo para la proyección de volumen del productor y el distribuidor */
  kgSemana: number;
};

export const PLANES: Plan[] = [
  {
    id: "individual",
    nombre: "Individual",
    precio: 175,
    personas: "1 persona",
    productos: "4-5 productos de temporada",
    nota: "Verdura, fruta y hierbas frescas cada semana",
    icono: Sprout,
    popular: true,
    kgSemana: 3,
  },
  {
    id: "pareja",
    nombre: "Pareja",
    precio: 320,
    personas: "2 personas",
    productos: "6-8 productos de temporada",
    nota: "Variedad ampliada con cítricos y hortalizas",
    icono: Leaf,
    kgSemana: 5,
  },
  {
    id: "familiar",
    nombre: "Familiar",
    precio: 480,
    personas: "3-4 personas",
    productos: "10-12 productos de temporada",
    nota: "Canasta completa para toda la familia",
    icono: TreeDeciduous,
    kgSemana: 8,
  },
];

export const planDe = (id: string | undefined) => PLANES.find((p) => p.id === id);

export type Frecuencia = "semanal" | "quincenal";
export const FRECUENCIA_LABEL: Record<Frecuencia, string> = { semanal: "Cada semana", quincenal: "Cada 15 días" };

export type Suscripcion = {
  plan: PlanId;
  frecuencia: Frecuencia;
  entrega: Entrega;
  /** Dirección completa o punto de entrega */
  destino: string;
  pago: MetodoPago;
  estado: "activa" | "pausada";
  desde: string;
};

const KEY = "milpa-suscripciones";
const EVENT = "milpa-suscripcion-change";

function leerTodas(): Record<string, Suscripcion> {
  if (typeof window === "undefined") return {};
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) || "{}");
    return data && typeof data === "object" ? (data as Record<string, Suscripcion>) : {};
  } catch {
    return {};
  }
}

function escribir(id: string, s: Suscripcion | null) {
  const todas = leerTodas();
  if (s) todas[id] = s;
  else delete todas[id];
  window.localStorage.setItem(KEY, JSON.stringify(todas));
  window.dispatchEvent(new Event(EVENT));
}

/** Suscripción de la cuenta con sesión (null si no tiene) */
export function miSuscripcion(): Suscripcion | null {
  const id = sesionDe("consumidor");
  return (id && leerTodas()[id]) || null;
}

export function guardarSuscripcion(s: Omit<Suscripcion, "estado" | "desde">) {
  const id = sesionDe("consumidor");
  if (!id) return;
  const previa = leerTodas()[id];
  // Cambiar de plan conserva desde cuándo está suscrito
  escribir(id, { ...s, estado: "activa", desde: previa?.desde ?? new Date().toISOString() });
}

export function cambiarEstado(estado: Suscripcion["estado"]) {
  const id = sesionDe("consumidor");
  const s = miSuscripcion();
  if (id && s) escribir(id, { ...s, estado });
}

export function cancelarSuscripcion() {
  const id = sesionDe("consumidor");
  if (id) escribir(id, null);
}

/** `listo` es false hasta leer el navegador, para no mostrar "sin suscripción" por un instante */
export function useMiSuscripcion() {
  const [estado, setEstado] = useState<{ s: Suscripcion | null; listo: boolean }>({ s: null, listo: false });
  useEffect(() => {
    const sync = () => setEstado({ s: miSuscripcion(), listo: true });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    const quitar = suscribirSesion(sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
      quitar();
    };
  }, []);
  return estado;
}

// --- Cosecha compartida: se desbloquea con canastas recibidas de verdad ---

export const CANASTAS_PARA_COSECHA = 3;

/** Fechas en que el consumidor confirmó cada canasta, de la más vieja a la más nueva */
export function canastasRecibidas(pedidos: Order[]): string[] {
  return pedidos
    .map((o) => o.history.find((h) => h.status === "recibido")?.at)
    .filter((at): at is string => !!at)
    .sort();
}

/** Cuándo se desbloqueó (la fecha de su 3ª canasta) o null si aún no */
export function cosechaDesbloqueadaEn(pedidos: Order[]): string | null {
  return canastasRecibidas(pedidos)[CANASTAS_PARA_COSECHA - 1] ?? null;
}

export type Compromiso = {
  id: "prueba" | "temporada";
  nombre: string;
  semanas: number;
  descuento: number;
  detalle: string;
  nota: string;
  insignia?: string;
};

export const COMPROMISOS: Compromiso[] = [
  {
    id: "prueba",
    nombre: "Prueba",
    semanas: 4,
    descuento: 0,
    detalle: "4 semanas · Mismo precio que tu canasta",
    nota: "Prueba la experiencia sin costo extra",
    insignia: "Recomendado para empezar",
  },
  {
    id: "temporada",
    nombre: "Temporada",
    semanas: 12,
    descuento: 0.1,
    detalle: "12 semanas · 10% menos por semana",
    nota: "Acompaña al productor toda la temporada",
  },
];

/** Precio por semana de Cosecha compartida: el de la canasta, menos el descuento del compromiso */
export const precioCosecha = (plan: Plan, c: Compromiso) => Math.round(plan.precio * (1 - c.descuento));
