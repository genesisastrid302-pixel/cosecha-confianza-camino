import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { products, getProducer, trustScore10, scoreTone } from "@/lib/data";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { codigoDe, muestraCodigo, pedidosEnCurso, STATUS_LABEL, useOrders } from "@/lib/orders";
import { nombreCorto, useDistributor } from "@/lib/accounts";

export const Route = createFileRoute("/consumidor/")({
  head: () => ({
    meta: [
      { title: "Mercado · Consumidor — Milpa" },
      { name: "description", content: "Cultivos agroecológicos disponibles cerca de Monterrey." },
      { property: "og:title", content: "Mercado · Consumidor — Milpa" },
      { property: "og:description", content: "Cultivos agroecológicos disponibles cerca de Monterrey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsumidorHome,
});

const filters = ["Por temporada", "Por producto", "Por disponibilidad", "Por precio"] as const;
type Filter = (typeof filters)[number];

function ConsumidorHome() {
  const [filter, setFilter] = useState<Filter | null>(null);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    // Por defecto, primero los productores con mejor score (verde antes que amarillo)
    let l = products
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => trustScore10(b.producerSlug) - trustScore10(a.producerSlug));
    if (filter === "Por temporada") l = l.filter((p) => p.badge === "temporada");
    if (filter === "Por producto") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    if (filter === "Por disponibilidad") l = [...l].sort((a, b) => a.harvestIn - b.harvestIn);
    if (filter === "Por precio") l = [...l].sort((a, b) => a.price - b.price);
    return l;
  }, [filter, q]);

  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Semana 19 · Monterrey" title="Mercado">
      <div className="space-y-4 px-5">
        <AvisoCodigo />
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cultivo" className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none" />
        </div>

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {filters.map((f) => (
            <Button
              key={f}
              variant="outline"
              onClick={() => setFilter(filter === f ? null : f)}
              className={`h-auto shrink-0 rounded-full px-3.5 py-1.5 text-xs transition ${
                filter === f ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground/70"
              }`}
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => {
            const prod = getProducer(p.producerSlug);
            const s = trustScore10(p.producerSlug);
            return (
              <Link to="/consumidor/producto/$id" params={{ id: p.id }} key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="relative aspect-square bg-muted">
                  <img src={p.photo} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover" />
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${scoreTone(s)}`}>{s}/10</span>
                </div>
                <div className="p-2.5">
                  <div className="serif text-sm leading-tight">{p.name}</div>
                  <div className="mt-0.5 text-sm">${p.price}<span className="text-[10px] text-muted-foreground"> / {p.unit === "kilo" ? "kg" : p.unit}</span></div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <img src={prod.photo} alt={prod.name} className="h-5 w-5 rounded-full object-cover" />
                    <span className="truncate text-[11px] text-muted-foreground">{prod.name}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay cultivos con ese filtro esta semana.</p>}
      </div>
    </AppShell>
  );
}

/** Recordatorio del código de entrega mientras el distribuidor trae un pedido */
function AvisoCodigo() {
  const enCamino = pedidosEnCurso(useOrders()).filter(muestraCodigo);
  const distribuidor = nombreCorto(useDistributor().nombre);
  if (enCamino.length === 0) return null;
  return (
    <>
      {enCamino.map((o) => (
        <Link
          key={o.id}
          to="/consumidor/pedidos"
          className="flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4"
        >
          <div className="min-w-0">
            <div className="eyebrow text-terracota">{STATUS_LABEL[o.status]}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Dale este código a {distribuidor} al recibir tu pedido #{o.id}.
            </p>
            <span className="mt-1 inline-block text-xs underline">Pedidos</span>
          </div>
          <div className="shrink-0 text-center">
            <div className="text-[9px] uppercase tracking-widest text-terracota">Código de entrega</div>
            <div className="display mt-0.5 text-3xl tracking-[0.2em]">{codigoDe(o)}</div>
          </div>
        </Link>
      ))}
    </>
  );
}
