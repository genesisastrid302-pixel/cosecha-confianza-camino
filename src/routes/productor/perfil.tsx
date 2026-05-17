import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import santiago from "@/assets/producer-santiago.jpg";
import { ChevronRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/productor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Productor — Milpa" }] }),
  component: Perfil,
});

function Perfil() {
  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tu perfil" title="Ezequiel Martínez">
      <div className="space-y-6 px-5">
        <div className="flex items-center gap-4">
          <img src={santiago} alt="Ezequiel" className="h-20 w-20 rounded-full object-cover" />
          <div>
            <div className="text-sm">Ramos Arizpe, Coahuila</div>
            <div className="text-xs text-muted-foreground">12 años cultivando · 184 familias</div>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
              Score 94 / 100
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat n="7" l="Cultivos" />
          <Stat n="184" l="Familias" />
          <Stat n="$48k" l="Mes" />
        </div>

        <section>
          <div className="eyebrow">Cuenta</div>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            <Row label="Información personal" />
            <Row label="Método de cobro" detail="CoDi · CLABE" />
            <Row label="Ubicación de la parcela" detail="Ramos Arizpe" />
          </div>
        </section>

        <section>
          <div className="eyebrow">Negocio</div>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            <Row label="Ver analítica" detail="Merma y entregas" />
            <Row label="Suscripciones activas" detail="32 familias" />
            <Row label="Historial de pagos" />
          </div>
        </section>

        <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm text-muted-foreground">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Link>
      </div>
    </AppShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="serif text-2xl">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}

function Row({ label, detail }: { label: string; detail?: string }) {
  return (
    <button className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {detail} <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
