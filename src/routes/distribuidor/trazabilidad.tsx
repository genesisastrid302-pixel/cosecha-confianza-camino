import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Snowflake } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { getProducer } from "@/lib/data";
import { LinkTrazabilidad } from "@/components/LinkTrazabilidad";
import { STATUS_LABEL, formatTime, siguientePaso, useOrders } from "@/lib/orders";

export const Route = createFileRoute("/distribuidor/trazabilidad")({
  head: () => ({ meta: [{ title: "Trazabilidad · Distribuidor — Milpa" }] }),
  component: Trazabilidad,
});

function Trazabilidad() {
  // Un lote existe desde que el productor empaca y genera el QR
  const orders = useOrders().filter((o) => o.empaque);
  return (
    <AppShell
      tabs={distribuidorTabs}
      tone="miel"
      eyebrow="Lotes y cadena de frío"
      title="Trazabilidad"
      back={
        <Link to="/distribuidor" aria-label="Volver al inicio" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-4 px-5">
        {orders.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
            Aún no hay lotes. Aparecen cuando el productor empaca y genera el QR del pedido.
          </p>
        )}
        {orders.flatMap((o) =>
          Object.entries(o.lots).map(([slug, lote]) => {
            const enCurso = !["entregado", "recibido", "calificado"].includes(o.status);
            return (
              <div key={`${o.id}-${slug}`} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="serif text-base">Lote {lote}</div>
                  <span className={`text-[10px] uppercase tracking-widest ${o.status === "con_problema" ? "text-destructive" : enCurso ? "text-terracota" : "text-primary"}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex justify-between"><span>Pedido</span><span>#{o.id}</span></li>
                  <li className="flex justify-between"><span>Productor</span><span>{getProducer(slug).name}</span></li>
                  <li className="flex justify-between"><span>Empacado</span><span>{formatTime(o.empaque!.registradoEn)} · {o.empaque!.tipo}</span></li>
                  <li className="flex justify-between">
                    <span className="flex items-center gap-1"><Snowflake className="h-3 w-3" /> Cadena de frío</span>
                    <span>
                      {o.empaque!.temperatura} °C al empacar
                      {o.temperaturaRecoleccion !== undefined ? ` · ${o.temperaturaRecoleccion} °C ${o.traslado === "productor_lleva" ? "al recibirlo" : "al recolectar"}` : ""}
                    </span>
                  </li>
                  <li className="flex justify-between gap-3"><span>Sigue</span><span className="text-right">{siguientePaso(o)}</span></li>
                  <li className="flex justify-between gap-3"><span>Destino</span><span className="text-right">{o.direccion}</span></li>
                  {o.problema && (
                    <li className={`flex justify-between gap-3 ${o.status === "con_problema" ? "text-destructive" : ""}`}>
                      <span>{o.status === "con_problema" ? "Problema" : "Problema resuelto"}</span>
                      <span className="text-right">{o.problema.motivo}</span>
                    </li>
                  )}
                  {o.merma && o.merma.lote === lote && <li className="flex justify-between text-destructive"><span>Merma</span><span>{o.merma.kg} kg · {o.merma.motivo}</span></li>}
                </ul>
                <LinkTrazabilidad id={o.id} className="mt-3 bg-background" />
              </div>
            );
          }),
        )}
      </div>
    </AppShell>
  );
}
