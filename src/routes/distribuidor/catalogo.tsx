import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/distribuidor/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo · Distribuidor — Milpa" }, { name: "description", content: "Productos por recolectar esta semana." }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Esta semana" title="Catálogo">
      <Placeholder text="Aquí verás los cultivos disponibles por productor para planear tu recolección." />
    </AppShell>
  ),
});
