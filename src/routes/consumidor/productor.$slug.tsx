import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { getProducer, producerDetails, trustScore10, scoreTone } from "@/lib/data";
import { SCORE_LAYERS } from "@/lib/score";
import { ChevronLeft, MapPin, Snowflake, Leaf } from "lucide-react";

export const Route = createFileRoute("/consumidor/productor/$slug")({
  loader: ({ params }) => {
    const p = getProducer(params.slug);
    if (!p) throw notFound();
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    const p = loaderData ? getProducer(loaderData.slug) : undefined;
    const t = p ? `${p.name} · Productor — Milpa` : "Productor no encontrado — Milpa";
    const d = p ? p.practice : "Productor no disponible";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  notFoundComponent: () => <div className="p-8 text-center">Productor no encontrado.</div>,
  component: ProducerProfile,
});

function ProducerProfile() {
  const { slug } = Route.useLoaderData();
  const p = getProducer(slug);
  const d = producerDetails[slug];
  const s = trustScore10(slug);
  const comps = SCORE_LAYERS.map((l) => ({ l: l.label, w: `${l.weight}%`, v: d.components[l.key] }));

  return (
    <AppShell tabs={consumidorTabs} tone="terracota">
      <div className="relative h-72">
        <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <Link to="/consumidor" className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>
      <div className="-mt-10 relative space-y-5 px-5">
        <div>
          <h1 className="display text-3xl">{p.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{p.region}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Score de confianza</div>
            <span className={`rounded-full px-3 py-1 text-lg font-medium ${scoreTone(s)}`}>{s}/10</span>
          </div>
          <div className="mt-4 space-y-3">
            {comps.map((c) => (
              <div key={c.l}>
                <div className="flex justify-between text-xs"><span>{c.l} <span className="text-muted-foreground">· {c.w}</span></span><span>{(c.v / 10).toFixed(1)}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${c.v}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <section>
          <div className="eyebrow">Su historia</div>
          <p className="serif mt-2 text-base leading-snug">{d.story}</p>
        </section>

        <section>
          <div className="eyebrow">Desde el campo</div>
          <div className="deslizar-x -mx-5 mt-2 flex gap-2 px-5 [--riel-margen:1.25rem]">
            {d.gallery.map((g, i) => <img key={i} src={g} alt="" className="h-32 w-40 shrink-0 rounded-xl object-cover" />)}
          </div>
        </section>

        <section className="rounded-2xl bg-primary/10 p-4">
          <div className="flex items-center gap-2 eyebrow text-primary"><Leaf className="h-4 w-4" />Prácticas agroecológicas</div>
          <ul className="mt-2 space-y-1 text-sm">{d.practices.map((x) => <li key={x}>· {x}</li>)}</ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 eyebrow"><Snowflake className="h-4 w-4" />Cadena de frío</div>
          <p className="mt-2 text-sm text-foreground/80">{d.coldChain}</p>
        </section>

        <Link to="/consumidor/cosecha" className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background">
          Ver cosecha compartida
        </Link>
      </div>
    </AppShell>
  );
}
