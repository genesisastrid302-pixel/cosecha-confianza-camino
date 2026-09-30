import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/distribuidor/ruta")({
  head: () => ({ meta: [{ title: "Ruta · Distribuidor — Milpa" }, { name: "description", content: "Mapa y paradas de la ruta del día." }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Ruta MTY-04" title="Ruta">
      <Placeholder text="Aquí verás el mapa, las paradas de recolección y entrega, y la cadena de frío." />
    </AppShell>
  ),
});
