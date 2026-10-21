import { createFileRoute, redirect } from "@tanstack/react-router";

/** Cosecha compartida ahora vive en Planes; esta dirección queda para enlaces y avisos viejos */
export const Route = createFileRoute("/consumidor/cosecha")({
  beforeLoad: () => {
    throw redirect({ to: "/consumidor/planes", search: { tab: "cosecha" }, replace: true });
  },
});
