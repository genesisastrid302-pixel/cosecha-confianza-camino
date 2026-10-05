import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, ChevronLeft, QrCode, Snowflake, ThumbsDown, ThumbsUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { unitLabel } from "@/lib/data";
import { useOrders, updateOrder } from "@/lib/orders";
import { confirmarRecoleccion, paradasRecoleccion } from "@/lib/distribucion";
import { fileToDataUrl } from "@/lib/producer-store";

export const Route = createFileRoute("/distribuidor/recoleccion/$key")({
  head: () => ({ meta: [{ title: "Recolección · Distribuidor — Milpa" }] }),
  component: Recoleccion,
});

const MOTIVOS = ["Daño visible", "Temperatura fuera de rango", "Cantidad incompleta", "Otro"];

function Recoleccion() {
  const { key } = Route.useParams();
  const navigate = useNavigate();
  const orders = useOrders();
  const parada = paradasRecoleccion(orders).find((p) => p.key === key);

  const [llegada, setLlegada] = useState(false);
  const [escaneados, setEscaneados] = useState<string[]>([]);
  const [temperatura, setTemperatura] = useState(6);
  const [estado, setEstado] = useState<"bien" | "problema" | null>(null);
  const [pedidoProblema, setPedidoProblema] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [detalle, setDetalle] = useState("");
  const [foto, setFoto] = useState<string | undefined>();

  const volver = (
    <Link to="/distribuidor/ruta" aria-label="Volver a la ruta" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
      <ChevronLeft className="h-5 w-5" />
    </Link>
  );

  if (!parada) {
    return (
      <AppShell eyebrow="Recolección" title="Recolección" back={volver}>
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          Esta parada ya no tiene lotes pendientes.{" "}
          <Link to="/distribuidor/ruta" className="text-foreground underline">Volver a la ruta</Link>
        </p>
      </AppShell>
    );
  }

  const todosEscaneados = parada.pedidos.every((p) => escaneados.includes(p.order.id));
  const afectado = parada.pedidos.length === 1 ? parada.pedidos[0].order.id : pedidoProblema;
  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:border-foreground focus:outline-none";

  const confirmar = () => {
    parada.pedidos.forEach((p) => confirmarRecoleccion(p.order, parada.slug, temperatura));
    navigate({ to: "/distribuidor/ruta" });
  };

  const reportar = () => {
    parada.pedidos.forEach((p) => {
      if (p.order.id === afectado) {
        updateOrder(p.order.id, {
          status: "con_problema",
          problema: { motivo, detalle: detalle.trim(), foto, at: new Date().toISOString() },
        });
      } else {
        confirmarRecoleccion(p.order, parada.slug, temperatura);
      }
    });
    navigate({ to: "/distribuidor/ruta" });
  };

  return (
    <AppShell eyebrow={parada.enLocal ? "Recibir en local" : "Recolección"} title={parada.nombre} back={volver}>
      <div className="space-y-5 px-5">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="text-xs text-muted-foreground">{parada.lugar}</div>
          <div className="mt-1">{parada.kg} kg en {parada.pedidos.length} {parada.pedidos.length === 1 ? "pedido" : "pedidos"}</div>
        </div>

        {/* 1 · Llegada */}
        <button
          type="button"
          onClick={() => setLlegada(true)}
          disabled={llegada}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium ${
            llegada ? "bg-primary/10 text-primary" : "bg-foreground text-background"
          }`}
        >
          {llegada && <Check className="h-4 w-4" />}
          {llegada ? "Llegada confirmada" : parada.enLocal ? "Confirmar que llegó el productor" : "Confirmar llegada"}
        </button>

        {llegada && (
          <>
            {/* 2 · QR de cada pedido */}
            <section>
              <div className="eyebrow">Escanea el QR de cada pedido</div>
              <div className="mt-3 space-y-2">
                {parada.pedidos.map((p) => {
                  const ok = escaneados.includes(p.order.id);
                  const e = p.order.empaque;
                  return (
                    <div key={p.order.id} className={`rounded-2xl border p-4 ${ok ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#{p.order.id} · Lote {p.lote}</div>
                          <ul className="mt-1 text-sm">
                            {p.items.map((i) => (
                              <li key={i.productId}>
                                {i.quantity} {unitLabel(i.unit, i.quantity)} · {i.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEscaneados((s) => [...new Set([...s, p.order.id])])}
                          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs ${ok ? "bg-primary text-primary-foreground" : "border border-border"}`}
                        >
                          {ok ? <Check className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
                          {ok ? "Verificado" : "Escanear QR"}
                        </button>
                      </div>
                      {ok && e && (
                        <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                          <Snowflake className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>
                            El productor registró {e.temperatura} °C · {e.tipo} · {e.refrigeracion ? "requiere refrigeración" : "sin refrigeración"} · listo {e.hora}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {todosEscaneados && (
              <>
                {/* 3 · Temperatura y estado */}
                <label className="block">
                  <span className="text-xs text-muted-foreground">Temperatura al {parada.enLocal ? "recibir" : "recolectar"}</span>
                  <div className="relative">
                    <input type="number" step="0.5" value={temperatura} onChange={(e) => setTemperatura(Number(e.target.value))} className={input} aria-label="Temperatura al recolectar" />
                    <span className="pointer-events-none absolute right-4 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-muted-foreground">°C</span>
                  </div>
                </label>

                <section>
                  <div className="eyebrow">¿Producto en buen estado?</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setEstado("bien")} className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm ${estado === "bien" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                      <ThumbsUp className="h-4 w-4" /> Sí
                    </button>
                    <button type="button" onClick={() => setEstado("problema")} className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm ${estado === "problema" ? "border-terracota bg-terracota text-white" : "border-border bg-card"}`}>
                      <ThumbsDown className="h-4 w-4" /> No
                    </button>
                  </div>
                </section>

                {estado === "bien" && (
                  <button onClick={confirmar} className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground">
                    Confirmar recolección
                  </button>
                )}

                {estado === "problema" && (
                  <section className="space-y-3 rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
                    <div className="eyebrow text-terracota">Reportar problema</div>
                    {parada.pedidos.length > 1 && (
                      <label className="block text-xs text-muted-foreground">
                        Pedido afectado
                        <select value={pedidoProblema} onChange={(e) => setPedidoProblema(e.target.value)} className={input}>
                          <option value="" disabled>Elige el pedido</option>
                          {parada.pedidos.map((p) => (
                            <option key={p.order.id} value={p.order.id}>#{p.order.id} · Lote {p.lote}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label className="block text-xs text-muted-foreground">
                      Motivo
                      <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className={input}>
                        {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs text-muted-foreground">
                      ¿Qué viste?
                      <textarea rows={2} maxLength={200} value={detalle} onChange={(e) => setDetalle(e.target.value)} className={input} placeholder="Describe el problema" />
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-card p-3 text-sm">
                      {foto ? <img src={foto} alt="Evidencia" className="h-14 w-14 rounded-lg object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary"><Camera className="h-5 w-5 text-muted-foreground" /></span>}
                      {foto ? "Cambiar foto" : "Foto de evidencia"}
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => e.target.files?.[0] && setFoto(await fileToDataUrl(e.target.files[0], 480))} />
                    </label>
                    <button
                      disabled={!afectado || detalle.trim().length < 5}
                      onClick={reportar}
                      className="w-full rounded-full bg-terracota py-3.5 text-sm font-medium text-white disabled:bg-secondary disabled:text-muted-foreground"
                    >
                      Reportar y avisar al productor
                    </button>
                    <p className="text-[11px] text-muted-foreground">El pedido se detiene y el productor recibe la alerta. El consumidor ve que se está revisando.</p>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
