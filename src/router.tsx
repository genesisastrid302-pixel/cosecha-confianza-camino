import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { IndicadorCarga } from "@/components/IndicadorCarga";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Si una pantalla tarda más de medio segundo en cargar, se muestra el indicador
    defaultPendingMs: 500,
    defaultPendingComponent: () => (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IndicadorCarga />
      </div>
    ),
  });

  return router;
};
