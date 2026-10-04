import { createFileRoute, Link } from "@tanstack/react-router";
import { Landmark, Clock3, CheckCircle2, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { cobroCompleto, cobroResumen, useProducer } from "@/lib/producer-store";
import { useOrders, formatTime, type Order } from "@/lib/orders";

export const Route = createFileRoute("/productor/finanzas")({
  head: () => ({
    meta: [{ title: "Finanzas · Productor — Milpa" }, { name: "description", content: "Ventas, pagos y cuenta de cobro del productor." }],
  }),
  component: Finanzas,
});

/** El productor cobra cuando el consumidor confirma su canasta (o pasan 24 h) */
const PAGADO: Order["status"][] = ["recibido", "calificado"];

function Finanzas() {
  const [state] = useProducer();
  const orders = useOrders().filter((o) => o.status !== "rechazado");
  const p = state.profile;
  const pagado = orders.filter((o) => PAGADO.includes(o.status)).reduce((n, o) => n + o.subtotal, 0);
  const porCobrar = orders.filter((o) => !PAGADO.includes(o.status)).reduce((n, o) => n + o.subtotal, 0);

  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tus ingresos" title="Finanzas">
      <div className="space-y-5 px-5">
        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Por cobrar" value={`$${porCobrar}`} />
          <Kpi label="Cobrado" value={`$${pagado}`} />
        </div>

        <Link
          to="/productor/perfil"
          className={`flex items-center gap-3 rounded-2xl border p-4 ${cobroCompleto(p) ? "border-border bg-card" : "border-terracota/40 bg-terracota/5"}`}
        >
          {cobroCompleto(p) ? <Landmark className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-terracota" />}
          <div className="flex-1">
            <div className="text-sm">{cobroCompleto(p) ? "Tus pagos llegan a" : "Completa tu cuenta de cobro"}</div>
            <div className="text-[11px] text-muted-foreground">
              {cobroCompleto(p) ? `${cobroResumen(p)}${p.pago === "CLABE" ? ` · ${p.titular}` : ""}` : "Sin ella no podemos enviarte lo que vendes."}
            </div>
          </div>
        </Link>

        <div className="rounded-2xl bg-primary/10 p-4 text-xs leading-relaxed">
          Recibes el <strong>100% del precio de tus productos</strong>. La logística, la cadena de frío y la plataforma
          las paga el consumidor aparte. El pago se reparte en automático cuando el consumidor confirma que recibió su canasta.
        </div>

        <section>
          <div className="eyebrow">Historial de ventas</div>
          <div className="mt-3 space-y-2">
            {orders.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Aún no tienes ventas en la app.</p>}
            {orders.map((o) => {
              const ok = PAGADO.includes(o.status);
              return (
                <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  {ok ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Clock3 className="h-5 w-5 text-miel" />}
                  <div className="flex-1">
                    <div className="text-sm">#{o.id} · {o.cliente}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatTime(o.createdAt)} · {ok ? "Pagado" : "Se paga al confirmar la entrega"}
                    </div>
                  </div>
                  <div className="serif text-base">${o.subtotal}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="serif text-2xl">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
