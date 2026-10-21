import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Check, HandHeart, Lock, Pause, Play, Sprout, Leaf } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { FotoCookie } from "@/components/FotoCookie";
import { IndicadorCarga } from "@/components/IndicadorCarga";
import { producers, products, trustScore10 } from "@/lib/data";
import { formatScore } from "@/lib/score";
import { addReserva } from "@/lib/distribucion";
import { sesionDe } from "@/lib/acceso";
import { useMisPedidos } from "@/lib/orders";
import {
  PEDIDOS_PARA_COSECHA,
  COMPROMISOS,
  FRECUENCIA_LABEL,
  PLANES,
  cambiarEstado,
  cancelarSuscripcion,
  pedidosRecibidos,
  planDe,
  precioCosecha,
  useMiSuscripcion,
  type Compromiso,
  type Plan,
  type Suscripcion,
} from "@/lib/suscripcion";

type Pestana = "suscripcion" | "cosecha";

export const Route = createFileRoute("/consumidor/planes")({
  validateSearch: (s: Record<string, unknown>): { tab?: Pestana } => ({
    tab: s.tab === "cosecha" ? "cosecha" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Planes · Milpa" },
      { name: "description", content: "Suscríbete a una canasta semanal agroecológica o reserva tu parte de la cosecha con un productor." },
      { property: "og:title", content: "Planes · Milpa" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Planes,
});

const peso = (n: number) => `$${n.toLocaleString("es-MX")}`;

function Planes() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: "/consumidor/planes" });
  const pestana: Pestana = tab ?? "suscripcion";
  const { s, listo } = useMiSuscripcion();
  const recibidas = pedidosRecibidos(useMisPedidos()).length;
  const bloqueada = recibidas < PEDIDOS_PARA_COSECHA;
  const ir = (t: Pestana) => navigate({ search: t === "cosecha" ? { tab: "cosecha" } : {}, replace: true });

  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Canasta y cosecha" title="Planes">
      <div className="space-y-5 px-5">
        <div role="tablist" aria-label="Planes" className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(
            [
              { id: "suscripcion", label: "Suscripción" },
              { id: "cosecha", label: "Cosecha compartida" },
            ] as const
          ).map((t) => {
            const activa = pestana === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={activa}
                aria-controls={`panel-${t.id}`}
                onClick={() => ir(t.id)}
                className={`flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-2.5 text-[13px] transition ${
                  activa ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t.id === "cosecha" && bloqueada && <Lock className="h-3.5 w-3.5" aria-label="Bloqueada" />}
                {t.label}
              </button>
            );
          })}
        </div>

        {!listo ? (
          <div className="flex justify-center py-16">
            <IndicadorCarga etiqueta="Cargando tus planes" />
          </div>
        ) : (
          // La clave reinicia la animación de entrada al cambiar de pestaña
          <div
            key={pestana}
            role="tabpanel"
            id={`panel-${pestana}`}
            aria-labelledby={`tab-${pestana}`}
            className="animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            {pestana === "suscripcion" ? (
              <TabSuscripcion s={s} bloqueada={bloqueada} irACosecha={() => ir("cosecha")} />
            ) : bloqueada ? (
              <CosechaBloqueada recibidas={recibidas} />
            ) : (
              <CosechaCompartida s={s} />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// --- Pestaña 1: Suscripción ---

function TabSuscripcion({ s, bloqueada, irACosecha }: { s: Suscripcion | null; bloqueada: boolean; irACosecha: () => void }) {
  return (
    <div className="space-y-5">
      <header>
        <div className="eyebrow">Canasta semanal</div>
        <h2 className="display mt-1 text-3xl">Suscripción</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Recibe productos agroecológicos frescos cada semana o quincena. Sin compromiso: pausa o cancela cuando quieras.
        </p>
      </header>

      {s && <MiSuscripcion s={s} />}

      <div className="space-y-3">
        {PLANES.map((p) => (
          <TarjetaPlan key={p.id} plan={p} actual={s?.plan === p.id} />
        ))}
      </div>

      {bloqueada && (
        <button
          type="button"
          onClick={irACosecha}
          className="flex w-full items-start gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-left"
        >
          <HandHeart className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span>
            <span className="serif block text-base">¿Conoces a tu productor?</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              Después de tu 3er pedido, podrás acceder a Cosecha Compartida y reservar directamente de un productor.
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/** Tarjeta limpia y simple: nombre y precio, icono por tamaño y un solo botón */
function TarjetaPlan({ plan, actual }: { plan: Plan; actual: boolean }) {
  const Icono = plan.icono;
  return (
    <article className={`rounded-2xl border bg-card p-4 ${actual ? "border-primary" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icono className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="serif text-xl leading-tight">{plan.nombre}</h3>
          {plan.popular && !actual && (
            <span className="rounded-full bg-terracota/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-terracota">Popular</span>
          )}
          {actual && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">Tu plan</span>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="serif text-xl">{peso(plan.precio)}</span>
          <span className="text-xs text-muted-foreground"> /semana</span>
        </div>
      </div>
      <p className="mt-3 text-sm">
        {plan.personas} · {plan.productos}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">{plan.nota}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">Semanal o quincenal · Pausable · Cancelable</p>
      {!actual && (
        <Link
          to="/consumidor/suscripcion/$plan"
          params={{ plan: plan.id }}
          className="mt-4 flex w-full items-center justify-center rounded-full bg-foreground py-3 text-sm font-medium text-background transition active:scale-[0.98]"
        >
          Elegir plan
        </Link>
      )}
    </article>
  );
}

function MiSuscripcion({ s }: { s: Suscripcion }) {
  const plan = planDe(s.plan);
  const [confirmar, setConfirmar] = useState(false);
  if (!plan) return null;
  const pausada = s.estado === "pausada";
  return (
    <section className="rounded-2xl bg-primary p-4 text-primary-foreground">
      <div className="text-[10px] uppercase tracking-widest opacity-80">Tu suscripción · {pausada ? "En pausa" : "Activa"}</div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className="serif text-2xl">{plan.nombre}</span>
        <span className="serif text-lg">{peso(plan.precio)}</span>
      </div>
      <p className="mt-1 text-xs opacity-90">
        {FRECUENCIA_LABEL[s.frecuencia]} · {s.entrega === "domicilio" ? "A domicilio" : "Para recoger"} · {s.pago}
      </p>
      <p className="mt-0.5 truncate text-xs opacity-80">{s.destino}</p>
      {confirmar ? (
        <div className="mt-3 rounded-xl bg-primary-foreground/10 p-3 text-xs">
          ¿Cancelar tu suscripción? Ya no se armarán más canastas.
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => setConfirmar(false)} className="rounded-full border border-primary-foreground/40 py-2">
              No, conservarla
            </button>
            <button onClick={cancelarSuscripcion} className="rounded-full bg-primary-foreground py-2 font-medium text-primary">
              Sí, cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => cambiarEstado(pausada ? "activa" : "pausada")}
            className="flex items-center justify-center gap-1.5 rounded-full bg-primary-foreground py-2 font-medium text-primary"
          >
            {pausada ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />} {pausada ? "Reanudar" : "Pausar"}
          </button>
          <button onClick={() => setConfirmar(true)} className="rounded-full border border-primary-foreground/40 py-2">
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
}

// --- Pestaña 2: Cosecha compartida ---

function CosechaBloqueada({ recibidas }: { recibidas: number }) {
  const n = Math.min(recibidas, PEDIDOS_PARA_COSECHA);
  return (
    <div className="space-y-5">
      <section className="grain overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-5 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="display mt-3 text-3xl">Cosecha compartida</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Reserva tu parte de la cosecha directamente con un productor. Se desbloquea después de tu 3er pedido.
        </p>
        <div className="mx-auto mt-4 max-w-xs text-left">
          <div className="flex justify-between text-xs">
            <span className="font-medium">
              {n} de {PEDIDOS_PARA_COSECHA} pedidos
            </span>
            <span className="text-muted-foreground">
              {PEDIDOS_PARA_COSECHA - n === 1 ? "Te falta 1" : `Te faltan ${PEDIDOS_PARA_COSECHA - n}`}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={PEDIDOS_PARA_COSECHA}
            aria-valuenow={n}
            aria-label="Pedidos recibidos"
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-primary/15"
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(n / PEDIDOS_PARA_COSECHA) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Cuenta cada pedido que confirmas como recibido.</p>
        </div>
      </section>

      {/* Vista previa: se ve cómo será, pero no se puede tocar ni la lee el lector de pantalla */}
      <div className="pointer-events-none select-none opacity-40" aria-hidden inert>
        <ContenidoCosecha plan={PLANES[0]} seleccion={[Object.keys(producers)[0]]} compromiso={COMPROMISOS[0]} />
      </div>
    </div>
  );
}

function CosechaCompartida({ s }: { s: Suscripcion | null }) {
  // Sin suscripción, el consumidor elige el tamaño de su canasta para calcular el precio
  const [tamano, setTamano] = useState<Plan["id"]>(s?.plan ?? "individual");
  const plan = planDe(s?.plan ?? tamano) ?? PLANES[0];
  const [seleccion, setSeleccion] = useState<string[]>([Object.keys(producers)[0]]);
  const [compromiso, setCompromiso] = useState<Compromiso>(COMPROMISOS[0]);
  const [hecha, setHecha] = useState(false);
  const precio = precioCosecha(plan, compromiso);
  const nombres = seleccion.map((slug) => producers[slug].name.split(" ")[0]);

  if (hecha) {
    return (
      <div className="space-y-5">
        <div className="grain overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground">
          <Sprout className="h-6 w-6" />
          <h2 className="serif mt-3 text-2xl leading-snug">
            Reservaste {compromiso.semanas} semanas de cosecha con {nombres.join(" y ")}.
          </h2>
          <p className="mt-2 text-sm opacity-90">
            {peso(precio)} por semana · canasta {plan.nombre}. Tu parte queda apartada desde la siembra.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="eyebrow">Lo que sigue</div>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>· {seleccion.length === 1 ? `${producers[seleccion[0]].name} confirma` : "Los productores confirman"} tu lugar en la siembra.</li>
            <li>· Recibes aviso el día de la primera cosecha.</li>
            {s && <li>· Tu suscripción {plan.nombre} sigue igual.</li>}
          </ul>
        </div>
        <button onClick={() => setHecha(false)} className="w-full rounded-full border border-border py-3 text-sm text-muted-foreground">
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ContenidoCosecha
        plan={plan}
        seleccion={seleccion}
        compromiso={compromiso}
        onSeleccion={(slug) =>
          setSeleccion((x) => (x.includes(slug) ? (x.length > 1 ? x.filter((y) => y !== slug) : x) : [...x, slug]))
        }
        onCompromiso={setCompromiso}
        tamano={s ? undefined : { valor: tamano, cambiar: setTamano }}
      />
      <div className="rounded-2xl bg-foreground p-4 text-background">
        <div className="flex items-baseline justify-between text-sm">
          <span className="opacity-70">
            {compromiso.nombre} · {compromiso.semanas} semanas
          </span>
          <span className="serif text-2xl">{peso(precio)}</span>
        </div>
        <div className="mt-1 text-[11px] opacity-60">
          por semana · canasta {plan.nombre} · total {peso(precio * compromiso.semanas)}
        </div>
      </div>
      <button
        onClick={() => {
          const consumidorId = sesionDe("consumidor") ?? undefined;
          // La canasta se reparte entre los productores elegidos
          seleccion.forEach((slug) =>
            addReserva({
              producerSlug: slug,
              plan: `${compromiso.nombre} · ${plan.nombre}`,
              semanas: compromiso.semanas,
              kgSemana: Math.round((plan.kgSemana / seleccion.length) * 10) / 10,
              consumidorId,
            }),
          );
          setHecha(true);
        }}
        className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition active:scale-[0.98]"
      >
        Reservar mi cosecha
      </button>
    </div>
  );
}

/** Lo mismo para la versión real y la vista previa bloqueada (sin handlers = solo lectura) */
function ContenidoCosecha({
  plan,
  seleccion,
  compromiso,
  onSeleccion,
  onCompromiso,
  tamano,
}: {
  plan: Plan;
  seleccion: string[];
  compromiso: Compromiso;
  onSeleccion?: (slug: string) => void;
  onCompromiso?: (c: Compromiso) => void;
  tamano?: { valor: Plan["id"]; cambiar: (id: Plan["id"]) => void };
}) {
  const sembrado = products.filter((p) => seleccion.includes(p.producerSlug));
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">Antes de la siembra</div>
        <h2 className="display mt-1 text-3xl">Cosecha compartida</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Reserva tu parte de la cosecha antes de que exista. El productor siembra con la certeza de que su trabajo ya tiene mesa.
        </p>
      </header>

      <section>
        <h3 className="eyebrow">Elige a quién acompañas</h3>
        <div className="mt-3 space-y-2">
          {Object.values(producers).map((p) => {
            const activo = seleccion.includes(p.slug);
            return (
              <button
                key={p.slug}
                type="button"
                role="checkbox"
                aria-checked={activo}
                onClick={() => onSeleccion?.(p.slug)}
                className={`grain flex w-full items-center gap-3 overflow-hidden rounded-3xl border p-3 text-left transition ${
                  activo ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <FotoCookie src={p.photo} alt={p.name} className="h-16 w-16 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="serif block text-base leading-tight">{p.name}</span>
                  <span className="block text-[11px] leading-snug text-muted-foreground">{p.practice}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                    Score {formatScore(trustScore10(p.slug))} · {p.years} años
                  </span>
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                    activo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                  }`}
                  aria-hidden
                >
                  {activo && <Check className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
        </div>
        {onSeleccion && <p className="mt-2 text-[11px] text-muted-foreground">Puedes elegir a más de uno: tu canasta se reparte entre ellos.</p>}
      </section>

      {tamano && (
        <section>
          <h3 className="eyebrow">Tamaño de tu canasta</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {PLANES.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={tamano.valor === p.id}
                onClick={() => tamano.cambiar(p.id)}
                className={`rounded-xl border py-2.5 text-sm ${
                  tamano.valor === p.id ? "border-foreground bg-foreground text-background" : "border-border bg-card"
                }`}
              >
                {p.nombre}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Aún no tienes suscripción: el precio sale de la canasta que elijas.</p>
        </section>
      )}

      <section>
        <h3 className="eyebrow">Tu prueba</h3>
        <div className="mt-3 space-y-2">
          {COMPROMISOS.map((c) => {
            const activo = c.id === compromiso.id;
            const Icono = c.id === "prueba" ? Sprout : Leaf;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => onCompromiso?.(c)}
                className={`grain w-full overflow-hidden rounded-3xl border p-4 text-left transition ${
                  activo ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="serif text-lg">{c.nombre}</span>
                    {c.insignia && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">{c.insignia}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="serif text-lg">{peso(precioCosecha(plan, c))}</span>
                    <span className="text-xs text-muted-foreground"> /semana</span>
                  </span>
                </span>
                <span className="mt-1.5 flex items-center gap-1.5 text-xs">
                  <Icono className="h-3.5 w-3.5 text-primary" aria-hidden /> {c.detalle}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{c.nota}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="eyebrow flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" /> Lo que se sembrará para ti
        </h3>
        <ul className="deslizar-x -mx-5 mt-3 flex gap-3 px-5">
          {sembrado.map((p) => (
            <li key={p.id} className="w-20 shrink-0 text-center">
              <FotoCookie src={p.photo} alt={p.name} className="h-20 w-20" />
              <span className="mt-1 block text-[11px] leading-tight text-muted-foreground">{p.name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] italic text-muted-foreground">La canasta cambia con la temporada. Eso es lo que la hace real.</p>
      </section>
    </div>
  );
}
