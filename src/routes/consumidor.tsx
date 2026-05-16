import { createFileRoute, Link } from "@tanstack/react-router";
import { products, getProducer } from "@/lib/data";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/consumidor")({
  head: () => ({
    meta: [
      { title: "Mercado de hoy — Milpa" },
      { name: "description", content: "Lo que se cosecha esta semana en cadenas cortas agroecológicas de Monterrey." },
      { property: "og:title", content: "Mercado de hoy — Milpa" },
      { property: "og:description", content: "Lo que se cosecha esta semana." },
    ],
  }),
  component: ConsumerHome,
});

function ConsumerHome() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* "3 preguntas en 3 segundos" */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <span className="eyebrow">Tu mercado · Semana 19</span>
          <h1 className="display mt-4 text-5xl md:text-7xl">
            Buenos días,
            <br />
            <em className="not-italic text-terracota">Adriana.</em>
          </h1>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <QuickAnswer
              label="Tienes en camino"
              value="1 pedido"
              detail="Llega mañana 10–12h · Santiago"
              href="/trazabilidad"
              tone="primary"
            />
            <QuickAnswer
              label="Disponible hoy"
              value="7 cultivos"
              detail="De 2 productores cerca de ti"
              href="#mercado"
              tone="terracota"
            />
            <QuickAnswer
              label="Cosechando esta semana"
              value="Jitomate · Cilantro"
              detail="Reserva antes del miércoles"
              href="#mercado"
              tone="miel"
            />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="mercado" className="bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Esta semana</span>
              <h2 className="display mt-3 text-4xl md:text-5xl">Lo que el campo da hoy</h2>
            </div>
            <span className="hidden text-sm text-muted-foreground md:block">
              {products.length} cultivos · 2 productores
            </span>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const prod = getProducer(p.producerSlug);
              return (
                <Link
                  key={p.id}
                  to="/productor/$slug"
                  params={{ slug: p.producerSlug }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                    <img
                      src={p.photo}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      width={1000}
                      height={1000}
                    />
                    {p.badge && <Badge kind={p.badge} harvestIn={p.harvestIn} unitsLeft={p.unitsLeft} />}
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="serif text-2xl leading-tight">{p.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {prod.name} · {prod.region.split(",")[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="serif text-2xl">${p.price}</div>
                      <div className="text-xs text-muted-foreground">/{p.unit}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-foreground/60">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      {p.harvestIn === 0 ? "Listo" : `Cosecha en ${p.harvestIn} ${p.harvestIn === 1 ? "día" : "días"}`}
                    </span>
                    <span className="opacity-40">·</span>
                    <span>{p.unitsLeft} disponibles</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <span className="eyebrow">Tu impacto · mayo</span>
            <h2 className="display mt-3 text-4xl md:text-5xl">
              Tus 8 pedidos viajaron <em className="not-italic text-terracota">45 km</em> en promedio.
            </h2>
            <p className="mt-5 max-w-md text-foreground/70">
              Frente a los 800 km que recorre la comida del supermercado convencional.
              Evitaste 6.4 kg de merma y sostuviste el trabajo de 2 familias agroecológicas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ImpactTile big="6.4 kg" small="Merma evitada" />
            <ImpactTile big="45 km" small="Promedio campo→mesa" />
            <ImpactTile big="2" small="Familias sostenidas" />
            <ImpactTile big="$1,840" small="Directo a productor" />
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickAnswer({
  label,
  value,
  detail,
  href,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: "primary" | "terracota" | "miel";
}) {
  const toneClass = {
    primary: "text-primary",
    terracota: "text-terracota",
    miel: "text-miel",
  }[tone];
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="eyebrow">{label}</div>
      <div className={`serif mt-4 text-3xl ${toneClass}`}>{value}</div>
      <div className="mt-3 text-sm text-muted-foreground">{detail}</div>
      <div className="mt-4 text-xs text-foreground/60 group-hover:translate-x-1 transition-transform">
        Ver detalle →
      </div>
    </Link>
  );
}

function Badge({ kind, harvestIn, unitsLeft }: { kind: "miel" | "temporada" | "ultimos"; harvestIn: number; unitsLeft: number }) {
  const map = {
    temporada: { text: harvestIn > 0 ? `Cosecha en ${harvestIn}d` : "Listo hoy", className: "bg-primary text-primary-foreground" },
    ultimos: { text: `Últimos ${unitsLeft}`, className: "bg-terracota text-paper" },
    miel: { text: "Miel de temporada", className: "bg-miel text-ink" },
  };
  const cfg = map[kind];
  return (
    <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide ${cfg.className}`}>
      {cfg.text}
    </span>
  );
}

function ImpactTile({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="display text-4xl text-primary">{big}</div>
      <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{small}</div>
    </div>
  );
}
