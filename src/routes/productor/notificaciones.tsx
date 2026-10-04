import { createFileRoute } from "@tanstack/react-router";
import { Notificaciones } from "@/components/Notificaciones";
import { productorTabs } from "@/components/tabs";

export const Route = createFileRoute("/productor/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones · Productor — Milpa" }] }),
  component: () => <Notificaciones rol="productor" tabs={productorTabs} tone="milpa" />,
});
