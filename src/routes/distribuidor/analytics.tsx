import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";

export const Route = createFileRoute("/distribuidor/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Distribuidor — Milpa" }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Mayo · 2025" title="Rendimiento">
      <div className="space-y-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { n: "98%", l: "Entregas a tiempo", c: "text-primary" },
            { n: "2.1%", l: "Merma promedio", c: "text-primary" },
            { n: "184", l: "Familias servidas", c: "text-foreground" },
            { n: "4.7", l: "Calificación", c: "text-miel" },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-4">
              <div className={`serif text-3xl ${k.c}`}>{k.n}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="eyebrow">Merma por tramo · semana</div>
          <div className="mt-4 flex items-end gap-2 h-32">
            {[20, 32, 18, 24, 12, 28, 16].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-miel/70" style={{ height: `${h * 2}px` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            {["L","M","M","J","V","S","D"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
          <div className="eyebrow text-primary">Win de la semana</div>
          <p className="mt-2">2 entregas comunitarias en Col. Roma redujeron 18 km de ruta. ¡Sigue así!</p>
        </div>
      </div>
    </AppShell>
  ),
});
