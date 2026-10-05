import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Banknote, Camera, Check, ChevronLeft, Eraser, MapPin, Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { unitLabel } from "@/lib/data";
import { codigoDe, pesoPedido, useOrders, updateOrder, type Merma, type Order } from "@/lib/orders";
import { fueEntregado } from "@/lib/distribucion";
import { fileToDataUrl } from "@/lib/producer-store";

export const Route = createFileRoute("/distribuidor/entrega/$id")({
  head: ({ params }) => ({ meta: [{ title: `Entrega ${params.id} · Distribuidor — Milpa` }] }),
  component: Entrega,
});

function Entrega() {
  const { id } = Route.useParams();
  const order = useOrders().find((o) => o.id === id);
  const [fase, setFase] = useState<"entrega" | "merma">("entrega");

  const volver = (
    <Link to="/distribuidor/ruta" aria-label="Volver a la ruta" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
      <ChevronLeft className="h-5 w-5" />
    </Link>
  );

  if (!order) {
    return (
      <AppShell eyebrow="Entrega" title="Entrega" back={volver}>
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">No encontramos este pedido en este navegador.</p>
      </AppShell>
    );
  }

  const domicilio = order.entrega === "domicilio";

  return (
    <AppShell eyebrow={`#${order.id} · ${domicilio ? "A domicilio" : "Para recoger"}`} title={fase === "merma" ? "Registro de merma" : order.cliente} back={volver}>
      <div className="space-y-5 px-5">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            {domicilio ? <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <Store className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
            {order.direccion}
          </div>
          <ul className="mt-3 space-y-1">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between">
                <span>{i.name}</span>
                <span className="text-muted-foreground">{i.quantity} {unitLabel(i.unit, i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            Lotes {Object.values(order.lots).join(", ")} · {pesoPedido(order)} kg
          </div>
        </div>

        {fase === "merma" ? (
          <RegistroMerma order={order} />
        ) : fueEntregado(order) ? (
          <div className="rounded-2xl bg-primary/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium text-primary"><Check className="h-4 w-4" /> Entregado</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.status === "entregado" ? "El consumidor confirma y califica desde su app." : "El consumidor ya confirmó que lo recibió."}
              {order.merma ? ` Merma registrada: ${order.merma.kg} kg (${order.merma.motivo.toLowerCase()}).` : ""}
            </p>
          </div>
        ) : order.status !== "en_ruta" ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Este pedido todavía no sale a entrega. Termina las recolecciones y toca “Salir a entregar” en{" "}
            <Link to="/distribuidor/ruta" className="text-foreground underline">Ruta</Link>.
          </div>
        ) : (
          <ConfirmarEntrega order={order} onDone={() => setFase("merma")} />
        )}
      </div>
    </AppShell>
  );
}

function ConfirmarEntrega({ order, onDone }: { order: Order; onDone: () => void }) {
  const domicilio = order.entrega === "domicilio";
  const efectivo = order.pago === "Efectivo";
  const [llego, setLlego] = useState(domicilio);
  const [codigo, setCodigo] = useState("");
  const [identidad, setIdentidad] = useState(false);
  const [firmado, setFirmado] = useState(false);
  const [cobrado, setCobrado] = useState(!efectivo);
  const codigoOk = codigo === codigoDe(order);
  const listo = llego && codigoOk && cobrado && (domicilio ? firmado : identidad);
  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-center text-lg tracking-[0.4em] focus:border-foreground focus:outline-none";

  return (
    <div className="space-y-4">
      {!domicilio && (
        <Casilla checked={llego} onChange={setLlego} label={`${order.cliente} llegó al punto de entrega`} />
      )}

      {efectivo && (
        <div className="rounded-2xl border-2 border-miel/50 bg-miel/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Banknote className="h-4 w-4" /> Cobrar ${order.total} en efectivo</div>
          <div className="mt-3"><Casilla checked={cobrado} onChange={setCobrado} label={`Recibí $${order.total}`} /></div>
        </div>
      )}

      <label className="block">
        <span className="text-xs text-muted-foreground">Código de entrega · pídeselo a {order.cliente.split(" ")[0]}</span>
        <input inputMode="numeric" maxLength={4} value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} className={input} placeholder="0000" aria-label="Código de entrega" />
        {codigo.length === 4 && (
          <span className={`mt-1 block text-[11px] ${codigoOk ? "text-primary" : "text-terracota"}`}>
            {codigoOk ? "✓ Código correcto" : "El código no coincide. El consumidor lo ve en su pedido."}
          </span>
        )}
      </label>

      {domicilio ? (
        <div>
          <span className="text-xs text-muted-foreground">Firma de quien recibe</span>
          <Firma onChange={setFirmado} />
        </div>
      ) : (
        <Casilla checked={identidad} onChange={setIdentidad} label="Verifiqué su identidad (nombre e identificación)" />
      )}

      <button
        disabled={!listo}
        onClick={() => {
          updateOrder(order.id, {
            status: "entregado",
            entregaRegistro: { at: new Date().toISOString(), firmado, identidad: domicilio ? true : identidad, cobroEfectivo: efectivo },
          });
          onDone();
        }}
        className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground"
      >
        Confirmar entrega
      </button>
    </div>
  );
}

function Casilla({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[var(--primary)]" />
      {label}
    </label>
  );
}

/** Firma digital dibujada con el dedo; solo se registra que firmó, no se guarda el trazo */
function Firma({ onChange }: { onChange: (firmado: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  return (
    <div className="relative mt-1.5">
      <canvas
        ref={ref}
        width={640}
        height={220}
        aria-label="Área de firma"
        className="h-28 w-full touch-none rounded-xl border border-input bg-card"
        onPointerDown={(e) => {
          const ctx = ref.current!.getContext("2d")!;
          drawing.current = true;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.strokeStyle = "#2a211b";
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = ref.current!.getContext("2d")!;
          const p = pos(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          onChange(true);
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />
      <button
        type="button"
        onClick={() => {
          const c = ref.current!;
          c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
          onChange(false);
        }}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px]"
      >
        <Eraser className="h-3 w-3" /> Borrar
      </button>
    </div>
  );
}

const MOTIVOS: Merma["motivo"][] = ["Daño", "Temperatura", "Otro"];

function RegistroMerma({ order }: { order: Order }) {
  const navigate = useNavigate();
  const lotes = Object.values(order.lots);
  const [hubo, setHubo] = useState<boolean | null>(null);
  const [kg, setKg] = useState(0.5);
  const [motivo, setMotivo] = useState<Merma["motivo"]>("Daño");
  const [lote, setLote] = useState(lotes[0]);
  const [foto, setFoto] = useState<string | undefined>();
  const total = pesoPedido(order);
  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:border-foreground focus:outline-none";
  const terminar = () => navigate({ to: "/distribuidor/ruta" });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/10 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-primary"><Check className="h-4 w-4" /> Entrega confirmada</div>
        <p className="mt-1 text-xs text-muted-foreground">{order.cliente} ya puede confirmar y calificar desde su app.</p>
      </div>

      <section>
        <div className="eyebrow">¿Hubo merma?</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setHubo(false)} className={`rounded-xl border py-3 text-sm ${hubo === false ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}>No</button>
          <button onClick={() => setHubo(true)} className={`rounded-xl border py-3 text-sm ${hubo === true ? "border-terracota bg-terracota text-white" : "border-border bg-card"}`}>Sí</button>
        </div>
      </section>

      {hubo === false && (
        <button onClick={terminar} className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
          Terminar y volver a la ruta
        </button>
      )}

      {hubo && (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <label className="block text-xs text-muted-foreground">
            Cantidad perdida (kg)
            <input type="number" min={0.1} max={total} step={0.1} value={kg} onChange={(e) => setKg(Number(e.target.value))} className={input} aria-label="Cantidad perdida en kg" />
            <span className="mt-1 block text-[11px]">
              {total > 0 && kg > 0 ? `${Math.round((kg / total) * 1000) / 10}% de este pedido (${total} kg)` : ""}
            </span>
          </label>
          <div>
            <span className="text-xs text-muted-foreground">Motivo</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {MOTIVOS.map((m) => (
                <button key={m} type="button" onClick={() => setMotivo(m)} className={`rounded-xl border py-2.5 text-xs ${motivo === m ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>{m}</button>
              ))}
            </div>
          </div>
          <label className="block text-xs text-muted-foreground">
            Lote afectado
            <select value={lote} onChange={(e) => setLote(e.target.value)} className={input}>
              {lotes.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-3 text-sm">
            {foto ? <img src={foto} alt="Evidencia" className="h-14 w-14 rounded-lg object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary"><Camera className="h-5 w-5 text-muted-foreground" /></span>}
            {foto ? "Cambiar foto" : "Foto de evidencia"}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => e.target.files?.[0] && setFoto(await fileToDataUrl(e.target.files[0], 480))} />
          </label>
          <button
            disabled={!(kg > 0 && kg <= total)}
            onClick={() => {
              updateOrder(order.id, { merma: { kg, motivo, lote, foto, at: new Date().toISOString() } });
              terminar();
            }}
            className="w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background disabled:bg-secondary disabled:text-muted-foreground"
          >
            Guardar merma
          </button>
        </section>
      )}
    </div>
  );
}
