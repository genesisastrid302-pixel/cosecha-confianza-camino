import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { products, producers, getProducer, trustScore10, scoreTone, cantidadTexto, dinero, maximoDe, pasoDe, unidadPrecio } from "@/lib/data";
import { formatScore } from "@/lib/score";
import { addToCart } from "@/lib/cart";
import { Check, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { codigoDe, muestraCodigo, pedidosEnCurso, STATUS_LABEL, useMisPedidos, repartidor } from "@/lib/orders";

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
        <ConoceProductores />
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cultivo" className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none" />
        </div>

        <div className="deslizar-x -mx-5 flex gap-2 px-5 [--riel-margen:1.25rem]">
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
          {list.map((p) => (
            <TarjetaProducto key={p.id} producto={p} />
          ))}
        </div>
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay cultivos con ese filtro esta semana.</p>}
      </div>
    </AppShell>
  );
}

/** Recordatorio del código de entrega mientras el distribuidor trae un pedido */
function AvisoCodigo() {
  const enCamino = pedidosEnCurso(useMisPedidos()).filter(muestraCodigo);
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
              Dale este código a {repartidor(o)} al recibir tu pedido #{o.id}.
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

/** Carrusel de productores del catálogo; cada tarjeta abre su perfil */
function ConoceProductores() {
  return (
    <section aria-labelledby="conoce-productores" className="grain overflow-hidden rounded-3xl bg-primary pt-4 text-primary-foreground">
      <h2 id="conoce-productores" className="serif px-4 text-xl">
        Conoce a los productores
      </h2>
      {/* Sin cajas: cada productor va directo sobre el verde, separado solo por el espacio */}
      <ul className="deslizar-x deslizar-x-claro mt-3 flex gap-4 px-4 pb-4 [--riel-margen:1rem]">
        {Object.values(producers).map((p) => {
          const s = trustScore10(p.slug);
          return (
            <li key={p.slug} className="w-40 shrink-0">
              <Link
                to="/consumidor/productor/$slug"
                params={{ slug: p.slug }}
                className="group flex h-full flex-col rounded-2xl transition active:scale-[0.98]"
              >
                <img
                  src={p.photo}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-primary-foreground/15"
                />
                <span className="serif mt-2.5 block text-base leading-tight group-hover:underline">{p.name}</span>
                <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-primary-foreground/75">{p.practice}</span>
                {/* El score queda abajo en todas, con aire aunque la especialidad ocupe dos líneas */}
                <span className="mt-auto pt-2.5">
                  {/* Sobre el verde, el score bueno va en papel con letra verde; miel y rojo se quedan como en toda la app */}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${s >= 8 ? "bg-primary-foreground text-primary" : scoreTone(s)}`}
                  >
                    {formatScore(s)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Tarjeta del Mercado. Orden: cultivo, quién lo cultivó (lleva a su perfil),
 * precio y agregar. Son enlaces hermanos, no anidados, para que cada uno lleve a su lugar.
 */
function TarjetaProducto({ producto: p }: { producto: (typeof products)[number] }) {
  const prod = getProducer(p.producerSlug);
  const s = trustScore10(p.producerSlug);
  const [agregado, setAgregado] = useState(false);
  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), 1600);
    return () => clearTimeout(t);
  }, [agregado]);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Link to="/consumidor/producto/$id" params={{ id: p.id }} className="relative block aspect-square bg-muted" tabIndex={-1} aria-hidden>
        <img src={p.photo} alt="" loading="lazy" width={816} height={816} className="h-full w-full object-cover" />
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${scoreTone(s)}`}>{s}/10</span>
      </Link>
      <div className="flex flex-1 flex-col p-2.5">
        <Link to="/consumidor/producto/$id" params={{ id: p.id }} className="serif text-sm leading-tight">
          {p.name}
        </Link>
        <Link
          to="/consumidor/productor/$slug"
          params={{ slug: prod.slug }}
          className="-mx-1 mt-0.5 flex min-h-6 items-center gap-1.5 rounded-md px-1 text-[11px] font-medium text-primary"
        >
          <img src={prod.photo} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />
          <span className="truncate">{prod.name}</span>
        </Link>
        <p className="mt-1 text-sm">
          {dinero(p.price)}
          <span className="text-[11px] text-muted-foreground"> · {unidadPrecio(p.unit)}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            addToCart(p.id, pasoDe(p), maximoDe(p));
            setAgregado(true);
          }}
          aria-label={agregado ? `${p.name} en tu carrito` : `Agregar ${p.name} al carrito`}
          className={`mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-xs font-medium transition active:scale-[0.97] ${
            agregado ? "bg-primary/10 text-primary" : "bg-foreground text-background"
          }`}
        >
          {agregado ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {/* Por gramos se dice cuánto suma cada toque */}
          {agregado ? "Agregado" : p.unit === "gramo" ? `Agregar ${cantidadTexto(p.unit, pasoDe(p))}` : "Agregar"}
        </button>
        <span className="sr-only" aria-live="polite">
          {agregado ? `${p.name} se agregó a tu carrito` : ""}
        </span>
      </div>
    </article>
  );
}
