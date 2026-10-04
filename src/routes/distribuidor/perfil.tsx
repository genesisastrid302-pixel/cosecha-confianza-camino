import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { ChevronRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/distribuidor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Distribuidor — Milpa" }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Tu perfil" title="Claudia R.">
      <div className="space-y-5 px-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-sm">Camioneta MTY-04 · Cámara fría</div>
          <div className="text-xs text-muted-foreground">3 productores asignados · 38 rutas este mes</div>
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {["Productores asignados", "Configuración de cámara fría", "Método de pago recibido", "Historial de rutas"].map((l) => (
            <button key={l} className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm">
              <span>{l}</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm text-muted-foreground">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Link>
      </div>
    </AppShell>
  ),
});
