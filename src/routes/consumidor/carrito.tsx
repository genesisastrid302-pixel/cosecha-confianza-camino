import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { products } from "@/lib/data";

export const Route = createFileRoute("/consumidor/carrito")({
  head: () => ({ meta: [{ title: "Carrito · Milpa" }] }),
  component: Carrito,
});

function Carrito() {
  const items = products.slice(0, 2);
  const subtotal = items.reduce((s, p) => s + p.price, 0);
  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Tu canasta" title="Carrito">
      <div className="space-y-5 px-5">
        {items.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={p.photo} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="serif text-base">{p.name}</div>
              <div className="text-[11px] text-muted-foreground">${p.price} / {p.unit}</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border px-2 text-xs">
                <button className="px-1.5">−</button><span>1</span><button className="px-1.5">+</button>
              </div>
            </div>
            <div className="serif text-base">${p.price}</div>
          </div>
        ))}

        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <Row l="Subtotal" v={`$${subtotal}`} />
          <Row l="Logística + cadena de frío" v="$18" />
          <Row l="Plataforma Milpa" v="$10" />
          <div className="my-2 h-px bg-border" />
          <Row l="Total" v={`$${subtotal + 28}`} bold />
          <p className="pt-1 text-[11px] text-muted-foreground">
            <span className="text-primary font-medium">72%</span> va directo a los productores.
          </p>
        </div>

        <button className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
          Confirmar pedido →
        </button>
      </div>
    </AppShell>
  );
}

function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-medium" : "text-muted-foreground"}`}><span>{l}</span><span>{v}</span></div>;
}
