import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landmark, Package, Smartphone, Truck } from "lucide-react";
import { CerrarSesion } from "@/components/CerrarSesion";
import { AppShell } from "@/components/AppShell";
import { CambiarClave, FilaEditable, botonGuardar, campo, pastilla, useFilaAbierta } from "@/components/FilaEditable";
import { distribuidorTabs } from "@/components/tabs";
import { MUNICIPIOS, nombreCorto, otrosDistribuidores, saveDistributor, useDistributor, type DistributorProfile } from "@/lib/accounts";
import { contactoRepetido } from "@/lib/acceso";
import { cobroDistribuidorCompleto } from "@/components/DistribuidorForm";
import { tipoCuenta } from "@/lib/producer-store";

export const Route = createFileRoute("/distribuidor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Distribuidor — Milpa" }] }),
  component: Perfil,
});

type Seccion = "personal" | "transporte" | "zonas" | "cobro" | "clave";

function transporteResumen(d: DistributorProfile) {
  if (d.transporte === "Paquetería") return `Paquetería · ${d.paqueteria}`;
  if (!d.transporte) return "Sin definir";
  return [d.vehiculo || d.transporte, d.refrigerado ? "con cámara fría o hielera" : "sin refrigeración"].join(" · ");
}

function Perfil() {
  const d = useDistributor();
  const { fila, cerrar } = useFilaAbierta<Seccion>();
  const cobroOk = cobroDistribuidorCompleto(d);
  const cobro = cobroOk
    ? d.cobro === "CLABE"
      ? `${tipoCuenta(d.clabe)} ${d.banco} ···${d.clabe.slice(-4)}`
      : `CoDi ···${d.codi.slice(-4)}`
    : "Sin cuenta de cobro";
  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Tu perfil" title={nombreCorto(d.nombre)}>
      <div className="space-y-5 px-5">
        <section>
          <div className="eyebrow">Cuenta</div>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <FilaEditable label="Información personal" detail={d.correo || d.telefono || "Sin capturar"} warn={!d.correo || !d.telefono} {...fila("personal")}>
              <EditarPersonal d={d} onDone={cerrar} />
            </FilaEditable>
            <FilaEditable label="Transporte" detail={transporteResumen(d)} warn={!d.transporte} {...fila("transporte")}>
              <EditarTransporte d={d} onDone={cerrar} />
            </FilaEditable>
            <FilaEditable label="Zonas de entrega" detail={d.zonas.join(", ") || "Sin definir"} warn={d.zonas.length === 0} {...fila("zonas")}>
              <EditarZonas d={d} onDone={cerrar} />
            </FilaEditable>
            <FilaEditable label="Cuenta de cobro" detail={cobro} warn={!cobroOk} {...fila("cobro")}>
              <EditarCobro d={d} onDone={cerrar} />
            </FilaEditable>
            <FilaEditable label="Contraseña" detail="Cambiar" {...fila("clave")}>
              <CambiarClave rol="distribuidor" onDone={cerrar} />
            </FilaEditable>
          </div>
        </section>
        <p className="text-[11px] text-muted-foreground">
          Recibes la parte de logística y cadena de frío de cada pedido entregado. Tu registro en cada recolección cuenta para el score del productor.
        </p>
        <CerrarSesion rol="distribuidor" />
      </div>
    </AppShell>
  );
}

function EditarPersonal({ d, onDone }: { d: DistributorProfile; onDone: () => void }) {
  const [v, setV] = useState({ nombre: d.nombre, correo: d.correo, telefono: d.telefono });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        const nuevo = { nombre: v.nombre.trim(), correo: v.correo.trim().toLowerCase(), telefono: v.telefono };
        if (nuevo.nombre.length < 2) return setError("Escribe tu nombre.");
        if (!/\S+@\S+\.\S+/.test(nuevo.correo)) return setError("Revisa el correo.");
        if (!/^\d{10}$/.test(nuevo.telefono)) return setError("El teléfono debe tener 10 dígitos.");
        const repetido = contactoRepetido(otrosDistribuidores(), nuevo);
        if (repetido) return setError(repetido.replace(" Inicia sesión.", ""));
        saveDistributor({ ...d, ...nuevo });
        onDone();
      }}
    >
      <label className="block text-xs text-muted-foreground">
        Nombre
        <input required maxLength={100} value={v.nombre} onChange={(e) => setV({ ...v, nombre: e.target.value })} className={campo} />
      </label>
      <label className="block text-xs text-muted-foreground">
        Correo
        <input required type="email" maxLength={255} value={v.correo} onChange={(e) => setV({ ...v, correo: e.target.value })} className={campo} />
      </label>
      <label className="block text-xs text-muted-foreground">
        Teléfono
        <input required inputMode="numeric" maxLength={10} value={v.telefono} onChange={(e) => setV({ ...v, telefono: e.target.value.replace(/\D/g, "") })} className={campo} />
      </label>
      <p className="text-[11px] text-muted-foreground">Con tu teléfono o correo inicias sesión.</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button className={botonGuardar}>Guardar</button>
    </form>
  );
}

function EditarTransporte({ d, onDone }: { d: DistributorProfile; onDone: () => void }) {
  const [v, setV] = useState({ transporte: d.transporte, vehiculo: d.vehiculo, refrigerado: d.refrigerado, paqueteria: d.paqueteria });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!v.transporte) return setError("Elige cómo transportas.");
        if (v.transporte === "Vehículo propio" && !v.vehiculo) return setError("Elige tu tipo de vehículo.");
        if (v.transporte === "Paquetería" && v.paqueteria.trim().length < 2) return setError("Escribe qué paquetería usas.");
        saveDistributor({ ...d, ...v, paqueteria: v.paqueteria.trim() });
        onDone();
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={v.transporte === "Vehículo propio"} className={pastilla(v.transporte === "Vehículo propio")} onClick={() => { setV({ ...v, transporte: "Vehículo propio" }); setError(""); }}>
          <Truck className="mr-1 inline h-3.5 w-3.5" /> Vehículo propio
        </button>
        <button type="button" aria-pressed={v.transporte === "Paquetería"} className={pastilla(v.transporte === "Paquetería")} onClick={() => { setV({ ...v, transporte: "Paquetería" }); setError(""); }}>
          <Package className="mr-1 inline h-3.5 w-3.5" /> Paquetería
        </button>
      </div>
      {v.transporte === "Vehículo propio" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {["Auto", "Camioneta", "Moto"].map((x) => (
              <button type="button" key={x} aria-pressed={v.vehiculo === x} className={pastilla(v.vehiculo === x)} onClick={() => { setV({ ...v, vehiculo: x }); setError(""); }}>{x}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={v.refrigerado} onChange={(e) => setV({ ...v, refrigerado: e.target.checked })} className="h-4 w-4 accent-[var(--foreground)]" />
            Tiene cámara fría o hielera térmica
          </label>
        </>
      )}
      {v.transporte === "Paquetería" && (
        <label className="block text-xs text-muted-foreground">
          Servicio de paquetería
          <input maxLength={60} value={v.paqueteria} onChange={(e) => { setV({ ...v, paqueteria: e.target.value }); setError(""); }} className={campo} />
        </label>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button className={botonGuardar}>Guardar</button>
    </form>
  );
}

function EditarZonas({ d, onDone }: { d: DistributorProfile; onDone: () => void }) {
  const [zonas, setZonas] = useState(d.zonas);
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {MUNICIPIOS.map((z) => {
          const on = zonas.includes(z);
          return (
            <button
              type="button"
              key={z}
              aria-pressed={on}
              onClick={() => setZonas(MUNICIPIOS.filter((x) => (x === z ? !on : zonas.includes(x))))}
              className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
            >
              {z}
            </button>
          );
        })}
      </div>
      {zonas.length === 0 && <p className="text-[11px] text-terracota">Elige al menos un municipio donde entregas.</p>}
      <button
        type="button"
        disabled={zonas.length === 0}
        onClick={() => {
          saveDistributor({ ...d, zonas });
          onDone();
        }}
        className={botonGuardar}
      >
        Guardar
      </button>
    </div>
  );
}

function EditarCobro({ d, onDone }: { d: DistributorProfile; onDone: () => void }) {
  const [v, setV] = useState({ cobro: d.cobro, clabe: d.clabe, banco: d.banco, titular: d.titular, codi: d.codi });
  const ok = cobroDistribuidorCompleto({ ...d, ...v });
  const cuenta = tipoCuenta(v.clabe);
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={v.cobro === "CLABE"} className={pastilla(v.cobro === "CLABE")} onClick={() => setV({ ...v, cobro: "CLABE", titular: v.titular || d.nombre })}>
          <Landmark className="mr-1 inline h-3.5 w-3.5" /> Transferencia
        </button>
        <button type="button" aria-pressed={v.cobro === "CoDi"} className={pastilla(v.cobro === "CoDi")} onClick={() => setV({ ...v, cobro: "CoDi", codi: v.codi || d.telefono })}>
          <Smartphone className="mr-1 inline h-3.5 w-3.5" /> CoDi
        </button>
      </div>
      {v.cobro === "CLABE" && (
        <>
          <label className="block text-xs text-muted-foreground">
            CLABE o tarjeta de débito
            <input inputMode="numeric" maxLength={18} placeholder="18 dígitos (CLABE) o 16 (tarjeta)" value={v.clabe} onChange={(e) => setV({ ...v, clabe: e.target.value.replace(/\D/g, "").slice(0, 18) })} className={campo} />
            <span className={`mt-1 block text-[11px] ${cuenta ? "text-primary" : "text-muted-foreground"}`}>
              {cuenta ? `✓ ${cuenta} completa` : `Llevas ${v.clabe.length} dígitos: la CLABE lleva 18 y la tarjeta 16`}
            </span>
          </label>
          <label className="block text-xs text-muted-foreground">
            Banco
            <input maxLength={40} value={v.banco} onChange={(e) => setV({ ...v, banco: e.target.value })} className={campo} />
          </label>
          <label className="block text-xs text-muted-foreground">
            Titular de la cuenta
            <input maxLength={100} value={v.titular} onChange={(e) => setV({ ...v, titular: e.target.value })} className={campo} />
          </label>
        </>
      )}
      {v.cobro === "CoDi" && (
        <label className="block text-xs text-muted-foreground">
          Celular ligado a CoDi
          <input inputMode="numeric" maxLength={10} placeholder="10 dígitos" value={v.codi} onChange={(e) => setV({ ...v, codi: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={campo} />
        </label>
      )}
      <button
        type="button"
        disabled={!ok}
        onClick={() => {
          saveDistributor({ ...d, ...v, banco: v.banco.trim(), titular: v.titular.trim() });
          onDone();
        }}
        className={botonGuardar}
      >
        <Landmark className="h-4 w-4" /> Guardar cuenta
      </button>
    </div>
  );
}
