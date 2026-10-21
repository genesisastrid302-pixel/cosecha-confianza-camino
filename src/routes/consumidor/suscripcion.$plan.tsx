import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banknote, ChevronLeft, CreditCard, MapPin, QrCode, Sprout, Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { IndicadorCarga } from "@/components/IndicadorCarga";
import { MUNICIPIOS, direccionCompleta, direccionValida, readConsumer, saveConsumer } from "@/lib/accounts";
import { PUNTOS, type Entrega, type MetodoPago } from "@/lib/orders";
import { FRECUENCIA_LABEL, PLANES, guardarSuscripcion, miSuscripcion, planDe, type Frecuencia } from "@/lib/suscripcion";

export const Route = createFileRoute("/consumidor/suscripcion/$plan")({
  loader: ({ params }) => {
    if (!planDe(params.plan)) throw notFound();
    return { plan: params.plan };
  },
  head: () => ({ meta: [{ title: "Elegir plan · Milpa" }] }),
  notFoundComponent: () => <div className="p-8 text-center">Ese plan no existe.</div>,
  component: ElegirPlan,
});

const PAGOS: { id: MetodoPago; detalle: string; icon: typeof CreditCard }[] = [
  { id: "Tarjeta", detalle: "Se cobra en automático cada canasta", icon: CreditCard },
  { id: "CoDi", detalle: "Te llega la solicitud de cobro a tu banco", icon: QrCode },
  { id: "Efectivo", detalle: "Pagas al recibir cada canasta", icon: Banknote },
];

const peso = (n: number) => `$${n.toLocaleString("es-MX")}`;

function ElegirPlan() {
  const { plan: inicial } = Route.useLoaderData();
  const [planId, setPlanId] = useState(inicial);
  const plan = planDe(planId) ?? PLANES[0];
  const [listo, setListo] = useState(false);
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("semanal");
  const [entrega, setEntrega] = useState<Entrega>("domicilio");
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [registrada, setRegistrada] = useState(false);
  const [punto, setPunto] = useState(PUNTOS[0]);
  const [pago, setPago] = useState<MetodoPago>("Tarjeta");
  const [guardados, setGuardados] = useState<MetodoPago[]>([]);
  const [hecha, setHecha] = useState(false);

  useEffect(() => {
    const c = readConsumer();
    const previa = miSuscripcion();
    setEntrega(previa?.entrega ?? c.entrega);
    setFrecuencia(previa?.frecuencia ?? "semanal");
    setDireccion(c.direccion);
    setMunicipio(c.municipio);
    setRegistrada(direccionValida(c.direccion) && !!c.municipio);
    setGuardados(c.pagos);
    setPago(previa?.pago ?? c.pagos[0] ?? "Tarjeta");
    setListo(true);
  }, []);

  const direccionLista = direccionValida(direccion) && !!municipio;
  const puede = entrega === "pickup" || direccionLista;
  const pagos = [...PAGOS].sort((a, b) => Number(guardados.includes(b.id)) - Number(guardados.includes(a.id)));

  const confirmar = () => {
    if (!puede) return;
    // Si escribió su dirección aquí por primera vez, queda en su perfil
    if (entrega === "domicilio" && !registrada) saveConsumer({ ...readConsumer(), direccion: direccion.trim(), municipio });
    guardarSuscripcion({
      plan: plan.id,
      frecuencia,
      entrega,
      destino: entrega === "domicilio" ? direccionCompleta({ direccion, municipio }) : punto,
      pago,
    });
    setHecha(true);
  };

  const pill = (on: boolean) =>
    `flex items-center justify-center gap-2 rounded-xl border py-3 text-sm ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;
  const opcion = (on: boolean) =>
    `flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left ${on ? "border-foreground bg-secondary" : "border-border bg-card"}`;
  const radio = (on: boolean) =>
    `h-4 w-4 shrink-0 rounded-full border-2 ${on ? "border-foreground bg-foreground shadow-[inset_0_0_0_2px_var(--background)]" : "border-border"}`;

  if (hecha) {
    return (
      <AppShell eyebrow={`Plan ${plan.nombre}`} title="Suscripción lista">
        <div className="space-y-5 px-5">
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
            <Sprout className="h-6 w-6" />
            <h2 className="serif mt-3 text-2xl leading-snug">
              Tu canasta {plan.nombre} llega {FRECUENCIA_LABEL[frecuencia].toLowerCase()}.
            </h2>
            <p className="mt-2 text-sm opacity-90">
              {peso(plan.precio)} por canasta · {pago}. Sin compromiso: pausa o cancela desde Planes.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="eyebrow">Lo que sigue</div>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>· Tu primera canasta se arma con lo que se cosecha esta semana.</li>
              <li>· Confirma cada canasta al recibirla: con la 3ª se abre Cosecha compartida.</li>
            </ul>
          </div>
          <Link to="/consumidor/planes" className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background">
            Planes
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow={`Plan ${plan.nombre}`}
      title="Elegir plan"
      back={
        <Link to="/consumidor/planes" aria-label="Volver a Planes" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-6 px-5 pb-4">
        {!listo ? (
          <div className="flex justify-center py-16">
            <IndicadorCarga etiqueta="Preparando tu suscripción" />
          </div>
        ) : (
          <>
            <section>
              <div className="eyebrow">Tu canasta</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PLANES.map((p) => (
                  <button key={p.id} type="button" aria-pressed={p.id === plan.id} onClick={() => setPlanId(p.id)} className={pill(p.id === plan.id)}>
                    {p.nombre}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-baseline justify-between">
                  <span className="serif text-xl">{plan.nombre}</span>
                  <span>
                    <span className="serif text-xl">{peso(plan.precio)}</span>
                    <span className="text-xs text-muted-foreground"> /canasta</span>
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  {plan.personas} · {plan.productos}
                </p>
                <p className="text-sm text-muted-foreground">{plan.nota}</p>
              </div>
            </section>

            <section>
              <div className="eyebrow">¿Cada cuándo?</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["semanal", "quincenal"] as const).map((f) => (
                  <button key={f} type="button" aria-pressed={frecuencia === f} onClick={() => setFrecuencia(f)} className={pill(frecuencia === f)}>
                    {FRECUENCIA_LABEL[f]}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="eyebrow">¿Cómo la recibes?</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["domicilio", "pickup"] as const).map((e) => (
                  <button key={e} type="button" aria-pressed={entrega === e} onClick={() => setEntrega(e)} className={pill(entrega === e)}>
                    {e === "domicilio" ? <MapPin className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                    {e === "domicilio" ? "A domicilio" : "Recoger"}
                  </button>
                ))}
              </div>
              {entrega === "pickup" ? (
                <div className="mt-3 space-y-2">
                  {PUNTOS.map((d) => (
                    <button key={d} type="button" onClick={() => setPunto(d)} className={opcion(punto === d)}>
                      <span className={radio(punto === d)} />
                      <span className="text-sm">{d}</span>
                    </button>
                  ))}
                </div>
              ) : registrada ? (
                <div className={`mt-3 ${opcion(true)}`}>
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 text-sm">{direccionCompleta({ direccion, municipio })}</span>
                  <Link to="/consumidor/perfil" className="shrink-0 text-xs underline">
                    Perfil
                  </Link>
                </div>
              ) : (
                <div className="mt-3 space-y-3 rounded-2xl border border-border bg-card p-4">
                  <label className="block text-xs text-muted-foreground">
                    Dirección de entrega
                    <input
                      autoComplete="street-address"
                      maxLength={140}
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Calle, número y colonia"
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    Municipio
                    <select
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
                    >
                      <option value="" disabled>
                        Selecciona tu municipio
                      </option>
                      {MUNICIPIOS.map((z) => (
                        <option key={z}>{z}</option>
                      ))}
                    </select>
                  </label>
                  {!direccionLista && <p className="text-[11px] text-terracota">Escribe calle, número y colonia, y elige el municipio.</p>}
                  <p className="text-[11px] text-muted-foreground">Se guarda en tu perfil para tus pedidos.</p>
                </div>
              )}
            </section>

            <section>
              <div className="eyebrow">¿Cómo pagas?</div>
              <div className="mt-3 space-y-2">
                {pagos.map(({ id, detalle, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setPago(id)} className={opcion(pago === id)}>
                    <span className={radio(pago === id)} />
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="block text-sm">
                        {id}
                        {guardados.includes(id) && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">En tu cuenta</span>}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">{detalle}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <div className="rounded-2xl bg-foreground p-4 text-background">
              <div className="flex items-baseline justify-between text-sm">
                <span className="opacity-70">
                  {plan.nombre} · {FRECUENCIA_LABEL[frecuencia].toLowerCase()}
                </span>
                <span className="serif text-2xl">{peso(plan.precio)}</span>
              </div>
              <div className="mt-1 text-[11px] opacity-60">por canasta · incluye entrega · pausa o cancela cuando quieras</div>
            </div>

            <button
              type="button"
              disabled={!puede}
              onClick={confirmar}
              className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition active:scale-[0.98] disabled:bg-secondary disabled:text-muted-foreground"
            >
              Confirmar suscripción
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
