import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import santiago from "@/assets/producer-santiago.jpg";
import { CheckCircle2, PackageCheck, Clock3 } from "lucide-react";
import { useOrders, FLOW, STATUS_LABEL, codigoDe, formatTime, type Order } from "@/lib/orders";
import { nombreCorto, useDistributor } from "@/lib/accounts";
import { getProducer, unitLabel } from "@/lib/data";
import { LinkTrazabilidad } from "@/components/LinkTrazabilidad";

const steps = [
  { t: "Cosechado", d: "Ayer · 6:40 AM", s: "done" as const },
  { t: "Empacado · Lote LT-0518", d: "Ayer · 7:15 AM", s: "done" as const },
  { t: "Recolectado por Claudia", d: "Hoy · 8:02 AM · 6 °C", s: "done" as const },
  { t: "En ruta a tu colonia", d: "Hoy · 9:30 AM", s: "done" as const },
  { t: "Entrega en tu puerta", d: "Hoy · 10:42 AM", s: "active" as const },
];

export const Route = createFileRoute("/consumidor/pedidos")({
  head: () => ({ meta: [{ title: "Tus pedidos · Milpa" }] }),
  component: Pedidos,
});

function Pedidos() {
  const orders = useOrders();
  const active = orders.find((o) => o.status !== "calificado" && o.status !== "rechazado");
  const past = orders.filter((o) => o !== active);
  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="En curso" title="Pedidos">
      <div className="space-y-5 px-5">
        {active ? <LiveOrder order={active} /> : <DemoOrder />}
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
            <PastDemo />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function LiveOrder({ order }: { order: Order }) {
  const producerNames = [...new Set(order.items.map((i) => getProducer(i.producerSlug).name.split(" ")[0]))];
  const firstProducer = getProducer(order.items[0]?.producerSlug ?? "santiago");
  const distribuidor = nombreCorto(useDistributor().nombre);
  const reached = (s: (typeof FLOW)[number]) => order.history.find((h) => h.status === s);
  const steps = FLOW.slice(0, 7);
  const currentIdx = steps.indexOf(order.status as (typeof FLOW)[number]);
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <img src={firstProducer.photo} alt={firstProducer.name} className="h-32 w-full object-cover" />
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#{order.id} · {order.entrega === "domicilio" ? "A domicilio" : "Para recoger"}</div>
          <div className="serif mt-1 text-lg">De {producerNames.join(" y ")}</div>
          <div className="text-[11px] text-muted-foreground">
            {order.items.map((i) => `${i.quantity} ${unitLabel(i.unit, i.quantity)} ${i.name.toLowerCase()}`).join(" · ")}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{order.direccion} · ${order.total} · {order.pago}</div>
        </div>
      </div>

      {order.status === "con_problema" && (
        <div className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4 text-sm">
          {STATUS_LABEL.con_problema}. Te avisamos en cuanto se resuelva.
        </div>
      )}

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
                  {hit ? formatTime(hit.at) : state === "active" && st === "aceptado" ? "El productor confirma antes de las 18:00" : "Pendiente"}
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
      ) : order.status === "en_recoleccion" || order.status === "en_ruta" ? (
        <div className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4 text-center">
          <div className="eyebrow text-terracota">Código de entrega</div>
          <div className="display mt-1 text-4xl tracking-[0.3em]">{codigoDe(order)}</div>
          <p className="mt-2 text-xs text-muted-foreground">
            {order.entrega === "domicilio"
              ? `Dáselo a ${distribuidor} cuando llegue a tu puerta.`
              : `Dáselo a ${distribuidor} cuando pases a recoger tu canasta.`}
          </p>
        </div>
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

function DemoOrder() {
  return (
    <>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <img src={santiago} alt="Ezequiel" className="h-32 w-full object-cover" />
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#MLP-0518</div>
            <div className="serif mt-1 text-lg">De Ezequiel · Seis Tierras</div>
            <div className="text-[11px] text-muted-foreground">2 kg jitomate · 1 manojo cilantro</div>
          </div>
        </div>

        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="relative flex gap-4 pl-1">
              {i < steps.length - 1 && <span className={`absolute left-[11px] top-7 h-full w-px ${s.s === "done" ? "bg-primary/60" : "bg-border"}`} />}
              <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
                s.s === "done" ? "border-primary bg-primary text-primary-foreground"
                : s.s === "active" ? "border-terracota text-terracota animate-pulse"
                : "border-border text-muted-foreground"
              }`}>
                {s.s === "done" ? "✓" : i + 1}
              </div>
              <div className="flex-1">
                <div className="serif text-base leading-tight">{s.t}</div>
                <div className="text-[11px] text-muted-foreground">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>

        <LinkTrazabilidad id="MLP-0518" />

        {/* CTA: marcar como recibido */}
        <Link
          to="/consumidor/recibir"
          className="flex items-center justify-between rounded-2xl bg-foreground p-5 text-background shadow-[0_10px_30px_-10px_rgba(60,40,20,0.4)] transition active:scale-[0.98]"
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">El repartidor está en tu puerta</div>
            <div className="serif mt-1 text-lg">Confirmar que llegó →</div>
          </div>
          <PackageCheck className="h-7 w-7" />
        </Link>

        <div className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
          <div className="eyebrow text-terracota">Nota de Ezequiel</div>
          <p className="serif mt-2 italic">"Este lote se cortó cuando el sol apenas calentaba. Salió más dulce por las lluvias del fin de semana."</p>
        </div>

    </>
  );
}

function PastDemo() {
  return (
    <>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm">#MLP-0511 · Canasta Seis Tierras</div>
                <div className="text-[11px] text-muted-foreground">Hace 7 días · Calificaste 5★</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm">#MLP-0504 · Limón criollo de Rosa</div>
                <div className="text-[11px] text-muted-foreground">Hace 14 días · Calificaste 5★</div>
              </div>
            </div>
    </>
  );
}
