import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Clock3, MapPin, Navigation, Store, Truck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { useOrders, updateOrder, crearPedidoEjemplo } from "@/lib/orders";
import {
  entregasPendientes,
  fueEntregado,
  paradasRecoleccion,
  setRutaIniciada,
  tiempoEstimado,
  useRutaIniciada,
} from "@/lib/distribucion";

export const Route = createFileRoute("/distribuidor/ruta")({
  head: () => ({
    meta: [{ title: "Ruta · Distribuidor — Milpa" }, { name: "description", content: "Paradas de recolección y entrega de la ruta del día." }],
  }),
  component: Ruta,
});

function Ruta() {
  const orders = useOrders();
  const iniciada = useRutaIniciada();
  const recolecciones = paradasRecoleccion(orders);
  const entregas = entregasPendientes(orders);
  const porSalir = entregas.filter((o) => o.status === "en_recoleccion");
  const hechas = orders.filter(fueEntregado);
  const paradas = recolecciones.length + entregas.length;
  const destinos = [...recolecciones.filter((r) => !r.enLocal).map((r) => r.lugar), ...entregas.map((o) => o.direccion)];
  const mapsUrl =
    destinos.length > 0
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinos[destinos.length - 1])}${
          destinos.length > 1 ? `&waypoints=${encodeURIComponent(destinos.slice(0, -1).join("|"))}` : ""
        }`
      : "";

  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Ruta del día" title="Ruta">
      <div className="space-y-5 px-5">
        {paradas === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Truck className="mx-auto h-8 w-8 text-miel" />
            <p className="serif mt-3 text-lg">{hechas.length > 0 ? "Ruta terminada" : "Sin paradas por ahora"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hechas.length > 0
                ? `Entregaste ${hechas.length} ${hechas.length === 1 ? "pedido" : "pedidos"}. Los consumidores confirman y califican desde su app.`
                : "Cuando un productor termine de empacar, su recolección aparece aquí."}
            </p>
            {orders.length === 0 && (
              <button onClick={() => crearPedidoEjemplo()} className="mt-3 rounded-full border border-border px-4 py-2 text-xs">
                Probar con un pedido de ejemplo
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mapa ilustrativo de la ruta */}
            <div className="relative h-36 overflow-hidden rounded-2xl border border-border bg-secondary">
              <svg viewBox="0 0 350 144" className="absolute inset-0 h-full w-full" aria-hidden>
                {(() => {
                  const n = Math.min(paradas, 6);
                  const pts = Array.from({ length: n }).map((_, i) => {
                    const t = n === 1 ? 0.5 : i / (n - 1);
                    return { x: 30 + t * 290, y: 66 - Math.sin(t * Math.PI * 1.6) * 34 };
                  });
                  return (
                    <>
                      <polyline points={pts.map((q) => `${q.x},${q.y}`).join(" ")} fill="none" stroke="var(--miel)" strokeWidth="3" strokeDasharray="6 6" strokeLinejoin="round" />
                      {pts.map((q, i) => (
                        <g key={i}>
                          <circle cx={q.x} cy={q.y} r="11" fill="var(--foreground)" />
                          <text x={q.x} y={q.y + 4} textAnchor="middle" fontSize="11" fill="var(--background)">{i + 1}</text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
              <span className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-muted-foreground">Mapa ilustrativo</span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {tiempoEstimado(recolecciones, entregas)} estimados</span>
              <span>{recolecciones.length} recolecciones · {entregas.length} entregas</span>
            </div>

            {!iniciada ? (
              <button onClick={() => setRutaIniciada(true)} className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
                Iniciar ruta
              </button>
            ) : (
              mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm">
                  <Navigation className="h-4 w-4" /> Abrir en navegación
                </a>
              )
            )}

            {recolecciones.length > 0 && (
              <section>
                <div className="eyebrow">1 · Recolección</div>
                <div className="mt-3 space-y-2">
                  {recolecciones.map((r, i) => (
                    <Parada
                      key={r.key}
                      n={i + 1}
                      activa={iniciada || r.enLocal}
                      to="/distribuidor/recoleccion/$key"
                      params={{ key: r.key }}
                      icon={r.enLocal ? Store : MapPin}
                      titulo={r.nombre}
                      tipo={r.enLocal ? "Recibir en local" : "Recolección"}
                      lugar={r.lugar}
                      detalle={`${r.kg} kg · ${r.pedidos.map((p) => p.lote).join(", ")}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {entregas.length > 0 && (
              <section>
                <div className="eyebrow">2 · Entregas</div>
                {porSalir.length > 0 && recolecciones.length === 0 && (
                  <button
                    onClick={() => {
                      setRutaIniciada(true);
                      porSalir.forEach((o) => updateOrder(o.id, { status: "en_ruta" }));
                    }}
                    className="mt-3 w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background"
                  >
                    Salir a entregar · avisar a {porSalir.length === 1 ? "1 consumidor" : `${porSalir.length} consumidores`}
                  </button>
                )}
                {porSalir.length > 0 && recolecciones.length > 0 && (
                  <p className="mt-2 text-[11px] text-muted-foreground">Termina las recolecciones para salir a entregar.</p>
                )}
                <div className="mt-3 space-y-2">
                  {entregas.map((o, i) => (
                    <Parada
                      key={o.id}
                      n={recolecciones.length + i + 1}
                      activa={o.status === "en_ruta"}
                      to="/distribuidor/entrega/$id"
                      params={{ id: o.id }}
                      icon={MapPin}
                      tono="terracota"
                      titulo={o.cliente}
                      tipo={o.entrega === "domicilio" ? "A domicilio" : "Para recoger"}
                      lugar={o.direccion}
                      detalle={`#${o.id} · ${o.pago === "Efectivo" ? `Cobrar $${o.total} en efectivo` : "Pagado"}`}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {hechas.length > 0 && (
          <section>
            <div className="eyebrow">Entregados hoy</div>
            <div className="mt-3 space-y-2">
              {hechas.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div className="flex-1 text-sm">
                    #{o.id} · {o.cliente}
                    <div className="text-[11px] text-muted-foreground">
                      {o.status === "entregado" ? "Esperando que el consumidor confirme" : "Confirmado por el consumidor"}
                      {o.merma ? ` · Merma ${o.merma.kg} kg` : ""}
                    </div>
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

function Parada({
  n,
  activa,
  to,
  params,
  icon: Icon,
  tono = "primary",
  titulo,
  tipo,
  lugar,
  detalle,
}: {
  n: number;
  activa: boolean;
  to: "/distribuidor/recoleccion/$key" | "/distribuidor/entrega/$id";
  params: { key: string } | { id: string };
  icon: typeof MapPin;
  tono?: "primary" | "terracota";
  titulo: string;
  tipo: string;
  lugar: string;
  detalle: string;
}) {
  const color = tono === "primary" ? "bg-primary/10 text-primary" : "bg-terracota/10 text-terracota";
  const body = (
    <>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium ${color}`}>{n}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm">
          {titulo} <span className="text-[10px] uppercase tracking-widest text-muted-foreground">· {tipo}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><Icon className="h-3 w-3 shrink-0" /> <span className="truncate">{lugar}</span></div>
        <div className="text-[11px] text-muted-foreground">{detalle}</div>
      </div>
    </>
  );
  if (!activa) return <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 opacity-70">{body}</div>;
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link to={to} params={params as any} className="flex items-center gap-3 rounded-2xl border border-foreground/30 bg-card p-3">
      {body}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
