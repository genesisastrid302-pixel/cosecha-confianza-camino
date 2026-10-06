import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, MapPin, Store, CreditCard, QrCode, Banknote, ShieldCheck, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { IndicadorCarga } from "@/components/IndicadorCarga";
import { products, getProducer, unitLabel } from "@/lib/data";
import { readCart, subscribeCart, writeCart, type CartLine } from "@/lib/cart";
import { MUNICIPIOS, direccionCompleta, direccionValida, readConsumer, saveConsumer } from "@/lib/accounts";
import { createOrder, LOGISTICA, PLATAFORMA, shareToProducers, type Entrega, type MetodoPago } from "@/lib/orders";

export const Route = createFileRoute("/consumidor/checkout")({
  head: () => ({
    meta: [
      { title: "Confirmar pedido · Milpa" },
      { name: "description", content: "Elige entrega y pago para tu canasta Milpa." },
    ],
  }),
  component: Checkout,
});

const PUNTOS = ["Local Milpa · Col. Obispado, Monterrey", "Punto Milpa · Mercado Juárez, Centro"];

const PAGOS: { id: MetodoPago; label: string; detail: string; icon: typeof CreditCard }[] = [
  { id: "Tarjeta", label: "Tarjeta", detail: "Débito o crédito", icon: CreditCard },
  { id: "CoDi", label: "CoDi", detail: "Pagas desde tu app del banco", icon: QrCode },
  { id: "Efectivo", label: "Efectivo", detail: "Pagas al recibir tu canasta", icon: Banknote },
];

function Checkout() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [entrega, setEntrega] = useState<Entrega>("domicilio");
  // Dirección de este pedido: parte de la que registró y la puede cambiar aquí mismo
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [registrada, setRegistrada] = useState("");
  const [editando, setEditando] = useState(false);
  const [guardar, setGuardar] = useState(true);
  const [punto, setPunto] = useState(PUNTOS[0]);
  const [pago, setPago] = useState<MetodoPago>("Tarjeta");
  // Los métodos que el consumidor guardó en su cuenta van primero; puede pagar con otro
  const [guardados, setGuardados] = useState<MetodoPago[]>([]);
  const pagos = [...PAGOS].sort((a, b) => Number(guardados.includes(b.id)) - Number(guardados.includes(a.id)));

  useEffect(() => {
    const c = readConsumer();
    setEntrega(c.entrega);
    setDireccion(c.direccion);
    setMunicipio(c.municipio);
    setRegistrada(direccionValida(c.direccion) ? direccionCompleta(c) : "");
    // Sin dirección registrada se pide desde el principio
    setEditando(!direccionValida(c.direccion));
    setGuardados(c.pagos);
    setPago(c.pagos[0]);
    const update = () => {
      setLines(readCart());
      setReady(true);
    };
    update();
    return subscribeCart(update);
  }, []);

  const items = lines.flatMap((line) => {
    const p = products.find((x) => x.id === line.id);
    return p ? [{ ...p, quantity: line.quantity }] : [];
  });
  const subtotal = items.reduce((s, p) => s + p.price * p.quantity, 0);
  const total = subtotal + LOGISTICA + PLATAFORMA;
  const productores = [...new Set(items.map((p) => getProducer(p.producerSlug).name.split(" ")[0]))];

  const destino = direccionCompleta({ direccion, municipio });
  const direccionLista = direccionValida(direccion) && !!municipio;
  const cambio = destino !== registrada;
  const listo = entrega === "pickup" || direccionLista;

  const confirmar = () => {
    if (!listo) return;
    // Si cambió la dirección y quiere conservarla, queda como la de su cuenta
    if (entrega === "domicilio" && cambio && guardar) saveConsumer({ ...readConsumer(), direccion: direccion.trim(), municipio });
    createOrder({ lines, entrega, direccion: entrega === "domicilio" ? destino : punto, pago });
    writeCart([]);
    navigate({ to: "/consumidor/pedidos" });
  };

  const option = (on: boolean) =>
    `flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
      on ? "border-foreground bg-secondary" : "border-border bg-card"
    }`;
  const radio = (on: boolean) =>
    `h-4 w-4 shrink-0 rounded-full border-2 ${on ? "border-foreground bg-foreground shadow-[inset_0_0_0_2px_var(--background)]" : "border-border"}`;

  return (
    <AppShell
      eyebrow="Tu canasta"
      title="Confirmar pedido"
      back={
        <Link to="/consumidor/carrito" aria-label="Volver al carrito" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-6 px-5">
        {!ready ? (
          <div className="flex justify-center py-16">
            <IndicadorCarga etiqueta="Cargando tu pedido" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Tu canasta está vacía.{" "}
            <Link to="/consumidor" className="text-foreground underline">Ir al Mercado</Link>
          </div>
        ) : (
          <>
            <section>
              <div className="eyebrow">¿Cómo la recibes?</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["domicilio", "pickup"] as const).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEntrega(e)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm ${
                      entrega === e ? "border-foreground bg-foreground text-background" : "border-border bg-card"
                    }`}
                  >
                    {e === "domicilio" ? <MapPin className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                    {e === "domicilio" ? "A domicilio" : "Recoger"}
                  </button>
                ))}
              </div>
              {entrega === "pickup" ? (
                <div className="mt-3 space-y-2">
                  {PUNTOS.map((d) => (
                    <button key={d} type="button" onClick={() => setPunto(d)} className={option(punto === d)}>
                      <span className={radio(punto === d)} />
                      <span className="text-sm">{d}</span>
                    </button>
                  ))}
                </div>
              ) : editando ? (
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
                      <option value="" disabled>Selecciona tu municipio</option>
                      {MUNICIPIOS.map((z) => <option key={z}>{z}</option>)}
                    </select>
                  </label>
                  {!direccionLista && <p className="text-[11px] text-terracota">Escribe calle, número y colonia, y elige el municipio.</p>}
                  {direccionLista && cambio && (
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={guardar} onChange={(e) => setGuardar(e.target.checked)} className="h-4 w-4 accent-[var(--foreground)]" />
                      {registrada ? "Guardarla como mi dirección en mi perfil" : "Guardarla en mi perfil"}
                    </label>
                  )}
                  {registrada && (
                    <button
                      type="button"
                      onClick={() => {
                        const c = readConsumer();
                        setDireccion(c.direccion);
                        setMunicipio(c.municipio);
                        setEditando(false);
                      }}
                      className="text-xs text-muted-foreground underline"
                    >
                      Usar la de mi cuenta
                    </button>
                  )}
                </div>
              ) : (
                <div className={`mt-3 ${option(true)}`}>
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{destino}</span>
                    <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">En tu cuenta</span>
                  </span>
                  <button type="button" onClick={() => setEditando(true)} className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                    <Pencil className="h-3 w-3" /> Cambiar dirección
                  </button>
                </div>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                {entrega === "domicilio" ? "Llega mañana entre 9:00 y 13:00." : "Lista para recoger mañana desde las 11:00."}
              </p>
            </section>

            <section>
              <div className="eyebrow">Método de pago</div>
              <div className="mt-3 space-y-2">
                {pagos.map((m) => (
                  <button key={m.id} type="button" onClick={() => setPago(m.id)} className={option(pago === m.id)}>
                    <m.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-sm">
                        {m.label}
                        {guardados.includes(m.id) && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">En tu cuenta</span>
                        )}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {m.detail}
                      </span>
                    </span>
                    <span className={radio(pago === m.id)} />
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="eyebrow mb-2">Resumen</div>
              {items.map((p) => (
                <div key={p.id} className="flex justify-between text-muted-foreground">
                  <span>
                    {p.quantity} {unitLabel(p.unit, p.quantity)} · {p.name}
                  </span>
                  <span>${p.price * p.quantity}</span>
                </div>
              ))}
              <div className="my-2 h-px bg-border" />
              <Row l="Subtotal" v={subtotal} />
              <Row l="Logística + cadena de frío" v={LOGISTICA} />
              <Row l="Plataforma Milpa" v={PLATAFORMA} />
              <div className="my-2 h-px bg-border" />
              <Row l="Total" v={total} bold />
              <p className="pt-1 text-[11px] text-muted-foreground">
                Tu pago se reparte en automático: <span className="font-medium text-primary">${subtotal} ({shareToProducers(subtotal)}%)</span> a{" "}
                {productores.join(" y ")}, ${LOGISTICA} al distribuidor y ${PLATAFORMA} a Milpa.
              </p>
            </section>

            <div className="space-y-2">
              <button
                type="button"
                onClick={confirmar}
                disabled={!ready || items.length === 0 || !listo}
                className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background transition active:scale-[0.98] disabled:opacity-50"
              >
                {pago === "Efectivo" ? `Confirmar pedido · $${total}` : `Pagar $${total}`}
              </button>
              {!listo && <p className="text-center text-[11px] text-terracota">Falta tu dirección de entrega.</p>}
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Pago seguro con Conekta · prototipo, no se cobra
              </p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Row({ l, v, bold }: { l: string; v: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium" : "text-muted-foreground"}`}>
      <span>{l}</span>
      <span>${v}</span>
    </div>
  );
}
