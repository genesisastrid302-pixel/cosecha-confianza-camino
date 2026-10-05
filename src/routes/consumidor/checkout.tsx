import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, MapPin, Store, CreditCard, QrCode, Banknote, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { IndicadorCarga } from "@/components/IndicadorCarga";
import { products, getProducer, unitLabel } from "@/lib/data";
import { readCart, subscribeCart, writeCart, type CartLine } from "@/lib/cart";
import { readConsumer } from "@/lib/accounts";
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

const DIRECCIONES = ["Calle Hidalgo 214, Col. Roma, Monterrey", "Av. Vasconcelos 150, San Pedro Garza García"];
const PUNTOS = ["Local Milpa · Col. Obispado, Monterrey", "Punto Milpa · Mercado Juárez, Centro"];

const PAGOS: { id: MetodoPago; label: string; detail: string; icon: typeof CreditCard }[] = [
  { id: "Tarjeta", label: "Tarjeta", detail: "Visa terminación 4417", icon: CreditCard },
  { id: "CoDi", label: "CoDi", detail: "Pagas desde tu app del banco", icon: QrCode },
  { id: "Efectivo", label: "Efectivo", detail: "Pagas al recibir tu canasta", icon: Banknote },
];

function Checkout() {
  const navigate = useNavigate();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [entrega, setEntrega] = useState<Entrega>("domicilio");
  const [direccion, setDireccion] = useState(DIRECCIONES[0]);
  const [punto, setPunto] = useState(PUNTOS[0]);
  const [pago, setPago] = useState<MetodoPago>("Tarjeta");

  useEffect(() => {
    const c = readConsumer();
    setEntrega(c.entrega);
    setPago(c.pago);
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

  const confirmar = () => {
    createOrder({ lines, entrega, direccion: entrega === "domicilio" ? direccion : punto, pago });
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
              <div className="mt-3 space-y-2">
                {(entrega === "domicilio" ? DIRECCIONES : PUNTOS).map((d) => {
                  const on = (entrega === "domicilio" ? direccion : punto) === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => (entrega === "domicilio" ? setDireccion(d) : setPunto(d))}
                      className={option(on)}
                    >
                      <span className={radio(on)} />
                      <span className="text-sm">{d}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {entrega === "domicilio" ? "Llega mañana entre 9:00 y 13:00." : "Lista para recoger mañana desde las 11:00."}
              </p>
            </section>

            <section>
              <div className="eyebrow">Método de pago</div>
              <div className="mt-3 space-y-2">
                {PAGOS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setPago(m.id)} className={option(pago === m.id)}>
                    <m.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="block text-sm">{m.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{m.detail}</span>
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
                disabled={!ready || items.length === 0}
                className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background transition active:scale-[0.98] disabled:opacity-50"
              >
                {pago === "Efectivo" ? `Confirmar pedido · $${total}` : `Pagar $${total}`}
              </button>
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
