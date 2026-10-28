import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { producers } from "@/lib/data";
import { formatScore } from "@/lib/score";
import { trustScore10 } from "@/lib/data";

export const Route = createFileRoute("/consumidor/productores")({
  head: () => ({ meta: [{ title: "Conoce a los productores · Milpa" }] }),
  component: () => (
    <AppShell
      tabs={consumidorTabs}
      tone="terracota"
      eyebrow="Cerca de ti"
      title="Conoce a los productores"
      back={
        <Link to="/consumidor" aria-label="Volver al Mercado" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-3 px-5">
        {Object.values(producers)
          .sort((a, b) => trustScore10(b.slug) - trustScore10(a.slug))
          .map((p) => (
          <Link to="/consumidor/productor/$slug" params={{ slug: p.slug }} key={p.slug} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={p.photo} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="serif text-lg leading-tight">{p.name}</div>
              <div className="text-[11px] text-muted-foreground">{p.region}</div>
              <div className="mt-1 text-xs text-foreground/70">{p.practice}</div>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Score {formatScore(trustScore10(p.slug))}</span>
                <span className="text-muted-foreground">· {p.years} años</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  ),
});
