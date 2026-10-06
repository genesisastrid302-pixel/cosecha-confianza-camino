import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Leaf, MapPin, ShieldCheck, Snowflake, Sprout, Truck } from "lucide-react";
import { QrCode } from "@/components/QrCode";
import { EstadoPedido } from "@/components/EstadoPedido";
import { getProducer, producerDetails, products, trustScore10, unitLabel } from "@/lib/data";
import { formatScore, scoreTone } from "@/lib/score";
import { FLOW, STATUS_LABEL, formatTime, repartidor, useOrders, type Order, type OrderStatus } from "@/lib/orders";

/**
 * Página pública del QR (docs/decisiones.md): un QR por pedido, con sus lotes dentro.
 * Solo de consulta: trazabilidad y score. No muestra quién compró ni a dónde se entregó,
 * y aquí no se califica.
 */
export const Route = createFileRoute("/lote/$id")({
  head: ({ params }) => ({ meta: [{ title: `Trazabilidad del pedido ${params.id} — Milpa` }] }),
  component: Lote,
});

function Lote() {
  const { id } = Route.useParams();
  const router = useRouter();
  const orders = useOrders();
  const clave = id.toUpperCase();
  // El QR trae el número de pedido; también se puede buscar por número de lote
  const order = orders.find((o) => o.id === clave || Object.values(o.lots).includes(clave));

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 bg-background/85 px-5 pb-3 pt-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Volver"
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="eyebrow">Milpa · Del campo a tu mesa</div>
        <h1 className="display mt-1 text-3xl leading-tight">Trazabilidad del pedido</h1>
      </header>

      <main className="flex-1 space-y-5 px-5 pb-8">
        {order ? <Detalle order={order} /> : <NoEncontrado id={clave} />}
      </main>
    </div>
  );
}

function Detalle({ order }: { order: Order }) {
  const distribuidor = repartidor(order);
  const e = order.empaque;
  const pasos = FLOW.filter((s) => s !== "calificado");
  const hito = (s: OrderStatus) => [...order.history].reverse().find((h) => h.status === s);
  const problemaResuelto = order.problema && order.status !== "con_problema";

  return (
    <>
      <section className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-primary">
            {e ? "Registro verificado" : "Aún sin empacar"}
          </span>
        </div>
        <div className="flex items-center gap-4 p-4">
          <QrCode value={`milpa.app/lote/${order.id}`} size={76} />
          <div className="min-w-0">
            <div className="serif text-xl leading-tight">Pedido {order.id}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {Object.keys(order.lots).length === 1 ? "Lote" : "Lotes"} {Object.values(order.lots).join(", ")}
            </div>
          </div>
        </div>
      </section>

      <EstadoPedido order={order} />

      <section>
        <div className="eyebrow">Quién lo cultivó</div>
        <div className="mt-3 space-y-3">
          {Object.entries(order.lots).map(([slug, lote]) => {
            const p = getProducer(slug);
            const score = trustScore10(slug);
            const items = order.items.filter((i) => i.producerSlug === slug);
            return (
              <article key={slug} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <img src={p.photo} alt={p.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="serif text-lg leading-tight">{p.name}</div>
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {p.region}
                    </div>
                  </div>
                  <div className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ${scoreTone(score)}`} title="Score de confianza">
                    {formatScore(score)}
                  </div>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">Lote {lote} · Score de confianza {formatScore(score)}</div>
                <ul className="mt-2 divide-y divide-border">
                  {items.map((i) => (
                    <li key={i.productId} className="py-2.5">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="flex items-center gap-1.5"><Sprout className="h-3.5 w-3.5 text-primary" /> {i.name}</span>
                        <span className="text-xs text-muted-foreground">{i.quantity} {unitLabel(i.unit, i.quantity)}</span>
                      </div>
                      <p className="mt-0.5 pl-5 text-[11px] leading-relaxed text-muted-foreground">
                        {products.find((x) => x.id === i.productId)?.cropPractice ?? p.practice}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(producerDetails[slug]?.practices ?? []).map((pr) => (
                    <span key={pr} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px]">
                      <Leaf className="h-3 w-3 text-primary" /> {pr}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="eyebrow flex items-center gap-1.5"><Snowflake className="h-3 w-3" /> Cadena de frío</div>
        {e ? (
          <div className="mt-3 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
            <Fila l="Al empacar" v={`${e.temperatura} °C · ${formatTime(e.registradoEn)}`} />
            <Fila l="Empaque" v={`${e.tipo}${e.refrigeracion ? " · con refrigeración" : ""}`} />
            <Fila
              l={order.traslado === "productor_lleva" ? "Al recibirlo el distribuidor" : "Al recolectar"}
              v={order.temperaturaRecoleccion !== undefined ? `${order.temperaturaRecoleccion} °C` : "Pendiente"}
            />
            {e.condiciones && <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">“{e.condiciones}”</p>}
            {e.foto && <img src={e.foto} alt="Foto del empaque" className="mt-1 h-36 w-full rounded-xl object-cover" />}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            El productor registra temperatura y empaque cuando deja listo el pedido.
          </p>
        )}
      </section>

      <section>
        <div className="eyebrow flex items-center gap-1.5"><Truck className="h-3 w-3" /> Recorrido</div>
        <ol className="mt-3 space-y-4">
          {pasos.map((s, i) => {
            const h = hito(s);
            return (
              <li key={s} className="relative flex gap-4 pl-1">
                {i < pasos.length - 1 && <span className={`absolute left-[11px] top-7 h-full w-px ${h ? "bg-primary/60" : "bg-border"}`} />}
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
                    h ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {h ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <div className={`serif text-base leading-tight ${h ? "" : "text-muted-foreground"}`}>{STATUS_LABEL[s]}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {h ? formatTime(h.at) : "Pendiente"}
                    {s === "en_recoleccion" && h
                      ? order.traslado === "productor_lleva"
                        ? ` · el productor lo llevó al local de ${distribuidor}`
                        : ` · ${repartidor(order, true)} lo recogió en el campo`
                      : ""}
                    {s === "entregado" && h ? ` · ${order.entrega === "domicilio" ? "a domicilio" : "para recoger"}` : ""}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {(order.status === "rechazado" || order.problema || order.merma) && (
        <section>
          <div className="eyebrow">Incidencias</div>
          <ul className="mt-3 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
            {order.status === "rechazado" && <li>{STATUS_LABEL.rechazado}.</li>}
            {order.problema && (
              <li className="flex justify-between gap-3">
                <span>{problemaResuelto ? "Problema al recolectar, ya corregido" : "Problema al recolectar, en revisión"}</span>
                <span className="text-right text-muted-foreground">{order.problema.motivo}</span>
              </li>
            )}
            {order.merma && (
              <li className="flex justify-between gap-3">
                <span>Merma en la entrega</span>
                <span className="text-right text-muted-foreground">{order.merma.kg} kg · {order.merma.motivo} · Lote {order.merma.lote}</span>
              </li>
            )}
          </ul>
        </section>
      )}

      <p className="rounded-2xl border border-dashed border-border p-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Esta página es solo de consulta. Para calificar tu canasta entra a Milpa con la cuenta con la que compraste: solo califica quien compró.
      </p>
    </>
  );
}

function NoEncontrado({ id }: { id: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <div className="serif text-xl">No encontramos {id}</div>
      <p className="mt-2 text-sm text-muted-foreground">
        En este prototipo los pedidos se guardan en el navegador donde se hicieron, así que solo se pueden consultar desde ahí.
      </p>
    </div>
  );
}

function Fila({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{l}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
