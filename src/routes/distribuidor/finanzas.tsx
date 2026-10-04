import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Banknote, CheckCircle2, Landmark } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { cobroDistribuidorCompleto } from "@/components/DistribuidorForm";
import { useDistributor } from "@/lib/accounts";
import { LOGISTICA, formatTime, useOrders } from "@/lib/orders";
import { finanzas } from "@/lib/distribucion";

export const Route = createFileRoute("/distribuidor/finanzas")({
  head: () => ({
    meta: [{ title: "Finanzas · Distribuidor — Milpa" }, { name: "description", content: "Ganancias por logística y efectivo cobrado del distribuidor." }],
  }),
  component: Finanzas,
});

function Finanzas() {
  const d = useDistributor();
  const f = finanzas(useOrders());
  const cuentaOk = cobroDistribuidorCompleto(d);
  const cuenta = d.cobro === "CLABE" ? `CLABE ${d.banco} ···${d.clabe.slice(-4)}` : `CoDi ···${d.codi.slice(-4)}`;
  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Tus ganancias" title="Finanzas">
      <div className="space-y-5 px-5">
        <div className="grid grid-cols-2 gap-3">
          <Kpi n={`$${f.logistica}`} l="Logística ganada" />
          <Kpi n={String(f.entregados.length)} l="Entregas" />
        </div>

        {f.efectivo > 0 && (
          <div className="rounded-2xl border-2 border-miel/50 bg-miel/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium"><Banknote className="h-4 w-4" /> Efectivo cobrado: ${f.efectivo}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              De ese efectivo te quedas tu logística. Te toca liquidar <strong className="text-foreground">${f.porLiquidar}</strong> a los productores y a Milpa.
            </p>
          </div>
        )}

        <Link to="/distribuidor/perfil" className={`flex items-center gap-3 rounded-2xl border p-4 ${cuentaOk ? "border-border bg-card" : "border-terracota/40 bg-terracota/5"}`}>
          {cuentaOk ? <Landmark className="h-5 w-5 text-miel" /> : <AlertTriangle className="h-5 w-5 text-terracota" />}
          <div className="flex-1">
            <div className="text-sm">{cuentaOk ? "Tus pagos llegan a" : "Falta tu cuenta de cobro"}</div>
            <div className="text-[11px] text-muted-foreground">{cuentaOk ? cuenta : "Regístrala para recibir tu logística."}</div>
          </div>
        </Link>

        <div className="rounded-2xl bg-secondary p-4 text-xs leading-relaxed">
          Ganas <strong>${LOGISTICA} de logística y cadena de frío</strong> por cada pedido entregado. Se reparte en automático cuando confirmas la entrega;
          si el pedido se pagó en efectivo, lo cobras tú al entregar.
        </div>

        <section>
          <div className="eyebrow">Entregas</div>
          <div className="mt-3 space-y-2">
            {f.entregados.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Aún no has entregado pedidos en la app.</p>}
            {f.entregados.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div className="flex-1 text-sm">
                  #{o.id} · {o.cliente}
                  <div className="text-[11px] text-muted-foreground">
                    {o.entregaRegistro ? formatTime(o.entregaRegistro.at) : ""} · {o.pago === "Efectivo" ? `Cobraste $${o.total} en efectivo` : `Pagado con ${o.pago}`}
                  </div>
                </div>
                <div className="serif text-base">+${LOGISTICA}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="serif text-2xl">{n}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}
