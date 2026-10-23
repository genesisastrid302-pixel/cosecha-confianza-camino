import { createFileRoute, redirect } from "@tanstack/react-router";

/** Acceso directo a la pestaña Cosecha compartida de Cultivos (lo usan los avisos de reservas) */
export const Route = createFileRoute("/productor/cosecha-compartida")({
  beforeLoad: () => {
    throw redirect({ to: "/productor/cultivos", search: { tab: "cosecha" }, replace: true });
  },
});
