import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { CheckCircle2, PackageCheck, Clock3, ShoppingBasket } from "lucide-react";
import { useMisPedidos, repartidor, FLOW, STATUS_LABEL, codigoDe, formatTime, muestraCodigo, pedidosEnCurso, type Order } from "@/lib/orders";
import { getProducer, unitLabel } from "@/lib/data";
import { LinkTrazabilidad } from "@/components/LinkTrazabilidad";
import { EstadoPedido } from "@/components/EstadoPedido";

export const Route = createFileRoute("/consumidor/pedidos")({
  head: () => ({ meta: [{ title: "Tus pedidos · Milpa" }] }),
  component: Pedidos,
});

function Pedidos() {
  const orders = useMisPedidos();
  const [elegido, setElegido] = useState<string | null>(null);
  // Arriba va el pedido que más necesita al consumidor (el que va en camino, con su código)
  const enCurso = pedidosEnCurso(orders);
  const active = enCurso.find((o) => o.id === elegido) ?? enCurso[0];
  const otros = enCurso.filter((o) => o !== active);
  const past = orders.filter((o) => !enCurso.includes(o));
  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="En curso" title="Pedidos">
      <div className="space-y-5 px-5">
        {active ? <LiveOrder order={active} /> : <SinPedidos />}
        {otros.length > 0 && (
          <section>
            <div className="eyebrow">También en curso</div>
            <div className="mt-2 space-y-2">
              {otros.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setElegido(o.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"
                >
                  <Clock3 className="h-5 w-5 shrink-0 text-terracota" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">#{o.id} · {o.items.map((i) => i.name).join(", ")}</div>
                    <div className="text-[11px] text-muted-foreground">{STATUS_LABEL[o.status]} · Ver detalle</div>
                  </div>
                  {muestraCodigo(o) && (
                    <div className="shrink-0 text-right">
                      <div className="text-[9px] uppercase tracking-widest text-terracota">Código</div>
                      <div className="text-base font-medium tracking-[0.2em]">{codigoDe(o)}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
        {past.length > 0 && (
        <section>
          <div className="eyebrow">Pedidos anteriores</div>
          <div className="mt-2 space-y-2">
            {past.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <CheckCircle2 className={`h-5 w-5 ${o.status === "rechazado" ? "text-muted-foreground" : "text-primary"}`} />
                <div className="flex-1">
                  <div className="text-sm">#{o.id} · {o.items.map((i) => i.name).join(", ")}</div>
                  <div className="text-[11px] text-muted-foreground">{formatTime(o.createdAt)} · {STATUS_LABEL[o.status]}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}
      </div>
    </AppShell>
  );
}

function LiveOrder({ order }: { order: Order }) {
  const producerNames = [...new Set(order.items.map((i) => getProducer(i.producerSlug).name))];
  const firstProducer = getProducer(order.items[0]?.producerSlug ?? "santiago");
  const distribuidor = repartidor(order);
  const reached = (s: (typeof FLOW)[number]) => order.history.find((h) => h.status === s);
  const steps = FLOW.slice(0, 7);
  const currentIdx = steps.indexOf(order.status as (typeof FLOW)[number]);
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <img src={firstProducer.photo} alt={firstProducer.name} className="h-32 w-full object-cover" />
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#{order.id} · {order.entrega === "domicilio" ? "A domicilio" : "Para recoger"}</div>
          <div className="mt-2 text-[11px] text-muted-foreground">Cultivado por</div>
          <div className="serif text-lg leading-tight">{producerNames.join(" y ")}</div>
          <div className="text-[11px] text-muted-foreground">
            {order.items.map((i) => `${i.quantity} ${unitLabel(i.unit, i.quantity)} ${i.name.toLowerCase()}`).join(" · ")}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{order.direccion} · ${order.total} · {order.pago}</div>
        </div>
      </div>

      {/* El código va arriba: es lo primero que necesita cuando llega el distribuidor */}
      {muestraCodigo(order) && (
        <div className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4 text-center">
          <div className="eyebrow text-terracota">Código de entrega</div>
          <div className="display mt-1 text-4xl tracking-[0.3em]">{codigoDe(order)}</div>
          <p className="mt-2 text-xs text-muted-foreground">
            {order.entrega === "domicilio"
              ? `Dáselo a ${distribuidor} cuando llegue a tu puerta.`
              : `Dáselo a ${distribuidor} cuando pases a recoger tu canasta.`}
          </p>
        </div>
      )}

      <EstadoPedido order={order} />

      <ol className="space-y-4">
        {steps.map((st, i) => {
          const hit = reached(st);
          const state = hit ? "done" : i === currentIdx + 1 ? "active" : "todo";
          return (
            <li key={st} className="relative flex gap-4 pl-1">
              {i < steps.length - 1 && <span className={`absolute left-[11px] top-7 h-full w-px ${state === "done" ? "bg-primary/60" : "bg-border"}`} />}
              <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
                state === "done" ? "border-primary bg-primary text-primary-foreground"
                : state === "active" ? "border-terracota text-terracota animate-pulse"
                : "border-border text-muted-foreground"
              }`}>
                {state === "done" ? "✓" : i + 1}
              </div>
              <div className="flex-1">
                <div className={`serif text-base leading-tight ${state === "todo" ? "text-muted-foreground" : ""}`}>{STATUS_LABEL[st]}</div>
                <div className="text-[11px] text-muted-foreground">
                  {hit ? formatTime(hit.at) : state === "active" && st === "aceptado" ? "El productor confirma antes de las 18:00" : state === "active" ? "Sigue" : "Pendiente"}
                  {st === "empacado" && hit ? ` · Lote ${Object.values(order.lots).join(", ")}` : ""}
                  {st === "en_recoleccion" && hit ? ` · por ${distribuidor}${order.temperaturaRecoleccion !== undefined ? ` · ${order.temperaturaRecoleccion} °C` : ""}` : ""}
                  {st === "entregado" && hit ? ` · por ${distribuidor}` : ""}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {order.empaque && <LinkTrazabilidad id={order.id} />}

      {order.status === "entregado" ? (
        <Link
          to="/consumidor/recibir"
          className="flex items-center justify-between rounded-2xl bg-foreground p-5 text-background shadow-[0_10px_30px_-10px_rgba(60,40,20,0.4)] transition active:scale-[0.98]"
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">Tu canasta ya llegó</div>
            <div className="serif mt-1 text-lg">Confirmar que llegó →</div>
          </div>
          <PackageCheck className="h-7 w-7" />
        </Link>
      ) : order.status === "recibido" ? (
        <Link to="/consumidor/recibir" className="block rounded-2xl border border-border bg-card p-4 text-center text-sm">
          Ya la recibiste. <span className="underline">Califica tu canasta</span>
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <Clock3 className="h-5 w-5 shrink-0" />
          Te avisamos en cada paso. Cuando llegue, aquí confirmas y escaneas el QR de tu canasta.
        </div>
      )}
    </>
  );
}

function SinPedidos() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <ShoppingBasket className="mx-auto h-7 w-7 text-terracota" />
      <div className="serif mt-3 text-lg">Aún no tienes pedidos en curso</div>
      <p className="mt-1 text-sm text-muted-foreground">
        Cuando compres, aquí sigues tu pedido paso a paso: su número, su lote y quién lo trae.
      </p>
      <Link to="/consumidor" className="mt-4 inline-flex rounded-full bg-foreground px-5 py-3 text-sm text-background">
        Mercado
      </Link>
    </div>
  );
}
