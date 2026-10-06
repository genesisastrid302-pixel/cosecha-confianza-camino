import { useEffect, useMemo, useState } from "react";
import { getProducer, unitLabel } from "@/lib/data";
import { codigoDe, misPedidos, repartidor, tituloPedidoProductor, useOrders, type Order, type OrderStatus } from "@/lib/orders";
import { LOCAL_DISTRIBUIDOR, fueEntregado, readReservas } from "@/lib/distribucion";
import { APORTACION_SOCIO, listarCuentas } from "@/lib/producer-store";
import { sesionDe } from "@/lib/acceso";

/**
 * Notificaciones de los tres roles.
 * No se guardan aparte: se derivan de lo que ya pasó en cada pedido (su historial),
 * de las reservas y de las cosechas compartidas. Así nunca se desfasan de la app.
 * Lo único que se guarda es hasta cuándo las vio cada rol.
 */

export type Rol = "consumidor" | "productor" | "distribuidor";

export type Aviso = {
  id: string;
  at: string;
  titulo: string;
  detalle: string;
  /** Pedido del que habla, si viene de uno */
  pedido?: string;
  /** Pantalla a la que lleva */
  href: string;
  alerta?: boolean;
};

const resumen = (o: Order) => o.items.map((i) => `${i.quantity} ${unitLabel(i.unit, i.quantity)} ${i.name.toLowerCase()}`).join(", ");
const nombres = (o: Order) => [...new Set(o.items.map((i) => getProducer(i.producerSlug).name.split(" ")[0]))].join(" y ");

function deUnPedido(rol: Rol, o: Order): Aviso[] {
  const out: Aviso[] = [];
  const add = (status: OrderStatus, at: string, a: Omit<Aviso, "id" | "at" | "pedido">) => out.push({ id: `${o.id}-${status}-${at}`, at, pedido: o.id, ...a });
  const pedidoProductor = `/productor/pedido/${o.id}`;

  o.history.forEach((h, idx) => {
    // ¿Este "empacado" viene después de un problema ya corregido?
    const reempacado = h.status === "empacado" && o.history.slice(0, idx).some((x) => x.status === "con_problema");

    if (rol === "productor") {
      if (h.status === "nuevo")
        add(h.status, h.at, { titulo: `Nuevo pedido #${o.id}`, detalle: `${o.cliente} pidió ${resumen(o)}. Confirma antes de las 18:00.`, href: pedidoProductor });
      if (h.status === "con_problema")
        add(h.status, h.at, {
          titulo: `Problema en la recolección de #${o.id}`,
          detalle: `${repartidor(o, true)} reportó: ${o.problema?.motivo ?? "revisa el pedido"}. Corrígelo para que vuelva a la ruta.`,
          href: pedidoProductor,
          alerta: true,
        });
      if (h.status === "en_recoleccion")
        add(h.status, h.at, {
          titulo: `${repartidor(o, true)} ${o.traslado === "productor_lleva" ? "recibió" : "recolectó"} el pedido #${o.id}`,
          detalle: "Su registro en la recolección cuenta para tu score.",
          href: pedidoProductor,
        });
      if (h.status === "entregado")
        add(h.status, h.at, { titulo: `Pedido #${o.id} entregado`, detalle: `Llegó con ${o.cliente}; tu pago se libera cuando confirme que lo recibió.`, href: pedidoProductor });
      if (h.status === "recibido") {
        const neto = o.subtotal - Math.round(o.subtotal * APORTACION_SOCIO) / 100;
        add(h.status, h.at, { titulo: `Pago liberado: $${neto.toLocaleString("es-MX", { minimumFractionDigits: Number.isInteger(neto) ? 0 : 2, maximumFractionDigits: 2 })}`, detalle: `${o.cliente} confirmó que recibió #${o.id}.`, href: "/productor/finanzas" });
      }
      if (h.status === "calificado" && o.feedback) {
        const mala = o.feedback.estrellas <= 2 || o.feedback.merma;
        add(h.status, h.at, {
          titulo: `${o.cliente} te calificó con ${o.feedback.estrellas} de 5`,
          detalle: `${o.feedback.nota ? `“${o.feedback.nota}”` : "Sin comentario."}${o.feedback.merma ? " Reportó merma al recibir." : ""}${mala ? " Revísalo: afecta tu score." : ""}`,
          href: pedidoProductor,
          alerta: mala,
        });
      }
    }

    if (rol === "consumidor") {
      const href = "/consumidor/pedidos";
      if (h.status === "aceptado") add(h.status, h.at, { titulo: "Tu pedido fue aceptado", detalle: `${nombres(o)} confirmó el pedido #${o.id}.`, href });
      if (h.status === "rechazado")
        add(h.status, h.at, {
          titulo: "No se pudo surtir tu pedido",
          detalle: `${nombres(o)} no puede entregar #${o.id} esta vez. ${o.pago === "Efectivo" ? "No se te cobra nada." : "Se te devuelve tu pago."}`,
          href,
          alerta: true,
        });
      if (h.status === "empacado")
        add(h.status, h.at, {
          titulo: reempacado ? "Tu pedido está listo otra vez" : "Están empacando tu pedido",
          detalle: reempacado ? `El problema de #${o.id} quedó corregido.` : `#${o.id} · Lote ${Object.values(o.lots).join(", ")} con su QR de trazabilidad.`,
          href,
        });
      if (h.status === "con_problema")
        add(h.status, h.at, {
          titulo: "Estamos revisando tu pedido",
          detalle: `Al recolectar #${o.id} se encontró un detalle y el productor lo está corrigiendo.`,
          href,
          alerta: true,
        });
      if (h.status === "en_ruta")
        add(h.status, h.at, { titulo: "Tu pedido va en camino", detalle: `Código de entrega ${codigoDe(o)}: dáselo a ${repartidor(o)} al recibir #${o.id}.`, href });
      if (h.status === "entregado")
        add(h.status, h.at, { titulo: "Tu canasta fue entregada", detalle: `Confirma que llegó #${o.id}, escanea su QR y califícala.`, href });
    }

    if (rol === "distribuidor") {
      if (h.status === "aceptado")
        add(h.status, h.at, { titulo: `Pedido #${o.id} confirmado`, detalle: `${nombres(o)} lo está preparando. Entra a tu ruta cuando lo empaque.`, href: "/distribuidor" });
      if (h.status === "empacado")
        add(h.status, h.at, {
          titulo: reempacado ? `#${o.id} listo otra vez` : `Recolección lista: ${nombres(o)}`,
          detalle:
            o.traslado === "productor_lleva"
              ? `#${o.id} · El productor lo lleva a ${LOCAL_DISTRIBUIDOR}.`
              : `#${o.id} · Recoge en ${[...new Set(o.items.map((i) => getProducer(i.producerSlug).region))].join(" y ")}.`,
          href: "/distribuidor/ruta",
        });
      if (h.status === "recibido")
        add(h.status, h.at, { titulo: `${o.cliente} confirmó su entrega`, detalle: `#${o.id} cerrado. Tu logística ya aparece en Finanzas.`, href: "/distribuidor/finanzas" });
    }
  });
  return out;
}

export function avisosDe(rol: Rol, orders: Order[]): Aviso[] {
  if (typeof window === "undefined") return [];
  // El consumidor solo recibe avisos de sus propios pedidos
  const propios = rol === "consumidor" ? misPedidos(orders) : orders;
  const out = propios.flatMap((o) => deUnPedido(rol, o));

  if (rol === "productor") {
    readReservas().forEach((r) =>
      out.push({
        id: `reserva-${r.at}`,
        at: r.at,
        titulo: "Nueva reserva de cosecha compartida",
        detalle: `Plan ${r.plan} · ${r.semanas} semanas · ${r.kgSemana} kg por semana.`,
        href: "/productor/catalogo",
      }),
    );
  }

  // Nueva cosecha compartida → a consumidores que ya compraron
  if (rol === "consumidor" && propios.length > 0) {
    listarCuentas().forEach(({ state }) =>
      state.cosechas.forEach((c) => {
        if (!c.creadaEn) return;
        out.push({
          id: `cosecha-${c.id}`,
          at: c.creadaEn,
          titulo: `Nueva cosecha compartida: ${c.cropName}`,
          detalle: `${state.profile.name} abrió reservas. Aparta tu parte antes de la siembra.`,
          href: "/consumidor/cosecha",
        });
      }),
    );
  }

  // Más reciente primero; si dos pasaron al mismo tiempo, primero el que va después en el historial
  return out
    .map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.at.localeCompare(x.a.at) || y.i - x.i)
    .map(({ a }) => a);
}

// --- Avisos agrupados por pedido ---

/** Pantalla del pedido para cada rol; la etiqueta es el título de esa pantalla */
export function destinoPedido(rol: Rol, o: Order): { href: string; label: string } | undefined {
  if (rol === "consumidor") return { href: "/consumidor/pedidos", label: "Pedidos" };
  if (rol === "productor") return { href: `/productor/pedido/${o.id}`, label: tituloPedidoProductor(o) };
  if (o.status === "empacado" || o.status === "en_recoleccion") return { href: "/distribuidor/ruta", label: "Ruta" };
  if (o.status === "en_ruta") return { href: `/distribuidor/entrega/${o.id}`, label: o.cliente };
  if (fueEntregado(o)) return { href: "/distribuidor/finanzas", label: "Finanzas" };
  return undefined;
}

export type GrupoPedido = { order: Order; avisos: Aviso[]; at: string };

/** Una sección por pedido (la más reciente arriba) y aparte los avisos que no son de un pedido */
export function agruparPorPedido(avisos: Aviso[], orders: Order[]) {
  const grupos = new Map<string, GrupoPedido>();
  const sueltos: Aviso[] = [];
  for (const a of avisos) {
    const order = a.pedido ? orders.find((o) => o.id === a.pedido) : undefined;
    if (!order) {
      sueltos.push(a);
      continue;
    }
    const g = grupos.get(order.id) ?? { order, avisos: [], at: a.at };
    g.avisos.push(a);
    if (a.at > g.at) g.at = a.at;
    grupos.set(order.id, g);
  }
  return { grupos: [...grupos.values()].sort((a, b) => b.at.localeCompare(a.at)), sueltos };
}

// --- Hasta cuándo vio sus avisos cada rol ---

const VISTOS_KEY = "milpa-avisos-vistos";
const VISTOS_EVENT = "milpa-avisos-change";

/** Cada cuenta lleva su propia marca de "visto" */
const llave = (rol: Rol) => `${rol}:${sesionDe(rol) ?? ""}`;

function readVistos(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(VISTOS_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Hasta cuándo vio sus avisos este rol ("" si nunca ha entrado) */
export function leerVisto(rol: Rol) {
  return readVistos()[llave(rol)] ?? "";
}

export function marcarVistos(rol: Rol) {
  window.localStorage.setItem(VISTOS_KEY, JSON.stringify({ ...readVistos(), [llave(rol)]: new Date().toISOString() }));
  window.dispatchEvent(new Event(VISTOS_EVENT));
}

export function useAvisos(rol: Rol) {
  const orders = useOrders();
  const [visto, setVisto] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const sync = () => {
      setVisto(leerVisto(rol));
      setTick((t) => t + 1);
    };
    sync();
    const eventos = [VISTOS_EVENT, "storage", "milpa-productor-change", "milpa-sesion-change"];
    eventos.forEach((e) => window.addEventListener(e, sync));
    return () => eventos.forEach((e) => window.removeEventListener(e, sync));
  }, [rol]);
  // tick: vuelve a leer reservas y cosechas, que no viven en los pedidos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const avisos = useMemo(() => avisosDe(rol, orders), [rol, orders, tick]);
  return { avisos, visto, nuevos: avisos.filter((a) => a.at > visto).length };
}
