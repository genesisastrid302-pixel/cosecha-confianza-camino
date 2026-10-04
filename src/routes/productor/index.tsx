import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Bell, TrendingDown, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { profileCompleteness, trustScore, updateProducer, useProducer } from "@/lib/producer-store";
import { CompletenessCard } from "@/components/ProductorForm";
import { useEffect } from "react";
import { useOrders, updateOrder } from "@/lib/orders";
import { unitLabel } from "@/lib/data";

export const Route = createFileRoute("/productor/")({
  head: () => ({ meta: [{ title: "Inicio · Productor — Milpa" }] }),
  component: ProductorHome,
});

function ProductorHome() {
  const [state] = useProducer();
  const orders = useOrders();
  const nuevos = orders.filter((o) => o.status === "nuevo");
  const activos = orders.filter((o) => ["aceptado", "empacado", "en_recoleccion", "en_ruta", "con_problema"].includes(o.status));
  const pendiente = nuevos[0];
  const kgSold = 312 + state.crops.reduce((n, c) => n + Math.max(0, c.kgEstimated - c.kgAvailable), 0);
  return (
    <AppShell
      tabs={productorTabs}
      tone="milpa"
      eyebrow="Buenos días"
      title={state.profile.name.split(" ")[0] || "Productor"}
      right={
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-terracota" />
        </button>
      }
    >
      <div className="space-y-6 px-5">
        <ScoreCard />

        <div className="grid grid-cols-2 gap-3">
          <Kpi icon={Bell} label="Pedidos activos" value={String(activos.length + nuevos.length)} tone="terracota" />
          <Kpi icon={CheckCircle2} label="Kg vendidos" value={`${kgSold} kg`} tone="primary" />
          <Kpi icon={TrendingDown} label="Merma del mes" value="↓ 8%" tone="primary" />
          <Kpi icon={Clock} label="Próxima cosecha" value="3 días" tone="miel" />
        </div>

        {/* Acciones del flujo */}
        <section>
          <div className="eyebrow">Acciones rápidas</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ActionCard to="/productor/transparencia" title="Subir evidencia" subtitle="Foto del cultivo" />
            <ActionCard to="/productor/catalogo" title="Nueva temporada" subtitle="Agregar cultivo" />
            <ActionCard to="/productor/pedidos" title="Confirmar pedido" subtitle={nuevos.length ? `${nuevos.length} pendiente${nuevos.length > 1 ? "s" : ""}` : "Sin pendientes"} highlight={nuevos.length > 0} />
            <ActionCard to="/productor/perfil" title="Ver analítica" subtitle="Merma y entregas" />
          </div>
        </section>

        {/* Pedido pendiente de confirmar */}
        {pendiente && (
          <section>
            <div className="eyebrow">Esperando tu confirmación</div>
            <div className="mt-3 rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="serif text-lg">Pedido #{pendiente.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {pendiente.cliente} · {pendiente.items.map((i) => `${i.quantity} ${unitLabel(i.unit)} ${i.name.toLowerCase()}`).join(", ")}
                  </div>
                </div>
                <div className="serif text-xl text-terracota">${pendiente.subtotal}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/productor/pedido/$id"
                  params={{ id: pendiente.id }}
                  onClick={() => updateOrder(pendiente.id, { status: "aceptado" })}
                  className="flex-1 rounded-full bg-primary py-2.5 text-center text-sm text-primary-foreground"
                >
                  Puedo entregar
                </Link>
                <Link
                  to="/productor/pedido/$id"
                  params={{ id: pendiente.id }}
                  className="rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground"
                >
                  Detalle
                </Link>
              </div>
              <p className="mt-3 text-[11px] italic text-muted-foreground">
                Después empacas, registras la cadena de frío y generas el QR.
              </p>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Bell; label: string; value: string; tone: "primary" | "miel" | "terracota" }) {
  const c = { primary: "text-primary", miel: "text-miel", terracota: "text-terracota" }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className={`h-4 w-4 ${c}`} />
      <div className="serif mt-3 text-2xl">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ActionCard({ to, title, subtitle, highlight }: { to: string; title: string; subtitle: string; highlight?: boolean }) {
  return (
    <Link
      to={to}
      className={`rounded-2xl p-4 ${highlight ? "bg-foreground text-background" : "border border-border bg-card text-foreground"}`}
    >
      <div className="serif text-base leading-tight">{title}</div>
      <div className={`mt-1 text-[11px] ${highlight ? "text-background/70" : "text-muted-foreground"}`}>{subtitle}</div>
    </Link>
  );
}

function ScoreCard() {
  const [state, ready] = useProducer();
  const { total, components } = trustScore(state);
  const { pct, checks } = profileCompleteness(state.profile);
  // lastScore guardado antes en escala de 100 se ignora
  const last = state.lastScore !== null && state.lastScore <= 10 ? state.lastScore : null;
  const dropped = last !== null && total < last;

  useEffect(() => {
    if (!ready) return;
    if (last === null || total > last) updateProducer((s) => ({ ...s, lastScore: total }));
  }, [ready, total, last]);

  return (
    <div className="space-y-3">
      {dropped && (
        <div className="flex items-start gap-3 rounded-2xl border border-terracota/40 bg-terracota/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Tu Score bajó de {last?.toFixed(1)} a {total.toFixed(1)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Revisa los componentes de abajo para saber qué mejorar.</p>
            <button onClick={() => updateProducer((s) => ({ ...s, lastScore: total }))} className="mt-2 text-xs underline">Entendido</button>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-paper">
        <div className="text-[11px] tracking-widest uppercase opacity-80">Score de confianza</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="display text-6xl">{total.toFixed(1)}</span>
          <span className="text-lg opacity-80">/ 10</span>
        </div>
        <p className="mt-1 text-xs opacity-80">Lo calcula el sistema. Es lo que ven las familias antes de comprarte.</p>
        <div className="mt-4 space-y-2.5">
          {components.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-xs">
                <span>{c.label} <span className="opacity-70">· {c.weight}%</span></span>
                <span>{(c.value / 10).toFixed(1)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper/20">
                <div className="h-full rounded-full bg-paper" style={{ width: `${c.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {pct < 100 && <CompletenessCard pct={pct} checks={checks} />}
    </div>
  );
}
