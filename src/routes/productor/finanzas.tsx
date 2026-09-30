import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Placeholder } from "@/components/Placeholder";

export const Route = createFileRoute("/productor/finanzas")({
  head: () => ({ meta: [{ title: "Finanzas · Productor — Milpa" }, { name: "description", content: "Ingresos y pagos del productor." }] }),
  component: () => (
    <AppShell tabs={productorTabs} eyebrow="Tus ingresos" title="Finanzas">
      <Placeholder text="Aquí verás tus ventas, pagos recibidos y el desglose de lo que llega a tu bolsillo." />
    </AppShell>
  ),
});
