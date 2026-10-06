import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { getProducer, products, scoreTone, trustScore10, unitLabel } from "@/lib/data";
import { formatScore } from "@/lib/score";
import { useOrders } from "@/lib/orders";
import { readReservas, type Reserva } from "@/lib/distribucion";
import { listarCuentas } from "@/lib/producer-store";

export const Route = createFileRoute("/distribuidor/catalogo")({
  head: () => ({
    meta: [{ title: "Catálogo · Distribuidor — Milpa" }, { name: "description", content: "Cultivos de todos los productores activos y planeación de volumen." }],
  }),
  component: Catalogo,
});

const FILTROS = ["Por temporada", "Por producto", "Por disponibilidad"] as const;
type Filtro = (typeof FILTROS)[number];

function fechaCosecha(dias: number) {
  if (dias <= 0) return "Disponible hoy";
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `Cosecha ${d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`;
}

function Catalogo() {
  const orders = useOrders();
  // Cosechas compartidas de todos los productores registrados en este navegador
  const [cosechas, setCosechas] = useState<{ id: string; cropName: string; harvestDate: string; expectedKg: number; productor: string }[]>([]);
  useEffect(
    () => setCosechas(listarCuentas().flatMap(({ state }) => state.cosechas.map((c) => ({ ...c, productor: state.profile.name })))),
    [],
  );
  const [filtro, setFiltro] = useState<Filtro | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  useEffect(() => setReservas(readReservas()), []);

  const lista = useMemo(() => {
    let l = [...products];
    if (filtro === "Por temporada") l = l.filter((p) => p.badge === "temporada");
    if (filtro === "Por producto") l.sort((a, b) => a.name.localeCompare(b.name));
    if (filtro === "Por disponibilidad") l.sort((a, b) => a.harvestIn - b.harvestIn || b.unitsLeft - a.unitsLeft);
    return l;
  }, [filtro]);

  // Cantidad que piden los pedidos en curso, por producto (en la unidad de cada cultivo)
  const pedidos = orders.filter((o) => ["nuevo", "aceptado", "empacado", "en_recoleccion", "en_ruta", "con_problema"].includes(o.status));
  const necesario = new Map<string, number>();
  pedidos.forEach((o) => o.items.forEach((i) => necesario.set(i.productId, (necesario.get(i.productId) ?? 0) + i.quantity)));
  const planeacion = [...necesario.entries()].flatMap(([id, kg]) => {
    const p = products.find((x) => x.id === id);
    return p ? [{ p, kg }] : [];
  });

  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Todos los productores" title="Catálogo">
      <div className="space-y-6 px-5">
        <div className="flex gap-2 overflow-x-auto text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(filtro === f ? null : f)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 ${filtro === f ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {lista.map((p) => {
            const producer = getProducer(p.producerSlug);
            const s = trustScore10(p.producerSlug);
            return (
              <div key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                <img src={p.photo} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="serif text-base leading-tight">{p.name}</div>
                    <div className="shrink-0 text-sm">${p.price}<span className="text-[10px] text-muted-foreground"> / {unitLabel(p.unit)}</span></div>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {p.unitsLeft} {unitLabel(p.unit, p.unitsLeft)} disponibles · {fechaCosecha(p.harvestIn)}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                    <span>{producer.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${scoreTone(s)}`}>{formatScore(s)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {lista.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No hay cultivos con ese filtro.</p>}
        </div>

        <section>
          <div className="eyebrow">Planeación de volumen</div>
          <p className="mt-1 text-[11px] text-muted-foreground">Lo que piden los pedidos en curso frente a lo disponible.</p>
          <div className="mt-3 space-y-2">
            {planeacion.length === 0 && <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">No hay pedidos en curso.</p>}
            {planeacion.map(({ p, kg }) => {
              const falta = kg > p.unitsLeft;
              return (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span className={falta ? "text-destructive" : ""}>{kg} de {p.unitsLeft} {unitLabel(p.unit, p.unitsLeft)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${falta ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min(100, (kg / p.unitsLeft) * 100)}%` }} />
                  </div>
                  {falta && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Los pedidos superan lo disponible
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="eyebrow">Proyección de volumen</div>
          <p className="mt-1 text-[11px] text-muted-foreground">Volumen futuro según las cosechas compartidas confirmadas.</p>
          <div className="mt-3 space-y-2">
            {reservas.length === 0 && cosechas.length === 0 && (
              <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                Aún no hay reservas de cosecha compartida. Aparecen aquí cuando un consumidor reserva.
              </p>
            )}
            {reservas.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-sm">
                <div>
                  {getProducer(r.producerSlug).name}
                  <div className="text-[11px] text-muted-foreground">Plan {r.plan} · {r.semanas} semanas · {r.kgSemana} kg por semana</div>
                </div>
                <div className="serif text-lg">{r.semanas * r.kgSemana} kg</div>
              </div>
            ))}
            {cosechas.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-sm">
                <div>
                  {c.cropName} · {c.productor}
                  <div className="text-[11px] text-muted-foreground">
                    Cosecha compartida · {new Date(c.harvestDate + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <div className="serif text-lg">{c.expectedKg} kg</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
