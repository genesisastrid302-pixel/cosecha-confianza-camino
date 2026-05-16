import { createFileRoute, Link } from "@tanstack/react-router";
import heroHands from "@/assets/hero-hands.jpg";
import field from "@/assets/field-landscape.jpg";
import santiago from "@/assets/producer-santiago.jpg";
import { Seal } from "@/components/Seal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Milpa — Del campo a tu mesa, sin intermediarios" },
      {
        name: "description",
        content:
          "Trazabilidad agroecológica para Monterrey. Conoce al productor, ve cómo cosecha, recibe en casa.",
      },
      { property: "og:title", content: "Milpa — Del campo a tu mesa" },
      {
        property: "og:description",
        content: "Trazabilidad agroecológica para Monterrey.",
      },
    ],
  }),
  component: Lobby,
});

function Lobby() {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-paper">
          <div className="flex items-center gap-3">
            <Seal className="h-10 w-10 text-paper" />
            <div className="leading-tight">
              <div className="serif text-lg">Milpa</div>
              <div className="text-[10px] tracking-[0.22em] uppercase opacity-80">
                cadena corta · mty
              </div>
            </div>
          </div>
          <div className="hidden gap-8 text-sm md:flex">
            <span className="opacity-80">Monterrey</span>
            <span className="opacity-80">·</span>
            <span className="opacity-80">Ramos Arizpe</span>
            <span className="opacity-80">·</span>
            <span className="opacity-80">Galeana</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative grain min-h-[100vh] overflow-hidden">
        <img
          src={heroHands}
          alt="Manos de un agricultor sosteniendo jitomates recién cosechados"
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={1200}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink/80" />

        <div className="relative mx-auto flex min-h-[100vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-40 text-paper">
          <div className="max-w-3xl">
            <span className="eyebrow text-paper/80">
              Manifiesto · 01
            </span>
            <h1 className="display mt-6 text-[clamp(3rem,9vw,7.5rem)]">
              El campo
              <br />
              <em className="not-italic text-miel">tiene nombre.</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper/90 md:text-xl">
              Santiago siembra en Ramos Arizpe. Rosa cuida 32 colmenas en Galeana.
              Aquí no compras un producto — recibes lo que ellos cosecharon esta semana,
              con su nombre, su práctica y su historia. <em className="font-serif">Sin intermediarios. Sin etiquetas vacías.</em>
            </p>
          </div>
        </div>
      </section>

      {/* Three actors — the building */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-end gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="eyebrow">El edificio</span>
              <h2 className="display mt-4 text-5xl md:text-6xl">
                Una <em className="not-italic text-terracota">cadena</em> de tres.
              </h2>
            </div>
            <p className="text-foreground/70 md:col-span-6 md:col-start-7">
              Productor, distribuidor y consumidor. Tres roles, una sola promesa:
              reducir la distancia entre quien siembra y quien come. Elige tu lugar.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <RoleCard
              num="01"
              tone="milpa"
              title="Soy productor"
              body="Sube tu transparencia, gestiona tu catálogo y cosecha solo lo que está vendido."
              href="/productor/santiago"
              cta="Entrar al ala del productor"
            />
            <RoleCard
              num="02"
              tone="miel"
              title="Soy distribuidor"
              body="Ruta del día, recolección asignada, registro de merma. Activado tras la confirmación del productor."
              href="/trazabilidad"
              cta="Ver ruta y trazabilidad"
            />
            <RoleCard
              num="03"
              tone="terracota"
              title="Soy consumidor"
              body="Conoce a quien te alimenta, ve el score de confianza y recibe en tu colonia esta semana."
              href="/consumidor"
              cta="Entrar al mercado"
              featured
            />
          </div>
        </div>
      </section>

      {/* Featured producer strip */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto">
            <img
              src={santiago}
              alt="Retrato de Santiago Treviño en su parcela de Ramos Arizpe"
              loading="lazy"
              className="h-full w-full object-cover"
              width={1200}
              height={1400}
            />
            <div className="absolute bottom-6 left-6 rounded-full bg-background/90 px-4 py-2 text-xs tracking-widest uppercase backdrop-blur">
              Santiago · 12 años cultivando
            </div>
          </div>
          <div className="flex flex-col justify-center px-8 py-20 md:px-16">
            <span className="eyebrow">Historia viva · Productor 014</span>
            <h3 className="display mt-6 text-4xl md:text-5xl">
              "Cuando vienen al campo,<br /> compran. Setenta de cada cien."
            </h3>
            <p className="mt-6 max-w-md text-foreground/70">
              Setenta por ciento de conversión cuando un cliente visita su parcela.
              Esa misma evidencia visual ahora vive en cada perfil de productor:
              fotos, notas de voz, datos de cosecha. La confianza se ve antes de comprar.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/productor/$slug"
                params={{ slug: "santiago" }}
                className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                Conocer a Santiago →
              </Link>
              <Link
                to="/consumidor"
                className="rounded-full border border-foreground/20 px-6 py-3 text-sm text-foreground hover:bg-foreground/5 transition-colors"
              >
                Ver mercado de hoy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers / values strip */}
      <section className="relative grain border-t border-border overflow-hidden">
        <img
          src={field}
          alt="Surcos de hortalizas al amanecer en el norte de México"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 text-paper">
          <span className="eyebrow text-paper/70">Lo que medimos</span>
          <h2 className="display mt-4 max-w-3xl text-5xl md:text-6xl">
            <em className="not-italic text-miel">Toda</em> decisión reduce la distancia
            entre el campo y la mesa.
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-4">
            <Stat n="30%" label="Reducción de merma esperada en 6 meses" />
            <Stat n="≤48h" label="Anticipación entre pedido y cosecha" />
            <Stat n="98 km" label="Distancia promedio campo→mesa" />
            <Stat n="≥4.2" label="Satisfacción post-entrega" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Seal className="h-10 w-10 text-primary" />
              <div>
                <div className="serif text-base">Milpa</div>
                <div className="text-xs text-muted-foreground">
                  Cadena corta agroecológica · Monterrey · 2025
                </div>
              </div>
            </div>
            <p className="max-w-md text-sm italic text-muted-foreground">
              "Toda decisión de diseño debe reducir la distancia percibida entre el
              campo y la mesa."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({
  num,
  title,
  body,
  href,
  cta,
  tone,
  featured,
}: {
  num: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  tone: "milpa" | "miel" | "terracota";
  featured?: boolean;
}) {
  const toneClass = {
    milpa: "text-primary",
    miel: "text-miel",
    terracota: "text-terracota",
  }[tone];

  return (
    <Link
      to={href}
      className={[
        "group relative flex flex-col justify-between rounded-2xl border p-8 transition-all duration-300",
        featured
          ? "border-foreground bg-foreground text-background hover:bg-foreground/95"
          : "border-border bg-card hover:border-foreground/40 hover:-translate-y-1",
        "shadow-soft hover:shadow-paper min-h-[320px]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <span
          className={`serif text-5xl ${featured ? "text-miel" : toneClass}`}
        >
          {num}
        </span>
        <span
          className={`text-xs tracking-widest uppercase ${
            featured ? "text-background/60" : "text-muted-foreground"
          }`}
        >
          Rol
        </span>
      </div>

      <div>
        <h3 className="serif mt-12 text-3xl">{title}</h3>
        <p
          className={`mt-3 text-sm leading-relaxed ${
            featured ? "text-background/75" : "text-foreground/65"
          }`}
        >
          {body}
        </p>
        <div
          className={`mt-8 text-sm ${
            featured ? "text-miel" : "text-foreground"
          } transition-transform group-hover:translate-x-1`}
        >
          {cta} →
        </div>
      </div>
    </Link>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="display text-6xl text-miel">{n}</div>
      <div className="mt-3 text-sm text-paper/70">{label}</div>
    </div>
  );
}
