import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import santiago from "@/assets/producer-santiago.jpg";

export const Route = createFileRoute("/trazabilidad")({
  head: () => ({
    meta: [
      { title: "Tu pedido en ruta — Milpa" },
      { name: "description", content: "Trazabilidad en tiempo real: del campo de Santiago a tu mesa en Monterrey." },
      { property: "og:title", content: "Tu pedido en ruta — Milpa" },
      { property: "og:description", content: "Trazabilidad en tiempo real." },
    ],
  }),
  component: Tracking,
});

const steps = [
  { key: "harvest", title: "Cosecha en parcela", time: "Ayer · 6:40 AM", who: "Santiago", state: "done" as const, detail: "1.4 kg de jitomate cortado al amanecer." },
  { key: "pack", title: "Empaque en cajas reutilizables", time: "Ayer · 7:15 AM", who: "Santiago", state: "done" as const, detail: "Lote LT-0518 generado. QR impreso." },
  { key: "pickup", title: "Recolección del distribuidor", time: "Hoy · 8:02 AM", who: "Claudia · Distribuidora", state: "done" as const, detail: "Temperatura registrada: 8°C en cámara fría." },
  { key: "route", title: "En ruta a tu colonia", time: "Hoy · 9:30 AM", who: "Camioneta MTY-04", state: "active" as const, detail: "Cruzando Saltillo–Monterrey. 3 paradas antes de la tuya." },
  { key: "delivered", title: "Entrega en tu puerta", time: "Hoy · 10:00–12:00", who: "Tú", state: "pending" as const, detail: "Recibirás SMS al llegar." },
];

function Tracking() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <span className="eyebrow">Pedido MLP-2025-0518 · Lote LT-0518</span>
          <h1 className="display mt-4 text-5xl md:text-6xl">
            Tu pedido está
            <br />
            <em className="not-italic text-terracota">cruzando la sierra.</em>
          </h1>
          <p className="mt-5 max-w-xl text-foreground/70">
            Salió esta mañana de la parcela de Santiago en Ramos Arizpe. Llega a tu
            colonia entre 10 y 12 del día.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Timeline */}
          <ol className="md:col-span-7">
            {steps.map((s, i) => (
              <li key={s.key} className="relative flex gap-6 pb-10 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    className={`absolute left-[15px] top-9 h-full w-px ${
                      s.state === "done" ? "bg-primary/60" : "bg-border"
                    }`}
                  />
                )}
                <div
                  className={[
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                    s.state === "done"
                      ? "border-primary bg-primary text-primary-foreground"
                      : s.state === "active"
                      ? "border-terracota bg-background text-terracota animate-pulse"
                      : "border-border bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {s.state === "done" ? "✓" : i + 1}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="serif text-2xl">{s.title}</h3>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {s.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/65">{s.detail}</p>
                  <div className="mt-2 text-xs text-foreground/50">por {s.who}</div>
                </div>
              </li>
            ))}
          </ol>

          {/* Side card */}
          <aside className="md:col-span-5 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={santiago}
                  alt="Santiago en su parcela"
                  loading="lazy"
                  className="h-full w-full object-cover"
                  width={1200}
                  height={1400}
                />
              </div>
              <div className="p-6">
                <span className="eyebrow">Tu productor</span>
                <h4 className="serif mt-2 text-2xl">Santiago Treviño</h4>
                <p className="mt-1 text-sm text-muted-foreground">Ramos Arizpe · 98 km</p>
                <Link
                  to="/productor/$slug"
                  params={{ slug: "santiago" }}
                  className="mt-4 inline-block text-sm text-primary hover:underline"
                >
                  Ver perfil completo →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="eyebrow">Historia del lote · LT-0518</span>
              <ul className="mt-4 space-y-3 text-sm text-foreground/75">
                <li className="flex justify-between"><span>Sembrado</span><span className="text-muted-foreground">12 marzo</span></li>
                <li className="flex justify-between"><span>Cosechado</span><span className="text-muted-foreground">17 mayo · 6:40 AM</span></li>
                <li className="flex justify-between"><span>Salió del campo</span><span className="text-muted-foreground">8:02 AM</span></li>
                <li className="flex justify-between"><span>Cadena de frío</span><span className="text-primary">✓ Estable 8°C</span></li>
                <li className="flex justify-between"><span>Práctica</span><span className="text-muted-foreground">Agroecológica</span></li>
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-6">
              <span className="eyebrow text-terracota">Nota de Santiago para ti</span>
              <p className="serif mt-3 text-lg italic leading-snug">
                "Esta semana el jitomate salió más chico porque llovió menos, pero
                está más dulce. Buen provecho."
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
