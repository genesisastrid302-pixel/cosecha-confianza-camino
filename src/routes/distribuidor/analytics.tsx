import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { formatTime, pesoPedido, useOrders } from "@/lib/orders";
import { kpis } from "@/lib/distribucion";

export const Route = createFileRoute("/distribuidor/analytics")({
  head: () => ({ meta: [{ title: "Rendimiento · Distribuidor — Milpa" }] }),
  component: Rendimiento,
});

function Rendimiento() {
  const orders = useOrders();
  const k = kpis(orders);
  const mermas = orders.filter((o) => o.merma);
  const problemas = orders.filter((o) => o.problema);
  return (
    <AppShell
      tabs={distribuidorTabs}
      tone="miel"
      eyebrow="Entregas y merma"
      title="Rendimiento"
      right={
        <Link to="/distribuidor" aria-label="Volver al inicio" className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-5 px-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Kpi n={`${k.aTiempoPct}%`} l="Entregas a tiempo" />
          <Kpi n={`${k.mermaPct}%`} l="Merma" alerta />
          <Kpi n={String(k.entregas)} l="Entregas" />
        </div>
        <p className="text-[11px] text-muted-foreground">
          La merma se calcula sola: kilos perdidos entre kilos entregados. Incluye tu historial y lo que registras después de cada entrega.
        </p>

        <section>
          <div className="eyebrow flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> Registro de merma</div>
          <div className="mt-3 space-y-2">
            {mermas.length === 0 && <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Sin merma registrada en tus entregas recientes.</p>}
            {mermas.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                {o.merma!.foto && <img src={o.merma!.foto} alt="Evidencia" className="h-12 w-12 rounded-lg object-cover" />}
                <div className="flex-1 text-sm">
                  Lote {o.merma!.lote} · {o.merma!.motivo}
                  <div className="text-[11px] text-muted-foreground">#{o.id} · {formatTime(o.merma!.at)}</div>
                </div>
                <div className="text-right">
                  <div className="serif text-base text-destructive">{o.merma!.kg} kg</div>
                  <div className="text-[10px] text-muted-foreground">{Math.round((o.merma!.kg / pesoPedido(o)) * 100)}% del pedido</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="eyebrow">Problemas reportados en recolección</div>
          <div className="mt-3 space-y-2">
            {problemas.length === 0 && <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Sin problemas reportados.</p>}
            {problemas.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-3 text-sm">
                #{o.id} · {o.problema!.motivo}
                <div className="text-[11px] text-muted-foreground">{o.problema!.detalle} · {formatTime(o.problema!.at)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({ n, l, alerta }: { n: string; l: string; alerta?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${alerta ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"}`}>
      <div className={`serif text-2xl ${alerta ? "text-destructive" : ""}`}>{n}</div>
      <div className="mt-0.5 text-[9px] uppercase leading-tight tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}
