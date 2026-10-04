import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Minus, Plus, Leaf, CalendarDays, Sprout, ShoppingBasket } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { Button } from "@/components/ui/button";
import { products, getProducer } from "@/lib/data";
import { addToCart } from "@/lib/cart";

export const Route = createFileRoute("/consumidor/producto/$id")({
  loader: ({ params }) => {
    if (!products.some((product) => product.id === params.id)) throw notFound();
    return { id: params.id };
  },
  head: ({ loaderData }) => {
    const product = products.find((item) => item.id === loaderData?.id);
    const title = product ? `${product.name} · Mercado — Milpa` : "Cultivo no encontrado — Milpa";
    const description = product ? `${product.name}: ${product.story} Conoce su cosecha agroecológica.` : "Cultivo no disponible en el mercado de Milpa.";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  notFoundComponent: () => <div className="p-8 text-center">Cultivo no encontrado.</div>,
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useLoaderData();
  const product = products.find((item) => item.id === id);
  if (!product) return null;
  return <ProductDetailContent key={id} product={product} />;
}

function ProductDetailContent({ product }: { product: (typeof products)[number] }) {
  const [quantity, setQuantity] = useState(1);
  const producer = getProducer(product.producerSlug);
  const unit = product.unit === "kilo" ? "kg" : "pieza";
  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + product.harvestIn);

  return (
    <AppShell tabs={consumidorTabs} tone="terracota">
      <div className="relative aspect-[5/4] bg-muted">
        <img src={product.photo} alt={product.name} className="h-full w-full object-cover" />
        <Button asChild variant="outline" size="icon" className="absolute left-4 top-4 rounded-full bg-background/90 backdrop-blur">
          <Link to="/consumidor" aria-label="Volver al Mercado"><ChevronLeft /></Link>
        </Button>
      </div>
      <div className="space-y-6 px-5 pb-4 pt-6">
        <div>
          <div className="eyebrow">Del campo a tu mesa</div>
          <h1 className="display mt-2 text-4xl leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="serif text-2xl">${product.price} <span className="font-sans text-sm text-muted-foreground">/ {unit}</span></p>
            <p className="text-xs text-muted-foreground">{product.unitsLeft} {unit} disponibles</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.story}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-y border-border py-5">
          <div className="space-y-1">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div className="eyebrow">Cosecha estimada</div>
            <p className="text-sm">{harvestDate.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="space-y-1">
            <Sprout className="h-4 w-4 text-primary" />
            <div className="eyebrow">Temporada</div>
            <p className="text-sm">{product.season}</p>
          </div>
        </div>

        <section>
          <div className="eyebrow flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" /> Práctica agroecológica</div>
          <p className="serif mt-2 text-base leading-relaxed">{product.cropPractice}</p>
        </section>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Cantidad ({unit})</span>
          <div className="flex h-11 items-center gap-3 border border-border bg-card px-1">
            <Button variant="ghost" size="icon" aria-label="Reducir cantidad" disabled={quantity <= 1} onClick={() => setQuantity((n) => n - 1)}><Minus /></Button>
            <span className="w-7 text-center text-sm tabular-nums">{quantity}</span>
            <Button variant="ghost" size="icon" aria-label="Aumentar cantidad" disabled={quantity >= product.unitsLeft} onClick={() => setQuantity((n) => n + 1)}><Plus /></Button>
          </div>
        </div>
        <Button asChild className="h-13 w-full rounded-full text-sm">
          <Link to="/consumidor/carrito" onClick={() => addToCart(product.id, quantity, product.unitsLeft)}><ShoppingBasket /> Agregar al carrito · ${product.price * quantity}</Link>
        </Button>

        {producer && <Link to="/consumidor/productor/$slug" params={{ slug: producer.slug }} className="flex items-center gap-2 border-t border-border pt-5 text-sm text-primary underline-offset-4 hover:underline">
          <img src={producer.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
          Cultivado por {producer.name} <span aria-hidden="true">→</span>
        </Link>}
      </div>
    </AppShell>
  );
}