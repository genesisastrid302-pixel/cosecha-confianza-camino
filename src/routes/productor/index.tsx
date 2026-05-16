import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Bell, TrendingDown, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/productor/")({
  head: () => ({ meta: [{ title: "Inicio · Productor — Milpa" }] }),
  component: ProductorHome,
});

function ProductorHome() {
  return (
    <AppShell
      tabs={productorTabs}
      tone="milpa"
      eyebrow="Buenos días"
      title="Santiago"
      right={
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-terracota" />
        </button>
      }
    >
      <div className="space-y-6 px-5">
        {/* Hero KPI: ¿Cuántos kg necesito? */}
        <Link
          to="/productor/pedidos"
          className="block rounded-2xl bg-primary p-5 text-primary-foreground shadow-paper"
        >
          <div className="text-[11px] tracking-widest uppercase opacity-80">Para esta semana</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="display text-6xl">14.2</span>
            <span className="text-lg opacity-80">kg comprometidos</span>
          </div>
          <div className="mt-3 text-sm opacity-90">
            Jitomate · Cilantro · Chiles · 3 pedidos nuevos hoy
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-paper/20">
            <div className="h-full w-[68%] rounded-full bg-paper" />
          </div>
          <div className="mt-2 text-xs opacity-80">68% de tu capacidad estimada</div>
        </Link>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <Kpi icon={CheckCircle2} label="Entregas a tiempo" value="96%" tone="primary" />
          <Kpi icon={TrendingDown} label="Merma del mes" value="↓ 8%" tone="primary" />
          <Kpi icon={Clock} label="Próxima cosecha" value="3 días" tone="miel" />
          <Kpi icon={Bell} label="Score" value="94/100" tone="terracota" />
        </div>

        {/* Acciones del flujo */}
        <section>
          <div className="eyebrow">Acciones rápidas</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ActionCard to="/productor/transparencia" title="Subir evidencia" subtitle="Foto del cultivo" />
            <ActionCard to="/productor/catalogo" title="Nueva temporada" subtitle="Agregar cultivo" />
            <ActionCard to="/productor/pedidos" title="Confirmar pedido" subtitle="2 pendientes" highlight />
            <ActionCard to="/productor/perfil" title="Ver analítica" subtitle="Merma y entregas" />
          </div>
        </section>

        {/* Pedido pendiente activación */}
        <section>
          <div className="eyebrow">Esperando tu confirmación</div>
          <div className="mt-3 rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="serif text-lg">Pedido #MLP-0518</div>
                <div className="text-xs text-muted-foreground">Adriana M. · Col. Roma · 2 kg jitomate, 1 manojo cilantro</div>
              </div>
              <div className="text-right">
                <div className="serif text-xl text-terracota">$158</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-full bg-primary py-2.5 text-sm text-primary-foreground">
                Puedo entregar
              </button>
              <button className="rounded-full border border-border px-4 text-sm text-muted-foreground">
                Detalle
              </button>
            </div>
            <p className="mt-3 text-[11px] italic text-muted-foreground">
              Al confirmar, el distribuidor recibe la asignación de recolección.
            </p>
          </div>
        </section>
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
