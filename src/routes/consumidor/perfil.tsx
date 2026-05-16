import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { ChevronRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/consumidor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Consumidor — Milpa" }] }),
  component: () => (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Tu perfil" title="Adriana M.">
      <div className="space-y-5 px-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Tile n="8" l="Pedidos / mes" />
          <Tile n="6.4 kg" l="Merma evitada" />
          <Tile n="45 km" l="Promedio" />
        </div>

        <div className="rounded-2xl bg-primary/10 p-4">
          <div className="eyebrow text-primary">Tu impacto · mayo</div>
          <p className="serif mt-2 text-base leading-snug">
            Tu comida viajó 45 km en promedio, frente a 800 km del supermercado. Sostuviste a 2 familias.
          </p>
        </div>

        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          <Row l="Direcciones de entrega" d="2 guardadas" />
          <Row l="Método de pago" d="Tarjeta · CoDi" />
          <Row l="Preferencias" d="Verduras y miel" />
          <Row l="Mis suscripciones" d="Canasta de Santiago" />
        </div>

        <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm text-muted-foreground">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Link>
      </div>
    </AppShell>
  ),
});

function Tile({ n, l }: { n: string; l: string }) {
  return <div className="rounded-2xl border border-border bg-card p-3"><div className="serif text-2xl">{n}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div></div>;
}
function Row({ l, d }: { l: string; d?: string }) {
  return <button className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm"><span>{l}</span><span className="flex items-center gap-2 text-xs text-muted-foreground">{d}<ChevronRight className="h-4 w-4" /></span></button>;
}
