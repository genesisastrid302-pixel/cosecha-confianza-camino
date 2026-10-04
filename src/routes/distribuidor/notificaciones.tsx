import { createFileRoute } from "@tanstack/react-router";
import { Notificaciones } from "@/components/Notificaciones";
import { distribuidorTabs } from "@/components/tabs";

export const Route = createFileRoute("/distribuidor/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones · Distribuidor — Milpa" }] }),
  component: () => <Notificaciones rol="distribuidor" tabs={distribuidorTabs} tone="miel" />,
});
