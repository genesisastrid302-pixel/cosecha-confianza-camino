import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProducer, getProductsByProducer } from "@/lib/data";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/productor/$slug")({
  head: ({ params }) => {
    const p = getProducer(params.slug);
    const title = p ? `${p.name} — ${p.region} · Milpa` : "Productor · Milpa";
    const desc = p ? `${p.practice}. Score de confianza ${p.score}/100.` : "Perfil del productor";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(p ? [{ property: "og:image", content: p.photo }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    const producer = getProducer(params.slug);
    if (!producer) throw notFound();
    return { producer };
  },
  component: ProducerPage,
});

function ProducerPage() {
  const { producer } = Route.useLoaderData();
  const items = getProductsByProducer(producer.slug);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero portrait */}
      <section className="relative grain">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-12">
          <div className="relative md:col-span-7">
            <img
              src={producer.photo}
              alt={`Retrato de ${producer.name}`}
              className="h-[70vh] w-full object-cover md:h-[88vh]"
              width={1200}
              height={1400}
            />
            <div className="absolute bottom-6 left-6 rounded-full bg-background/90 px-4 py-2 text-xs tracking-widest uppercase backdrop-blur">
              Productor · {producer.slug.padStart(3, "0")}
            </div>
          </div>

          <div className="flex flex-col justify-center bg-background px-8 py-16 md:col-span-5 md:px-12">
            <span className="eyebrow">{producer.region}</span>
            <h1 className="display mt-4 text-5xl md:text-6xl">{producer.name}</h1>
            <p className="mt-4 text-lg text-foreground/70">{producer.practice}</p>

            {/* Score */}
            <div className="mt-10 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Score de confianza</span>
                <span className="text-xs text-muted-foreground">Auto-generado</span>
              </div>
              <div className="mt-3 flex items-end gap-3">
                <span className="display text-7xl text-primary">{producer.score}</span>
                <span className="mb-3 text-foreground/50">/ 100</span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${producer.score}%` }}
                />
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <li>✓ Evidencia visual del cultivo</li>
                <li>✓ Datos de cosecha al día</li>
                <li>✓ Calificación de consumidores</li>
                <li>✓ Cumplimiento de entregas</li>
              </ul>
            </div>

            <Link
              to="/consumidor"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-center text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              Pedir a {producer.name.split(" ")[0]} →
            </Link>
          </div>
        </div>
      </section>

      {/* Producer note */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="eyebrow">Nota de {producer.name.split(" ")[0]} · esta semana</span>
          <blockquote className="display mt-6 text-3xl leading-snug md:text-5xl">
            <span className="text-terracota">"</span>
            {producer.note}
            <span className="text-terracota">"</span>
          </blockquote>
          <div className="mt-6 text-sm text-muted-foreground">
            — directamente desde {producer.region}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <span className="eyebrow">Transparencia</span>
          <h2 className="display mt-3 text-4xl md:text-5xl">{producer.years} años cultivando.</h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {producer.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </div>
                <div className="display mt-3 text-4xl text-foreground">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price breakdown */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <span className="eyebrow">Desglose de tu pago</span>
            <h2 className="display mt-3 text-4xl md:text-5xl">
              De cada <em className="not-italic text-terracota">$100</em>,<br />
              $72 van directo a {producer.name.split(" ")[0]}.
            </h2>
            <p className="mt-5 max-w-md text-foreground/70">
              Sin intermediarios escondidos. Logística y plataforma se sostienen con
              transparencia — porque la distancia económica también es distancia.
            </p>
          </div>

          <div className="space-y-4">
            <BreakdownBar label={`Para ${producer.name.split(" ")[0]}`} pct={72} amount="$72" tone="primary" />
            <BreakdownBar label="Distribución y cadena de frío" pct={18} amount="$18" tone="miel" />
            <BreakdownBar label="Plataforma Milpa" pct={10} amount="$10" tone="tierra" />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <span className="eyebrow">Cosechando ahora</span>
          <h2 className="display mt-3 text-4xl md:text-5xl">El catálogo de {producer.name.split(" ")[0]}</h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={p.photo}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    width={1000}
                    height={1000}
                  />
                </div>
                <div className="p-5">
                  <h3 className="serif text-xl">{p.name}</h3>
                  <p className="mt-1 text-sm text-foreground/65 italic">"{p.story}"</p>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      {p.harvestIn === 0 ? "Listo hoy" : `Cosecha en ${p.harvestIn}d`}
                    </span>
                    <span className="serif text-xl">${p.price}<span className="text-xs text-muted-foreground">/{p.unit}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function BreakdownBar({ label, pct, amount, tone }: { label: string; pct: number; amount: string; tone: "primary" | "miel" | "tierra" }) {
  const bg = { primary: "bg-primary", miel: "bg-miel", tierra: "bg-tierra" }[tone];
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{amount} <span className="text-muted-foreground">({pct}%)</span></span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
