import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { MapPin, AlertTriangle } from "lucide-react";

const stops = [
  { n: 1, who: "Ezequiel M.", where: "Ramos Arizpe", kg: "12.4 kg", state: "pickup" },
  { n: 2, who: "Rosa M.", where: "Galeana", kg: "6 kg limón", state: "pickup" },
  { n: 3, who: "Adriana M.", where: "Col. Roma · MTY", kg: "2.5 kg", state: "drop" },
  { n: 4, who: "Jorge T.", where: "Cumbres", kg: "Canasta", state: "drop" },
];

export const Route = createFileRoute("/distribuidor/")({
  head: () => ({ meta: [{ title: "Ruta del día · Distribuidor — Milpa" }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Lunes 19 · Ruta MTY-04" title="Claudia">
      <div className="space-y-5 px-5">
        <div className="rounded-2xl bg-miel p-5 text-ink">
          <div className="text-[11px] tracking-widest uppercase opacity-70">LPO · Last Possible Order</div>
          <div className="display mt-1 text-4xl">2h 14m</div>
          <div className="mt-1 text-xs opacity-80">para confirmar pedidos de hoy</div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <Mini n="4" l="Paradas" />
          <Mini n="2" l="Pickups" />
          <Mini n="2" l="Entregas" />
          <Mini n="6 °C" l="Cámara" />
        </div>

        <div className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-3 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-terracota shrink-0" />
          <span>Pedido #MLP-0521 espera confirmación del productor antes de activarse.</span>
        </div>

        <section>
          <div className="eyebrow">Resumen de paradas</div>
          <div className="mt-3 space-y-2">
            {stops.map((s) => (
              <div key={s.n} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                  s.state === "pickup" ? "bg-primary/10 text-primary" : "bg-terracota/10 text-terracota"
                }`}>{s.n}</div>
                <div className="flex-1">
                  <div className="text-sm">{s.who} <span className="text-[10px] uppercase tracking-widest text-muted-foreground">· {s.state === "pickup" ? "Recolección" : "Entrega"}</span></div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.where}</div>
                </div>
                <div className="text-xs">{s.kg}</div>
              </div>
            ))}
          </div>
        </section>

        <button className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">Iniciar ruta</button>
      </div>
    </AppShell>
  ),
});

function Mini({ n, l }: { n: string; l: string }) {
  return <div className="rounded-xl border border-border bg-card p-2"><div className="serif text-lg">{n}</div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">{l}</div></div>;
}
