import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { products, getProducer } from "@/lib/data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/consumidor/")({
  head: () => ({ meta: [{ title: "Mercado · Consumidor — Milpa" }] }),
  component: ConsumidorHome,
});

function ConsumidorHome() {
  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Semana 19 · Monterrey" title="Hola, Adriana">
      <div className="space-y-5 px-5">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Buscar cultivo o productor" className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none" />
        </div>

        <Link to="/consumidor/pedidos" className="block rounded-2xl bg-foreground p-4 text-background">
          <div className="text-[11px] tracking-widest uppercase opacity-70">En camino</div>
          <div className="serif mt-1 text-xl">Tu pedido llega mañana 10–12h</div>
          <div className="mt-1 text-xs opacity-70">Ezequiel · Seis Tierras · Lote LT-0518</div>
        </Link>

        <section>
          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Lo que el campo da hoy</div>
            <Link to="/consumidor/productores" className="text-[11px] text-muted-foreground underline">Ver productores</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {products.map((p) => {
              const prod = getProducer(p.producerSlug);
              return (
                <Link to="/consumidor/carrito" key={p.id} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
                    {p.badge && (
                      <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] ${
                        p.badge === "ultimos" ? "bg-terracota text-paper" : "bg-primary text-primary-foreground"
                      }`}>
                        {p.badge === "ultimos" ? `Últimos ${p.unitsLeft}` : p.harvestIn > 0 ? `${p.harvestIn}d` : "Hoy"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="serif text-sm leading-tight">{p.name}</div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-[11px] text-muted-foreground">{prod.name.split(" ")[0]}</div>
                      <div className="text-sm">${p.price}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
