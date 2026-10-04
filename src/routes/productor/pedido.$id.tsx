import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, Check, Camera, Printer, Star, Truck, Tractor, PackageCheck, Snowflake, QrCode as QrIcon } from "lucide-react";
import { LOCAL_DISTRIBUIDOR } from "@/lib/distribucion";
import { AppShell } from "@/components/AppShell";
import { QrCode } from "@/components/QrCode";
import { getProducer, unitLabel } from "@/lib/data";
import {
  useOrders,
  updateOrder,
  STATUS_LABEL,
  TRASLADO_LABEL,
  formatTime,
  type Empaque,
  type Order,
  type Traslado,
} from "@/lib/orders";

export const Route = createFileRoute("/productor/pedido/$id")({
  head: ({ params }) => ({ meta: [{ title: `Pedido ${params.id} · Productor — Milpa` }] }),
  component: PedidoProductor,
});

const PASOS = ["Empacar", "Cadena de frío", "QR del pedido", "Traslado"];

function PedidoProductor() {
  const { id } = Route.useParams();
  const orders = useOrders();
  const order = orders.find((o) => o.id === id);
  const [paso, setPaso] = useState(0);

  return (
    <AppShell
      eyebrow={order ? `#${order.id} · ${order.cliente}` : "Pedido"}
      title={order ? tituloPorEstado(order) : "Pedido"}
      right={
        <Link to="/productor/pedidos" aria-label="Volver a pedidos" className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-5 px-5">
        {!order ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No encontramos este pedido en este navegador.{" "}
            <Link to="/productor/pedidos" className="text-foreground underline">Ver pedidos</Link>
          </p>
        ) : (
          <>
            <Resumen order={order} />
            {order.status === "nuevo" && <Decision order={order} />}
            {order.status === "aceptado" && (
              <>
                <Stepper paso={paso} />
                {paso === 0 && <PasoEmpacar order={order} onNext={() => setPaso(1)} />}
                {paso === 1 && <PasoFrio order={order} onNext={() => setPaso(2)} />}
                {paso === 2 && <PasoQr order={order} onNext={() => setPaso(3)} />}
                {paso === 3 && <PasoTraslado order={order} />}
              </>
            )}
            {order.status === "rechazado" && (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                Rechazaste este pedido. Le avisamos a {order.cliente} y se le devuelve su pago.
              </div>
            )}
            {order.status === "con_problema" && <ProblemaReportado order={order} />}
            {!["nuevo", "aceptado", "rechazado"].includes(order.status) && <Listo order={order} />}
          </>
        )}
      </div>
    </AppShell>
  );
}

function tituloPorEstado(o: Order) {
  if (o.status === "nuevo") return "Nuevo pedido";
  if (o.status === "aceptado") return "Prepara el pedido";
  if (o.status === "rechazado") return "Pedido rechazado";
  if (o.status === "con_problema") return "Revisa este pedido";
  if (o.status === "en_recoleccion" || o.status === "en_ruta") return "Pedido en camino";
  if (["entregado", "recibido", "calificado"].includes(o.status)) return "Pedido entregado";
  return "Pedido listo";
}

function Resumen({ order }: { order: Order }) {
  const bySlug = order.items.reduce<Record<string, Order["items"]>>((acc, i) => {
    (acc[i.producerSlug] ||= []).push(i);
    return acc;
  }, {});
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {order.entrega === "domicilio" ? "A domicilio" : "Para recoger"} · {order.direccion}
          <div className="mt-0.5">Pedido {formatTime(order.createdAt)} · {order.pago}</div>
        </div>
        <div className="serif text-xl">${order.subtotal}</div>
      </div>
      <div className="mt-3 space-y-3">
        {Object.entries(bySlug).map(([slug, items]) => (
          <div key={slug}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Lote {order.lots[slug]} · {getProducer(slug).name}
            </div>
            <ul className="mt-1 space-y-1 text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between">
                  <span>{i.name}</span>
                  <span className="text-muted-foreground">
                    {i.quantity} {unitLabel(i.unit, i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Decision({ order }: { order: Order }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-2">
      <button
        onClick={() => updateOrder(order.id, { status: "aceptado" })}
        className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground"
      >
        Puedo entregar
      </button>
      <button
        onClick={() => {
          updateOrder(order.id, { status: "rechazado" });
          navigate({ to: "/productor/pedidos" });
        }}
        className="w-full rounded-full border border-border py-3 text-sm text-muted-foreground"
      >
        No esta vez
      </button>
      <p className="text-center text-[11px] text-muted-foreground">Confirma antes de las 18:00 para entrar en la ruta de mañana.</p>
    </div>
  );
}

function Stepper({ paso }: { paso: number }) {
  return (
    <ol className="flex gap-1.5">
      {PASOS.map((p, i) => (
        <li key={p} className="flex-1">
          <div className={`h-1 rounded-full ${i <= paso ? "bg-primary" : "bg-border"}`} />
          <div className={`mt-1.5 text-[10px] leading-tight ${i === paso ? "text-foreground" : "text-muted-foreground"}`}>
            {i + 1}. {p}
          </div>
        </li>
      ))}
    </ol>
  );
}

function PasoEmpacar({ order, onNext }: { order: Order; onNext: () => void }) {
  const [hechos, setHechos] = useState<string[]>([]);
  const toggle = (id: string) => setHechos((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  const todos = order.items.every((i) => hechos.includes(i.productId));
  return (
    <section className="space-y-3">
      <div>
        <h2 className="serif text-xl">Empacar producto</h2>
        <p className="text-xs text-muted-foreground">Marca cada producto conforme lo empacas.</p>
      </div>
      {order.items.map((i) => {
        const on = hechos.includes(i.productId);
        return (
          <button
            key={i.productId}
            type="button"
            onClick={() => toggle(i.productId)}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left ${on ? "border-primary bg-primary/5" : "border-border bg-card"}`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              {on && <Check className="h-4 w-4" />}
            </span>
            <span className="flex-1 text-sm">{i.name}</span>
            <span className="text-xs text-muted-foreground">
              {i.quantity} {unitLabel(i.unit, i.quantity)}
            </span>
          </button>
        );
      })}
      <button
        disabled={!todos}
        onClick={onNext}
        className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background disabled:bg-secondary disabled:text-muted-foreground"
      >
        {todos ? "Todo empacado · Continuar" : "Marca todos los productos"}
      </button>
    </section>
  );
}

const TIPOS: Empaque["tipo"][] = ["Bolsa", "Caja", "Contenedor refrigerado"];

function PasoFrio({ order, onNext }: { order: Order; onNext: () => void }) {
  const [temperatura, setTemperatura] = useState(order.empaque?.temperatura ?? 6);
  const [tipo, setTipo] = useState<Empaque["tipo"]>(order.empaque?.tipo ?? "Caja");
  const [refrigeracion, setRefrigeracion] = useState(order.empaque?.refrigeracion ?? true);
  const [condiciones, setCondiciones] = useState(order.empaque?.condiciones ?? "Sombra y ventilación; cámara fría hasta la recolección.");
  const [hora, setHora] = useState(order.empaque?.hora ?? "07:30");
  const [foto, setFoto] = useState<string | undefined>(order.empaque?.foto);

  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:border-foreground focus:outline-none";
  const fueraDeRango = refrigeracion && (temperatura < 2 || temperatura > 8);

  const guardar = () => {
    updateOrder(order.id, {
      empaque: { temperatura, tipo, refrigeracion, condiciones, hora, foto, registradoEn: new Date().toISOString() },
    });
    onNext();
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="serif text-xl">Registrar cadena de frío</h2>
        <p className="text-xs text-muted-foreground">Estos datos aparecen en el QR que escanea el consumidor.</p>
      </div>
      <label className="block">
        <span className="text-xs text-muted-foreground">Temperatura al entregar</span>
        <div className="relative">
          <input type="number" step="0.5" value={temperatura} onChange={(e) => setTemperatura(Number(e.target.value))} className={input} />
          <span className="pointer-events-none absolute right-4 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-muted-foreground">°C</span>
        </div>
        {fueraDeRango && <span className="mt-1 block text-[11px] text-terracota">Fuera del rango recomendado (2–8 °C).</span>}
      </label>
      <div>
        <span className="text-xs text-muted-foreground">Tipo de empaque</span>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`rounded-xl border px-2 py-3 text-xs ${tipo === t ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setRefrigeracion((r) => !r)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
      >
        <span className="text-sm">Requiere refrigeración</span>
        <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${refrigeracion ? "bg-primary" : "bg-secondary"}`}>
          <span className={`h-5 w-5 rounded-full bg-background shadow transition ${refrigeracion ? "translate-x-5" : ""}`} />
        </span>
      </button>
      <label className="block">
        <span className="text-xs text-muted-foreground">Condiciones de almacenamiento</span>
        <textarea value={condiciones} onChange={(e) => setCondiciones(e.target.value)} rows={2} maxLength={200} className={input} />
      </label>
      <label className="block">
        <span className="text-xs text-muted-foreground">Hora de entrega al distribuidor</span>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={input} />
      </label>
      <FotoEmpaque foto={foto} onChange={setFoto} />
      <button onClick={guardar} className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
        Guardar y generar QR
      </button>
    </section>
  );
}

function FotoEmpaque({ foto, onChange }: { foto?: string; onChange: (f?: string) => void }) {
  const leer = (file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // Reducimos la foto para que quepa en el almacenamiento del navegador
      const max = 480;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      onChange(canvas.toDataURL("image/jpeg", 0.7));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  return (
    <div>
      <span className="text-xs text-muted-foreground">Foto del empaque</span>
      <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-card p-3">
        {foto ? (
          <img src={foto} alt="Foto del empaque" className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </span>
        )}
        <span className="text-sm">{foto ? "Cambiar foto" : "Tomar o subir foto"}</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && leer(e.target.files[0])}
        />
      </label>
    </div>
  );
}

function PasoQr({ order, onNext }: { order: Order; onNext: () => void }) {
  useEffect(() => {
    if (!order.qrGeneradoEn) updateOrder(order.id, { qrGeneradoEn: new Date().toISOString() });
  }, [order.id, order.qrGeneradoEn]);
  return (
    <section className="space-y-4">
      <div>
        <h2 className="serif text-xl">QR del pedido</h2>
        <p className="text-xs text-muted-foreground">Imprímelo y pégalo en el empaque. El consumidor lo escanea al recibir.</p>
      </div>
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-5">
        <QrCode value={`milpa.app/lote/${order.id}`} size={200} />
        <div className="serif mt-3 text-lg">{order.id}</div>
        <div className="text-[11px] text-muted-foreground">Lotes: {Object.values(order.lots).join(", ")}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">milpa.app/lote/{order.id}</div>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm"
      >
        <Printer className="h-4 w-4" /> Imprimir QR
      </button>
      <button onClick={onNext} className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
        Ya lo pegué · Continuar
      </button>
    </section>
  );
}

function PasoTraslado({ order }: { order: Order }) {
  const [eleccion, setEleccion] = useState<Traslado | null>(order.traslado ?? null);
  const opciones: { id: Traslado; title: string; detail: string; icon: typeof Truck }[] = [
    { id: "productor_lleva", title: "Yo lo llevo", detail: "Al local del distribuidor · Col. Obispado", icon: Tractor },
    { id: "distribuidor_recoge", title: "Que lo recojan", detail: "El distribuidor pasa a tu campo en su ruta", icon: Truck },
  ];
  return (
    <section className="space-y-3">
      <div>
        <h2 className="serif text-xl">¿Quién hace la entrega?</h2>
        <p className="text-xs text-muted-foreground">Le avisamos al distribuidor con los detalles.</p>
      </div>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setEleccion(o.id)}
          className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${eleccion === o.id ? "border-foreground bg-secondary" : "border-border bg-card"}`}
        >
          <o.icon className="h-6 w-6 shrink-0 text-primary" />
          <span className="flex-1">
            <span className="block text-sm font-medium">{o.title}</span>
            <span className="block text-[11px] text-muted-foreground">{o.detail}</span>
          </span>
        </button>
      ))}
      <button
        disabled={!eleccion}
        onClick={() => eleccion && updateOrder(order.id, { traslado: eleccion, status: "empacado" })}
        className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground"
      >
        Confirmar y avisar al distribuidor
      </button>
    </section>
  );
}

/** Alerta del distribuidor al recolectar; el productor lo corrige y lo deja listo otra vez */
function ProblemaReportado({ order }: { order: Order }) {
  const pr = order.problema;
  return (
    <section className="space-y-3 rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-terracota">
        <AlertTriangle className="h-4 w-4" /> El distribuidor reportó un problema
      </div>
      {pr && (
        <>
          <div className="text-sm">{pr.motivo}</div>
          {pr.detalle && <p className="text-xs text-muted-foreground">“{pr.detalle}” · {formatTime(pr.at)}</p>}
          {pr.foto && <img src={pr.foto} alt="Evidencia del problema" className="h-32 w-full rounded-xl object-cover" />}
        </>
      )}
      <button
        onClick={() => updateOrder(order.id, { status: "empacado" })}
        className="w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background"
      >
        Ya lo corregí · dejarlo listo otra vez
      </button>
      <p className="text-[11px] text-muted-foreground">El pedido vuelve a la ruta del distribuidor y le avisamos al consumidor.</p>
    </section>
  );
}

function Listo({ order }: { order: Order }) {
  const e = order.empaque;
  const f = order.feedback;
  return (
    <section className="space-y-4">
      {order.status !== "con_problema" && (
        <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
          <PackageCheck className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <div className="text-sm font-medium">{STATUS_LABEL[order.status]}</div>
            <div className="text-[11px] text-muted-foreground">
              {order.traslado ? TRASLADO_LABEL[order.traslado] : ""}
              {order.status === "empacado" && order.traslado === "productor_lleva" ? ` · Llévalo a ${LOCAL_DISTRIBUIDOR}; el distribuidor confirma al recibirlo.` : ""}
              {order.status === "empacado" && order.traslado === "distribuidor_recoge" ? " · Ya está en su ruta." : ""}
            </div>
          </div>
        </div>
      )}
      {f && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="eyebrow">Calificación de {order.cliente}</div>
          <div className="mt-2 flex items-center gap-1 text-miel" aria-label={`${f.estrellas} de 5 estrellas`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < f.estrellas ? "fill-current" : "opacity-30"}`} />
            ))}
          </div>
          {f.nota && <p className="serif mt-2 italic">“{f.nota}”</p>}
          {f.merma && <p className="mt-2 text-xs text-terracota">Reportó merma al recibir.</p>}
        </div>
      )}
      {e && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="eyebrow flex items-center gap-1.5"><Snowflake className="h-3 w-3" /> Cadena de frío</div>
          <Fila l="Temperatura" v={`${e.temperatura} °C`} />
          <Fila l="Empaque" v={e.tipo} />
          <Fila l="Refrigeración" v={e.refrigeracion ? "Sí" : "No"} />
          <Fila l="Entrega" v={e.hora} />
          <p className="pt-1 text-[11px] text-muted-foreground">{e.condiciones}</p>
          {e.foto && <img src={e.foto} alt="Foto del empaque" className="mt-2 h-32 w-full rounded-xl object-cover" />}
        </div>
      )}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <QrCode value={`milpa.app/lote/${order.id}`} size={72} />
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1 text-foreground"><QrIcon className="h-3.5 w-3.5" /> QR {order.id}</div>
          Lotes {Object.values(order.lots).join(", ")}
        </div>
      </div>
    </section>
  );
}

function Fila({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span>{v}</span>
    </div>
  );
}
