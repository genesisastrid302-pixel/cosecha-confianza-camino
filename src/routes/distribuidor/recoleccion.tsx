import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";

export const Route = createFileRoute("/distribuidor/recoleccion")({
  head: () => ({ meta: [{ title: "Recolección · Distribuidor — Milpa" }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Parada 1 de 4" title="Ezequiel M.">
      <div className="space-y-4 px-5">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Productor</div>
          <div className="serif mt-1 text-xl">Ezequiel Martínez</div>
          <div className="text-xs text-muted-foreground">Ramos Arizpe · 8.4 km de tu posición</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="eyebrow">Lote a recolectar</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span>Jitomate heirloom</span><span>12.4 kg</span></li>
            <li className="flex justify-between"><span>Cilantro fresco</span><span>8 manojos</span></li>
            <li className="flex justify-between"><span>Chiles serranos</span><span>3 kg</span></li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="eyebrow">Registro de condiciones</div>
          <Field label="Temperatura cámara" value="6 °C" />
          <Field label="Estado visual" value="Óptimo" />
          <Field label="Merma en tramo" value="0 kg" />
        </div>

        <button className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground">Confirmar recolección</button>
        <button className="w-full rounded-full border border-border py-3 text-sm text-muted-foreground">Reportar incidencia</button>
      </div>
    </AppShell>
  ),
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
