import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { producers, products } from "@/lib/data";
import { Sprout, Check, CalendarDays, HandHeart } from "lucide-react";

export const Route = createFileRoute("/consumidor/cosecha")({
  head: () => ({
    meta: [
      { title: "Cosecha compartida · Milpa" },
      { name: "description", content: "Apadrina una cosecha: reserva tu parte del cultivo antes de la siembra y acompaña al productor toda la temporada." },
      { property: "og:title", content: "Cosecha compartida · Milpa" },
      { property: "og:description", content: "Apadrina una cosecha y recibe tu parte cada semana, directo del productor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CosechaCompartida,
});

type Plan = { id: string; nombre: string; semanas: number; kgSemana: string; precio: number; nota: string };

const planes: Plan[] = [
  { id: "raiz", nombre: "Raíz", semanas: 8, kgSemana: "2–3 kg", precio: 1180, nota: "Para una o dos personas. Verdura de la semana." },
  { id: "milpa", nombre: "Milpa", semanas: 12, kgSemana: "4–5 kg", precio: 2340, nota: "Para familia. Verdura, cítricos y hierbas." },
  { id: "temporada", nombre: "Temporada completa", semanas: 24, kgSemana: "4–5 kg", precio: 4290, nota: "Acompañas el ciclo entero del cultivo." },
];

function CosechaCompartida() {
  const [productor, setProductor] = useState("santiago");
  const [plan, setPlan] = useState("milpa");
  const [listo, setListo] = useState(false);
  const elegido = planes.find((p) => p.id === plan)!;
  const prod = producers[productor];

  if (listo) {
    return (
      <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Cosecha compartida" title="Sembrado">
        <div className="space-y-5 px-5">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <Sprout className="h-6 w-6" />
            <div className="serif mt-3 text-2xl leading-snug">
              Apadrinaste {elegido.semanas} semanas con {prod.name.split(" ")[0]}.
            </div>
            <p className="mt-2 text-sm opacity-90">
              Tu parte queda reservada desde la siembra. Cada semana recibes tu porción y las fotos del cultivo creciendo.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="eyebrow">Lo que sigue</div>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>· {prod.name} confirma tu lugar en la siembra.</li>
              <li>· Recibes aviso el día de la primera cosecha.</li>
              <li>· Tu racha de temporada empieza con la primera entrega.</li>
            </ul>
          </div>
          <button onClick={() => setListo(false)} className="w-full rounded-full border border-border py-3 text-sm text-muted-foreground">
            Ver otras cosechas
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Antes de la siembra" title="Cosecha compartida">
      <div className="space-y-5 px-5">
        <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
          <div className="eyebrow flex items-center gap-1.5 text-primary"><HandHeart className="h-3 w-3" /> Apadrinamiento</div>
          <p className="serif mt-2 text-base leading-snug">
            Reservas tu parte de la cosecha antes de que exista. El productor siembra con la certeza de que su trabajo ya tiene mesa.
          </p>
        </div>

        <section>
          <div className="eyebrow">Elige a quién acompañas</div>
          <div className="mt-3 space-y-2">
            {Object.values(producers).map((p) => {
              const activo = p.slug === productor;
              return (
                <button
                  key={p.slug}
                  onClick={() => setProductor(p.slug)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${
                    activo ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <img src={p.photo} alt={p.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="serif text-base leading-tight">{p.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{p.practice}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Score {p.score} · {p.years} años
                    </div>
                  </div>
                  {activo && <Check className="h-5 w-5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="eyebrow">Tamaño de tu parte</div>
          <div className="mt-3 space-y-2">
            {planes.map((p) => {
              const activo = p.id === plan;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`w-full rounded-2xl border p-4 text-left ${
                    activo ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div className="serif text-lg">{p.nombre}</div>
                    <div className="serif text-base">${p.precio.toLocaleString("es-MX")}</div>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarDays className="h-3 w-3" /> {p.semanas} semanas · {p.kgSemana} por semana
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{p.nota}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="eyebrow">Lo que se sembrará para ti</div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {products.map((p) => (
              <div key={p.id} className="w-20 shrink-0">
                <img src={p.photo} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="mt-1 text-[10px] leading-tight text-muted-foreground">{p.name}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] italic text-muted-foreground">
            La canasta cambia con la temporada. Eso es lo que la hace real.
          </p>
        </section>

        <div className="rounded-2xl bg-foreground p-4 text-background">
          <div className="flex items-baseline justify-between text-sm">
            <span className="opacity-70">Total temporada</span>
            <span className="serif text-2xl">${elegido.precio.toLocaleString("es-MX")}</span>
          </div>
          <div className="mt-1 text-[11px] opacity-60">
            ≈ ${Math.round(elegido.precio / elegido.semanas)} por semana · 78% va directo al productor
          </div>
        </div>

        <button
          onClick={() => setListo(true)}
          className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground"
        >
          Apadrinar esta cosecha
        </button>
      </div>
    </AppShell>
  );
}
