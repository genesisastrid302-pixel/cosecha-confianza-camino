import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { products, getProducer } from "@/lib/data";
import { Flame, Leaf, Lock } from "lucide-react";

export const Route = createFileRoute("/consumidor/racha")({
  head: () => ({
    meta: [
      { title: "Tu racha · Milpa" },
      { name: "description", content: "Semanas seguidas comprando directo del campo: tu racha, tu impacto y las insignias de temporada." },
      { property: "og:title", content: "Tu racha · Milpa" },
      { property: "og:description", content: "Semanas seguidas sosteniendo a productores agroecológicos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Racha,
});

const rangos = ["Semana", "Mes", "Año"] as const;

const semanas = [
  { l: "S15", ok: true }, { l: "S16", ok: true }, { l: "S17", ok: true },
  { l: "S18", ok: false }, { l: "S19", ok: true }, { l: "S20", ok: true },
  { l: "S21", ok: true }, { l: "S22", ok: true }, { l: "S23", ok: true },
  { l: "S24", ok: true }, { l: "S25", ok: true }, { l: "S26", ok: true },
];

const insignias = [
  { n: "Primer surco", d: "1ª entrega recibida", got: true },
  { n: "Manos de tierra", d: "5 semanas seguidas", got: true },
  { n: "Temporada entera", d: "12 semanas seguidas", got: true },
  { n: "Guardián de semilla", d: "Apadrinar una cosecha", got: true },
  { n: "Sin merma", d: "10 entregas sin desperdicio", got: false },
  { n: "Año de milpa", d: "52 semanas seguidas", got: false },
];

function Racha() {
  const [rango, setRango] = useState<(typeof rangos)[number]>("Mes");
  const actual = 9;

  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Adriana · Monterrey" title="Tu racha">
      <div className="space-y-5 px-5">
        <div className="flex gap-1.5 rounded-full bg-secondary p-1 text-xs">
          {rangos.map((r) => (
            <button
              key={r}
              onClick={() => setRango(r)}
              className={`flex-1 rounded-full py-1.5 ${r === rango ? "bg-miel text-ink" : "text-muted-foreground"}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Racha viva */}
        <div className="rounded-2xl bg-foreground p-6 text-background">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest opacity-70">
            <Flame className="h-3.5 w-3.5 text-miel" /> Semanas seguidas
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="display text-7xl leading-none">{actual}</span>
            <span className="text-sm opacity-70">semanas de campo</span>
          </div>
          <p className="mt-3 text-sm opacity-80">
            Tu mejor racha fue de 12. Recibe tu pedido de esta semana para no cortar el ciclo.
          </p>
          <div className="mt-4 flex gap-1">
            {semanas.map((s, i) => (
              <div
                key={i}
                title={s.l}
                className={`h-9 flex-1 rounded-md ${s.ok ? (i >= semanas.length - actual ? "bg-miel" : "bg-background/40") : "bg-background/12"}`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] uppercase tracking-wider opacity-50">
            <span>{semanas[0].l}</span>
            <span>{semanas[semanas.length - 1].l}</span>
          </div>
        </div>

        {/* Números de la temporada */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { n: rango === "Semana" ? "1" : rango === "Mes" ? "4" : "38", l: "Entregas" },
            { n: rango === "Semana" ? "5.2" : rango === "Mes" ? "21" : "196", l: "Kilos de campo" },
            { n: rango === "Semana" ? "2" : rango === "Mes" ? "2" : "5", l: "Familias" },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-3">
              <div className="serif text-2xl">{k.n}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="serif text-3xl text-primary">45 km</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Viaje promedio</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="serif text-3xl text-primary">6.4 kg</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Merma evitada</div>
          </div>
        </div>

        {/* Lo más recibido */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Lo más recibido</div>
            <span className="text-[10px] text-muted-foreground">{rango.toLowerCase()}</span>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {products.slice(0, 4).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <img src={p.photo} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-tight">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {getProducer(p.producerSlug).name.split(" ")[0]} · {p.unit}
                  </div>
                </div>
                <div className="serif text-base">{[9, 7, 6, 3][i]}<span className="ml-0.5 text-[10px] text-muted-foreground">x</span></div>
              </li>
            ))}
          </ul>
        </section>

        {/* Insignias */}
        <section>
          <div className="eyebrow">Insignias de temporada</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {insignias.map((b) => (
              <div
                key={b.n}
                className={`rounded-2xl border p-3 ${b.got ? "border-primary/30 bg-primary/5" : "border-dashed border-border bg-card"}`}
              >
                {b.got ? <Leaf className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground/60" />}
                <div className={`serif mt-2 text-sm leading-tight ${b.got ? "" : "text-muted-foreground"}`}>{b.n}</div>
                <div className="text-[10px] text-muted-foreground">{b.d}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border-2 border-dashed border-miel/50 bg-miel/10 p-4 text-sm">
          <div className="eyebrow text-tierra">Siguiente hito</div>
          <p className="mt-2">3 semanas más y superas tu mejor racha. La constancia es lo que le permite al productor sembrar sin miedo.</p>
        </div>
      </div>
    </AppShell>
  );
}
