import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Sprout } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { NuevoStamp } from "@/components/NuevoStamp";
import { producers } from "@/lib/data";
import { formatScore } from "@/lib/score";
import { trustScore10 } from "@/lib/data";
import { RESENAS_PARA_SCORE, useProductoresRegistrados } from "@/lib/producer-store";

export const Route = createFileRoute("/consumidor/productores")({
  head: () => ({ meta: [{ title: "Conoce a los productores · Milpa" }] }),
  component: ConoceALosProductores,
});

type Fila = {
  slug: string;
  name: string;
  region: string;
  texto: string;
  photo?: string;
  score: number | null;
  /** Solo para los productores nuevos: reseñas y perfil completo */
  nuevo?: { resenas: number; completo: number };
  years?: number;
};

function ConoceALosProductores() {
  const [registrados] = useProductoresRegistrados();
  const filas: Fila[] = [
    ...Object.values(producers).map((p) => ({ slug: p.slug, name: p.name, region: p.region, texto: p.practice, photo: p.photo, score: trustScore10(p.slug), years: p.years })),
    ...registrados.map((r) => ({
      slug: r.id,
      name: r.name,
      region: r.zona,
      texto: r.story,
      photo: r.photos[0],
      score: r.score,
      nuevo: r.nuevo ? { resenas: r.resenas, completo: r.completo } : undefined,
    })),
  ]
    // Primero el mejor score, como en el Mercado; los nuevos (sin score) al final
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
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
        {filas.map((p) => (
          <Link to="/consumidor/productor/$slug" params={{ slug: p.slug }} key={p.slug} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="relative shrink-0">
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary text-primary"><Sprout className="h-7 w-7" /></span>
              )}
              {p.nuevo && <NuevoStamp size={34} className="absolute -left-2 -top-2" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="serif text-lg leading-tight">{p.name}</div>
              {p.region && <div className="text-[11px] text-muted-foreground">{p.region}</div>}
              {p.texto && <div className="mt-1 line-clamp-2 text-xs text-foreground/70">{p.texto}</div>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                {p.nuevo ? (
                  <>
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">Nuevo · {p.nuevo.resenas}/{RESENAS_PARA_SCORE} reseñas</span>
                    <span className="text-muted-foreground">Perfil {p.nuevo.completo === 100 ? "completo" : `${p.nuevo.completo} %`}</span>
                  </>
                ) : (
                  <>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Score {formatScore(p.score ?? 0)}</span>
                    {p.years ? <span className="text-muted-foreground">· {p.years} años</span> : null}
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
