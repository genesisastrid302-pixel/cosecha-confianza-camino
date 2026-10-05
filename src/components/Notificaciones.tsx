import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";
import { STATUS_LABEL, formatTime, siguientePaso, useOrders } from "@/lib/orders";
import { agruparPorPedido, destinoPedido, leerVisto, marcarVistos, useAvisos, type Aviso, type GrupoPedido, type Rol } from "@/lib/notificaciones";

const VACIO: Record<Rol, string> = {
  productor: "Aquí te avisamos de pedidos nuevos, recolecciones, pagos y calificaciones.",
  consumidor: "Aquí te avisamos cuando acepten, empaquen y entreguen tu pedido.",
  distribuidor: "Aquí te avisamos cuando un pedido se confirme y esté listo para recolectar.",
};

/**
 * Pantalla de Notificaciones, la misma para los tres roles.
 * Una sección por pedido: en la vista previa va el estado del pedido y su última
 * novedad; al abrirla, todas sus novedades y un solo acceso a la pantalla del pedido.
 */
export function Notificaciones({ rol, tabs, tone }: { rol: Rol; tabs: Tab[]; tone: "milpa" | "miel" | "terracota" }) {
  const { avisos } = useAvisos(rol);
  const orders = useOrders();
  // Lo que no había visto antes de entrar se queda resaltado durante esta visita
  const [corte, setCorte] = useState<string | null>(null);
  const hecho = useRef(false);
  useEffect(() => {
    if (hecho.current) return;
    hecho.current = true;
    setCorte(leerVisto(rol));
    marcarVistos(rol);
  }, [rol]);

  const esNuevo = (a: Aviso) => corte !== null && a.at > corte;
  const sinVer = avisos.filter(esNuevo).length;
  const { grupos, sueltos } = agruparPorPedido(avisos, orders);

  return (
    <AppShell
      tabs={tabs}
      tone={tone}
      eyebrow={sinVer > 0 ? `${sinVer} sin ver` : "Al día"}
      title="Notificaciones"
      back={
        <Link to={`/${rol}`} aria-label="Volver al inicio" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-5 px-5">
        {avisos.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
            <div className="serif mt-2 text-lg">Sin notificaciones todavía</div>
            <p className="mt-1 text-sm text-muted-foreground">{VACIO[rol]}</p>
          </div>
        )}

        {grupos.length > 0 && (
          <section>
            <div className="eyebrow">Por pedido</div>
            <div className="mt-2 space-y-2.5">
              {grupos.map((g) => (
                <SeccionPedido key={g.order.id} rol={rol} grupo={g} esNuevo={esNuevo} />
              ))}
            </div>
          </section>
        )}

        {sueltos.length > 0 && (
          <section>
            <div className="eyebrow">Otros avisos</div>
            <div className="mt-2 space-y-2.5">
              {sueltos.map((a) => (
                <Link
                  key={a.id}
                  to={a.href}
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${esNuevo(a) ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="serif block text-base leading-tight">{a.titulo}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{a.detalle}</span>
                    <span className="mt-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">{formatTime(a.at)}</span>
                  </span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function SeccionPedido({ rol, grupo, esNuevo }: { rol: Rol; grupo: GrupoPedido; esNuevo: (a: Aviso) => boolean }) {
  const { order, avisos } = grupo;
  const nuevos = avisos.filter(esNuevo).length;
  const alerta = avisos.some((a) => a.alerta) && order.status === "con_problema";
  // Se abren solas las secciones con novedades sin ver
  const [abierta, setAbierta] = useState<boolean | null>(null);
  const abiertaFinal = abierta ?? nuevos > 0;
  const ultimo = avisos[0];
  const destino = destinoPedido(rol, order);
  const idPanel = `avisos-${order.id}`;
  // Dentro de la sección del pedido no hace falta repetir su número
  const sinNumero = (t: string) => t.replace(`#${order.id} · `, "").replace(` #${order.id}`, "").replace(`#${order.id} `, "");

  return (
    <article
      className={`overflow-hidden rounded-2xl border ${
        alerta ? "border-terracota/40 bg-terracota/5" : nuevos > 0 ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <button
        type="button"
        onClick={() => setAbierta(!abiertaFinal)}
        aria-expanded={abiertaFinal}
        aria-controls={idPanel}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="serif text-base leading-tight">Pedido #{order.id}</span>
            {nuevos > 0 && (
              <span className="rounded-full bg-terracota px-1.5 text-[10px] font-medium leading-4 text-background" aria-label={`${nuevos} sin ver`}>
                {nuevos}
              </span>
            )}
          </span>
          <span
            className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] ${
              alerta ? "bg-terracota/15 text-terracota" : "bg-secondary text-foreground"
            }`}
          >
            {alerta && <AlertTriangle className="h-3 w-3" />}
            {STATUS_LABEL[order.status]}
          </span>
          <span className="mt-1.5 block truncate text-xs text-muted-foreground">
            {sinNumero(ultimo.titulo)} · {formatTime(ultimo.at)}
          </span>
        </span>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition ${abiertaFinal ? "rotate-180" : ""}`} />
      </button>

      {abiertaFinal && (
        <div id={idPanel} className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Sigue:</span> {siguientePaso(order)}
          </p>
          <ol className="mt-3 space-y-3">
            {avisos.map((a) => (
              <li key={a.id} className="relative pl-4">
                <span className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${esNuevo(a) ? "bg-terracota" : a.alerta ? "bg-terracota/60" : "bg-border"}`} />
                <div className={`text-sm leading-tight ${a.alerta ? "text-terracota" : ""}`}>{sinNumero(a.titulo)}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{sinNumero(a.detalle)}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{formatTime(a.at)}</div>
              </li>
            ))}
          </ol>
          {destino && (
            <Link
              to={destino.href}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground py-3 text-sm font-medium text-background"
            >
              {destino.label} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
