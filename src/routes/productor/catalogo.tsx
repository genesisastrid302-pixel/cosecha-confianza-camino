import { createFileRoute, redirect } from "@tanstack/react-router";

/** "Catálogo" ahora se llama Cultivos; esta dirección queda para enlaces viejos */
export const Route = createFileRoute("/productor/catalogo")({
  beforeLoad: () => {
    throw redirect({ to: "/productor/cultivos", replace: true });
  },
});
