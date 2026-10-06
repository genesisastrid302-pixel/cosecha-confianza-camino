import { createFileRoute, Link } from "@tanstack/react-router";
import { CerrarSesion } from "@/components/CerrarSesion";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { LogOut, Truck, Package, Snowflake, MapPin, Landmark } from "lucide-react";
import { nombreCorto, useDistributor } from "@/lib/accounts";
import { cobroDistribuidorCompleto } from "@/components/DistribuidorForm";
import { tipoCuenta } from "@/lib/producer-store";

export const Route = createFileRoute("/distribuidor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Distribuidor — Milpa" }] }),
  component: Perfil,
});

function Perfil() {
  const d = useDistributor();
  const cobro = cobroDistribuidorCompleto(d)
    ? d.cobro === "CLABE"
      ? `${tipoCuenta(d.clabe)} ${d.banco} ···${d.clabe.slice(-4)}`
      : `CoDi ···${d.codi.slice(-4)}`
    : "Sin cuenta de cobro";
  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Tu perfil" title={nombreCorto(d.nombre)}>
      <div className="space-y-5 px-5">
        <div className="divide-y divide-border rounded-2xl border border-border bg-card text-sm">
          <Fila icon={d.transporte === "Paquetería" ? Package : Truck} l="Transporte" v={d.transporte === "Paquetería" ? `Paquetería · ${d.paqueteria}` : `${d.transporte || "Sin definir"}${d.vehiculo ? ` · ${d.vehiculo}` : ""}`} />
          {d.transporte === "Vehículo propio" && <Fila icon={Snowflake} l="Cadena de frío" v={d.refrigerado ? "Cámara fría o hielera" : "Sin refrigeración"} />}
          <Fila icon={MapPin} l="Zonas de entrega" v={d.zonas.join(", ") || "Sin definir"} />
          <Fila icon={Landmark} l="Cuenta de cobro" v={cobro} warn={!cobroDistribuidorCompleto(d)} />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Recibes la parte de logística y cadena de frío de cada pedido entregado. Tu registro en cada recolección cuenta para el score del productor.
        </p>
        <CerrarSesion rol="distribuidor" />
      </div>
    </AppShell>
  );
}

function Fila({ icon: Icon, l, v, warn }: { icon: typeof Truck; l: string; v: string; warn?: boolean }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-miel" />
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{l}</div>
        <div className={warn ? "text-terracota" : ""}>{v}</div>
      </div>
    </div>
  );
}
