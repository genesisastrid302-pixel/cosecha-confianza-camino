import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/distribuidor/finanzas")({
  head: () => ({ meta: [{ title: "Finanzas · Distribuidor — Milpa" }, { name: "description", content: "Ganancias por ruta del distribuidor." }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Tus ganancias" title="Finanzas">
      <Placeholder text="Aquí verás lo ganado por ruta, entregas completadas y pagos pendientes." />
    </AppShell>
  ),
});
