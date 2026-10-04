import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight, MapPin, Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { nombreCorto, useDistributor } from "@/lib/accounts";
import { useOrders, crearPedidoEjemplo } from "@/lib/orders";
import { entregasPendientes, esperandoProductor, fueEntregado, kpis, paradasRecoleccion, tiempoEstimado } from "@/lib/distribucion";

export const Route = createFileRoute("/distribuidor/")({
  head: () => ({ meta: [{ title: "Inicio · Distribuidor — Milpa" }] }),
  component: Inicio,
});

function Inicio() {
  const d = useDistributor();
  const orders = useOrders();
  const k = kpis(orders);
  const recolecciones = paradasRecoleccion(orders);
  const entregas = entregasPendientes(orders);
  const esperando = esperandoProductor(orders);
  const hoy = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const paradas = recolecciones.length + entregas.length;
  const hechas = orders.filter(fueEntregado).length;

  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow={hoy} title={nombreCorto(d.nombre).split(" ")[0]}>
      <div className="space-y-5 px-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Kpi n={`${k.aTiempoPct}%`} l="Entregas a tiempo" />
          <Kpi n={`${k.mermaPct}%`} l="Merma" alerta />
          <Kpi n={String(k.activos)} l="Pedidos activos" />
        </div>

        {esperando.length > 0 && (
          <div className="flex items-start gap-2 rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-3 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-terracota" />
            <span>
              {esperando.length === 1 ? "1 pedido espera" : `${esperando.length} pedidos esperan`} al productor antes de entrar a tu ruta:{" "}
              {esperando.map((o) => `#${o.id}`).join(", ")}.
            </span>
          </div>
        )}

        <section>
          <div className="eyebrow">Ruta del día</div>
          {paradas === 0 ? (
            <div className="mt-3 rounded-2xl border border-border bg-card p-5 text-center">
              <p className="text-sm text-muted-foreground">
                {hechas > 0
                  ? `Ruta terminada: entregaste ${hechas} ${hechas === 1 ? "pedido" : "pedidos"}.`
                  : "No hay pedidos listos. Cuando un productor termine de empacar, su recolección aparece aquí."}
              </p>
              {orders.length === 0 && (
                <button onClick={() => crearPedidoEjemplo()} className="mt-3 rounded-full border border-border px-4 py-2 text-xs">
                  Probar con un pedido de ejemplo
                </button>
              )}
            </div>
          ) : (
            <Link to="/distribuidor/ruta" className="mt-3 block rounded-2xl bg-miel p-5 text-ink">
              <div className="flex items-center justify-between">
                <div>
                  <div className="display text-4xl">{paradas} {paradas === 1 ? "parada" : "paradas"}</div>
                  <div className="mt-1 text-xs opacity-80">
                    {recolecciones.length} {recolecciones.length === 1 ? "recolección" : "recolecciones"} · {entregas.length}{" "}
                    {entregas.length === 1 ? "entrega" : "entregas"} · {tiempoEstimado(recolecciones, entregas)}
                  </div>
                </div>
                <ChevronRight className="h-6 w-6" />
              </div>
            </Link>
          )}
          <div className="mt-3 space-y-2">
            {recolecciones.map((r) => (
              <Link key={r.key} to="/distribuidor/ruta" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {r.enLocal ? <Store className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    {r.nombre}{" "}
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">· {r.enLocal ? "Recibir en local" : "Recolección"}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{r.lugar}</div>
                </div>
                <div className="text-xs">{r.kg} kg</div>
              </Link>
            ))}
            {entregas.map((o) => (
              <Link key={o.id} to="/distribuidor/ruta" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracota/10 text-terracota">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    {o.cliente} <span className="text-[10px] uppercase tracking-widest text-muted-foreground">· {o.entrega === "domicilio" ? "Entrega" : "Para recoger"}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{o.direccion}</div>
                </div>
                <div className="text-xs">#{o.id}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="divide-y divide-border rounded-2xl border border-border bg-card text-sm">
          <Acceso to="/distribuidor/trazabilidad" label="Trazabilidad" detail="Lotes y cadena de frío" />
          <Acceso to="/distribuidor/analytics" label="Rendimiento" detail={`${k.entregas} entregas · ${k.mermaKg} kg de merma`} />
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({ n, l, alerta }: { n: string; l: string; alerta?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${alerta ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"}`}>
      <div className={`serif text-2xl ${alerta ? "text-destructive" : ""}`}>{n}</div>
      <div className="mt-0.5 text-[9px] uppercase leading-tight tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}

function Acceso({ to, label, detail }: { to: "/distribuidor/trazabilidad" | "/distribuidor/analytics"; label: string; detail: string }) {
  return (
    <Link to={to} className="flex items-center justify-between px-4 py-3.5">
      <span>{label}</span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {detail} <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
