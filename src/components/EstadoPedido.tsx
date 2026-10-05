import { ArrowRight } from "lucide-react";
import { STATUS_LABEL, formatTime, siguientePaso, type Order } from "@/lib/orders";

/** Estado actual del pedido y qué sigue; igual en consumidor, productor, distribuidor y trazabilidad */
export function EstadoPedido({ order, className = "" }: { order: Order; className?: string }) {
  const ultimo = order.history[order.history.length - 1];
  const problema = order.status === "con_problema";
  return (
    <section className={`rounded-2xl border p-4 ${problema ? "border-terracota/40 bg-terracota/5" : "border-border bg-card"} ${className}`}>
      <div className="eyebrow">Estado del pedido #{order.id}</div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className={`serif text-lg leading-tight ${problema ? "text-terracota" : ""}`}>{STATUS_LABEL[order.status]}</span>
        {ultimo && <span className="shrink-0 text-[11px] text-muted-foreground">{formatTime(ultimo.at)}</span>}
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          <span className="font-medium text-foreground">Sigue:</span> {siguientePaso(order)}
        </span>
      </p>
    </section>
  );
}
