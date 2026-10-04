import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { unitLabel } from "@/lib/data";
import { useOrders, STATUS_LABEL, formatTime, type Order, type OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/productor/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos · Productor — Milpa" }] }),
  component: Pedidos,
});

type Filtro = "Pendientes" | "En proceso" | "Entregados";

const GRUPO: Record<OrderStatus, Filtro | null> = {
  nuevo: "Pendientes",
  aceptado: "En proceso",
  empacado: "En proceso",
  en_recoleccion: "En proceso",
  en_ruta: "En proceso",
  con_problema: "En proceso",
  entregado: "Entregados",
  recibido: "Entregados",
  calificado: "Entregados",
  rechazado: null,
};

// Pedidos de ejemplo para que la pantalla no se vea vacía en la demo
const ejemplos = [
  { id: "MLP-0517", who: "Ximena R.", zone: "San Pedro", items: "1 kg chiles serranos", total: 54, filtro: "En proceso" as Filtro, nota: "✓ Empacado · QR generado" },
  { id: "MLP-0516", who: "Jorge T.", zone: "Cumbres", items: "Canasta semanal", total: 320, filtro: "Entregados" as Filtro, nota: "✓ Pago recibido · ★★★★★" },
  { id: "MLP-0515", who: "Marta L.", zone: "Linda Vista", items: "3 kg jitomate", total: 204, filtro: "Entregados" as Filtro, nota: "✓ Pago recibido · ★★★★☆" },
];

function Pedidos() {
  const orders = useOrders();
  const [filtro, setFiltro] = useState<Filtro>("Pendientes");
  const reales = orders.filter((o) => GRUPO[o.status] === filtro);
  const demo = ejemplos.filter((e) => e.filtro === filtro);
  const pendientes = orders.filter((o) => o.status === "nuevo").length;

  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Esta semana" title="Pedidos">
      <div className="px-5">
        <div className="flex gap-2 text-xs">
          {(["Pendientes", "En proceso", "Entregados"] as Filtro[]).map((t) => (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              className={`rounded-full px-3.5 py-1.5 ${filtro === t ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}
            >
              {t}
              {t === "Pendientes" && pendientes > 0 && <span className="ml-1.5 rounded-full bg-terracota px-1.5 text-[10px] text-white">{pendientes}</span>}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {reales.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
          {demo.map((e) => (
            <div key={e.id} className="rounded-2xl border-2 border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#{e.id} · ejemplo</div>
                  <div className="serif mt-1 text-base">{e.who} · {e.zone}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{e.items}</div>
                </div>
                <div className="serif text-xl">${e.total}</div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{e.nota}</div>
            </div>
          ))}
          {reales.length === 0 && demo.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No hay pedidos pendientes. Cuando un consumidor compre, aparece aquí.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function OrderCard({ order }: { order: Order }) {
  const nuevo = order.status === "nuevo";
  const accion =
    order.status === "nuevo" ? "Revisar y confirmar" : order.status === "aceptado" ? "Empacar y generar QR" : STATUS_LABEL[order.status];
  return (
    <Link
      to="/productor/pedido/$id"
      params={{ id: order.id }}
      className={`block rounded-2xl border-2 p-4 ${nuevo ? "border-dashed border-terracota/40 bg-terracota/5" : "border-primary/30 bg-primary/5"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#{order.id} · {formatTime(order.createdAt)}</div>
          <div className="serif mt-1 text-base">{order.cliente} · {order.entrega === "domicilio" ? "Domicilio" : "Recoge"}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {order.items.map((i) => `${i.quantity} ${unitLabel(i.unit, i.quantity)} ${i.name.toLowerCase()}`).join(" · ")}
          </div>
        </div>
        <div className="serif text-xl">${order.subtotal}</div>
      </div>
      <div className={`mt-3 flex items-center justify-between text-sm ${nuevo ? "text-terracota" : "text-primary"}`}>
        <span>{accion}</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
