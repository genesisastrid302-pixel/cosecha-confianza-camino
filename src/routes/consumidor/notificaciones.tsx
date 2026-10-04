import { createFileRoute } from "@tanstack/react-router";
import { Notificaciones } from "@/components/Notificaciones";
import { consumidorTabs } from "@/components/tabs";

export const Route = createFileRoute("/consumidor/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones · Consumidor — Milpa" }] }),
  component: () => <Notificaciones rol="consumidor" tabs={consumidorTabs} tone="terracota" />,
});
