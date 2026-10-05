import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { products, unitLabel } from "@/lib/data";
import { LOGISTICA, PLATAFORMA, shareToProducers } from "@/lib/orders";
import { useEffect, useState } from "react";
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { IndicadorCarga } from "@/components/IndicadorCarga";
import { Button } from "@/components/ui/button";
import { readCart, subscribeCart, writeCart, type CartLine } from "@/lib/cart";

export const Route = createFileRoute("/consumidor/carrito")({
  head: () => ({ meta: [
    { title: "Carrito · Milpa" }, { name: "description", content: "Revisa tu canasta de cultivos agroecológicos Milpa." },
    { property: "og:title", content: "Carrito · Milpa" }, { property: "og:description", content: "Revisa tu canasta de cultivos agroecológicos Milpa." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Carrito,
});

function Carrito() {
  const [lines, setLines] = useState<CartLine[]>([]);
  // La canasta vive en el navegador: hasta leerla no sabemos si está vacía
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const update = () => {
      setLines(readCart());
      setListo(true);
    };
    update();
    return subscribeCart(update);
  }, []);
  const items = lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.id);
    return product ? [{ ...product, quantity: line.quantity }] : [];
  });
  const subtotal = items.reduce((s, p) => s + p.price * p.quantity, 0);
  const updateQuantity = (id: string, quantity: number) => {
    writeCart(lines.map((line) => line.id === id ? { ...line, quantity } : line).filter((line) => line.quantity > 0));
  };
  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Tu canasta" title="Carrito">
      <div className="space-y-5 px-5">
        {!listo && (
          <div className="flex justify-center py-16">
            <IndicadorCarga etiqueta="Cargando tu canasta" />
          </div>
        )}
        {listo && items.length === 0 && <p className="pt-10 text-center text-sm text-muted-foreground">Tu canasta está vacía. Explora los cultivos del Mercado.</p>}
        {items.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={p.photo} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="serif text-base">{p.name}</div>
              <div className="text-[11px] text-muted-foreground">${p.price} / {unitLabel(p.unit)}</div>
              <div className="mt-2 inline-flex items-center gap-1 border border-border text-xs">
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Reducir ${p.name}`} onClick={() => updateQuantity(p.id, p.quantity - 1)}><Minus /></Button>
                <span className="w-5 text-center">{p.quantity}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Aumentar ${p.name}`} disabled={p.quantity >= p.unitsLeft} onClick={() => updateQuantity(p.id, p.quantity + 1)}><Plus /></Button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="serif text-base">${p.price * p.quantity}</div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label={`Quitar ${p.name}`} onClick={() => updateQuantity(p.id, 0)}><Trash2 /></Button>
            </div>
          </div>
        ))}

        {items.length > 0 && <><div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <Row l="Subtotal" v={`$${subtotal}`} />
          <Row l="Logística + cadena de frío" v={`$${LOGISTICA}`} />
          <Row l="Plataforma Milpa" v={`$${PLATAFORMA}`} />
          <div className="my-2 h-px bg-border" />
          <Row l="Total" v={`$${subtotal + LOGISTICA + PLATAFORMA}`} bold />
          <p className="pt-1 text-[11px] text-muted-foreground">
            <span className="text-primary font-medium">{shareToProducers(subtotal)}%</span> de tu pago va directo a los productores.
          </p>
        </div>

        <Link to="/consumidor/checkout" className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background transition active:scale-[0.98]">
          Confirmar pedido →
        </Link></>}

        {listo && (
          <Link
            to="/consumidor"
            className={`flex w-full items-center justify-center gap-1.5 rounded-full py-3.5 text-sm transition active:scale-[0.98] ${
              items.length === 0 ? "bg-foreground font-medium text-background" : "border border-border bg-card"
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Volver al Mercado
          </Link>
        )}
      </div>
    </AppShell>
  );
}

function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-medium" : "text-muted-foreground"}`}><span>{l}</span><span>{v}</span></div>;
}
