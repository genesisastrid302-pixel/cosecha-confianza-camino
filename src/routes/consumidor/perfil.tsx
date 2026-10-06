import { createFileRoute, Link } from "@tanstack/react-router";
import { CerrarSesion } from "@/components/CerrarSesion";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import { ChevronRight, LogOut } from "lucide-react";
import { nombreCorto, useConsumer } from "@/lib/accounts";
import { pesoPedido, useMisPedidos } from "@/lib/orders";

export const Route = createFileRoute("/consumidor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Consumidor — Milpa" }] }),
  component: Perfil,
});

function Perfil() {
  const c = useConsumer();
  const orders = useMisPedidos().filter((o) => o.status !== "rechazado");
  const productores = new Set(orders.flatMap((o) => Object.keys(o.lots))).size;
  const kg = Math.round(orders.reduce((n, o) => n + pesoPedido(o), 0) * 10) / 10;
  return (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="Tu perfil" title={nombreCorto(c.nombre)}>
      <div className="space-y-5 px-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Tile n={String(orders.length)} l="Pedidos" />
          <Tile n={`${kg} kg`} l="Comprados" />
          <Tile n={String(productores)} l="Productores" />
        </div>

        <div className="rounded-2xl bg-primary/10 p-4">
          <div className="eyebrow text-primary">Tu impacto</div>
          <p className="serif mt-2 text-base leading-snug">
            {orders.length === 0
              ? "Con tu primer pedido empiezas a comprar directo a quien siembra."
              : `Has comprado directo a ${productores === 1 ? "1 productor" : `${productores} productores`}, sin intermediarios.`}
          </p>
        </div>

        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          <Row l="Correo" d={c.correo || "Sin capturar"} />
          <Row l="Teléfono" d={c.telefono || "Sin capturar"} />
          <Row l="Entrega preferida" d={`${c.entrega === "domicilio" ? "A domicilio" : "Recoger"} · ${c.municipio}`} />
          <Row l={c.pagos.length > 1 ? "Métodos de pago" : "Método de pago"} d={c.pagos.join(" · ")} />
        </div>

        <CerrarSesion rol="consumidor" />
      </div>
    </AppShell>
  );
}

function Tile({ n, l }: { n: string; l: string }) {
  return <div className="rounded-2xl border border-border bg-card p-3"><div className="serif text-2xl">{n}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div></div>;
}
function Row({ l, d }: { l: string; d?: string }) {
  return <button className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm"><span>{l}</span><span className="flex items-center gap-2 text-xs text-muted-foreground">{d}<ChevronRight className="h-4 w-4" /></span></button>;
}
