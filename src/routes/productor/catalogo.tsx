import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Plus } from "lucide-react";
import { getProductsByProducer } from "@/lib/data";

export const Route = createFileRoute("/productor/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo · Productor — Milpa" }] }),
  component: Catalogo,
});

function Catalogo() {
  const items = getProductsByProducer("santiago");
  return (
    <AppShell
      tabs={productorTabs}
      tone="milpa"
      eyebrow="Tu catálogo"
      title="Cultivos activos"
      right={
        <button className="flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs text-background">
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      }
    >
      <div className="space-y-3 px-5">
        <div className="flex gap-2 text-xs">
          {["Todos", "Verdura", "Fruta", "Limón"].map((t, i) => (
            <button
              key={t}
              className={`rounded-full px-3.5 py-1.5 ${
                i === 0 ? "bg-foreground text-background" : "border border-border text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {items.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={p.photo} alt={p.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <h3 className="serif text-lg leading-tight">{p.name}</h3>
                <div className="serif text-base">${p.price}<span className="text-[11px] text-muted-foreground">/{p.unit}</span></div>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {p.harvestIn === 0 ? "Listo hoy" : `Cosecha en ${p.harvestIn} d`} · {p.unitsLeft} disp.
              </div>
              <div className="mt-2 flex gap-2 text-[11px]">
                <button className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">Editar</button>
                <button className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Marcar agotado</button>
              </div>
            </div>
          </div>
        ))}

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground">
          <Plus className="h-4 w-4" /> Nueva temporada / cambio de cultivo
        </button>
      </div>
    </AppShell>
  );
}
