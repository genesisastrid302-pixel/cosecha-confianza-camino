import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { CerrarSesion } from "@/components/CerrarSesion";
import { AppShell } from "@/components/AppShell";
import { CambiarClave, FilaEditable, botonGuardar, campo, pastilla, useFilaAbierta } from "@/components/FilaEditable";
import { consumidorTabs } from "@/components/tabs";
import {
  METODOS_PAGO,
  MUNICIPIOS,
  direccionCompleta,
  direccionValida,
  nombreCorto,
  otrosConsumidores,
  saveConsumer,
  useConsumer,
  type ConsumerProfile,
} from "@/lib/accounts";
import { contactoRepetido } from "@/lib/acceso";
import { pesoPedido, useMisPedidos } from "@/lib/orders";

export const Route = createFileRoute("/consumidor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Consumidor — Milpa" }] }),
  component: Perfil,
});

type Seccion = "personal" | "entrega" | "pagos" | "clave";

function Perfil() {
  const c = useConsumer();
  const orders = useMisPedidos().filter((o) => o.status !== "rechazado");
  const productores = new Set(orders.flatMap((o) => Object.keys(o.lots))).size;
  const kg = Math.round(orders.reduce((n, o) => n + pesoPedido(o), 0) * 10) / 10;
  const { fila, cerrar } = useFilaAbierta<Seccion>();
  const sinDireccion = c.entrega === "domicilio" && !direccionValida(c.direccion);

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

        <section>
          <div className="eyebrow">Cuenta</div>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <FilaEditable label="Información personal" detail={c.correo || c.telefono || "Sin capturar"} warn={!c.correo || !c.telefono} {...fila("personal")}>
              <EditarPersonal c={c} onDone={cerrar} />
            </FilaEditable>
            <FilaEditable
              label="Entrega"
              detail={c.entrega === "domicilio" ? (sinDireccion ? "Falta tu dirección" : direccionCompleta(c)) : `Recoger · ${c.municipio}`}
              warn={sinDireccion}
              {...fila("entrega")}
            >
              <EditarEntrega c={c} onDone={cerrar} />
            </FilaEditable>
            <FilaEditable label={c.pagos.length > 1 ? "Métodos de pago" : "Método de pago"} detail={c.pagos.join(" · ") || "Sin elegir"} warn={c.pagos.length === 0} {...fila("pagos")}>
              <EditarPagos c={c} onDone={cerrar} />
            </FilaEditable>
            <FilaEditable label="Contraseña" detail="Cambiar" {...fila("clave")}>
              <CambiarClave rol="consumidor" onDone={cerrar} />
            </FilaEditable>
          </div>
        </section>

        <CerrarSesion rol="consumidor" />
      </div>
    </AppShell>
  );
}

function EditarPersonal({ c, onDone }: { c: ConsumerProfile; onDone: () => void }) {
  const [d, setD] = useState({ nombre: c.nombre, correo: c.correo, telefono: c.telefono });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        const nuevo = { nombre: d.nombre.trim(), correo: d.correo.trim().toLowerCase(), telefono: d.telefono };
        if (nuevo.nombre.length < 2) return setError("Escribe tu nombre.");
        if (!/\S+@\S+\.\S+/.test(nuevo.correo)) return setError("Revisa el correo.");
        if (!/^\d{10}$/.test(nuevo.telefono)) return setError("El teléfono debe tener 10 dígitos.");
        const repetido = contactoRepetido(otrosConsumidores(), nuevo);
        if (repetido) return setError(repetido.replace(" Inicia sesión.", ""));
        saveConsumer({ ...c, ...nuevo });
        onDone();
      }}
    >
      <label className="block text-xs text-muted-foreground">
        Nombre
        <input required maxLength={100} value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} className={campo} />
      </label>
      <label className="block text-xs text-muted-foreground">
        Correo
        <input required type="email" maxLength={255} value={d.correo} onChange={(e) => setD({ ...d, correo: e.target.value })} className={campo} />
      </label>
      <label className="block text-xs text-muted-foreground">
        Teléfono
        <input required inputMode="numeric" maxLength={10} value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value.replace(/\D/g, "") })} className={campo} />
      </label>
      <p className="text-[11px] text-muted-foreground">Con tu teléfono o correo inicias sesión.</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button className={botonGuardar}>Guardar</button>
    </form>
  );
}

function EditarEntrega({ c, onDone }: { c: ConsumerProfile; onDone: () => void }) {
  const [d, setD] = useState({ entrega: c.entrega, direccion: c.direccion, municipio: c.municipio });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!d.municipio) return setError("Elige tu municipio.");
        if (d.entrega === "domicilio" && !direccionValida(d.direccion)) return setError("Escribe calle, número y colonia.");
        saveConsumer({ ...c, ...d, direccion: d.direccion.trim() });
        onDone();
      }}
    >
      <div className="text-xs text-muted-foreground">¿Cómo prefieres recibir?</div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={d.entrega === "domicilio"} className={pastilla(d.entrega === "domicilio")} onClick={() => setD({ ...d, entrega: "domicilio" })}>A domicilio</button>
        <button type="button" aria-pressed={d.entrega === "pickup"} className={pastilla(d.entrega === "pickup")} onClick={() => setD({ ...d, entrega: "pickup" })}>Recoger</button>
      </div>
      <label className="block text-xs text-muted-foreground">
        Dirección de entrega{d.entrega === "pickup" ? " (opcional)" : ""}
        <input maxLength={140} autoComplete="street-address" placeholder="Calle, número y colonia" value={d.direccion} onChange={(e) => { setD({ ...d, direccion: e.target.value }); setError(""); }} className={campo} />
      </label>
      <label className="block text-xs text-muted-foreground">
        Municipio
        <select value={d.municipio} onChange={(e) => setD({ ...d, municipio: e.target.value })} className={campo}>
          <option value="" disabled>Selecciona tu municipio</option>
          {MUNICIPIOS.map((z) => <option key={z}>{z}</option>)}
        </select>
      </label>
      <p className="text-[11px] text-muted-foreground">Es la que aparece al confirmar tu pedido; ahí puedes cambiarla solo para ese pedido.</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button className={botonGuardar}>Guardar</button>
    </form>
  );
}

function EditarPagos({ c, onDone }: { c: ConsumerProfile; onDone: () => void }) {
  const [pagos, setPagos] = useState(c.pagos);
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        {METODOS_PAGO.map((m) => {
          const on = pagos.includes(m);
          return (
            <button
              type="button"
              key={m}
              aria-pressed={on}
              className={`${pastilla(on)} flex items-center justify-center gap-1`}
              onClick={() => setPagos(METODOS_PAGO.filter((x) => (x === m ? !on : pagos.includes(x))))}
            >
              {on && <Check className="h-3.5 w-3.5" />}
              {m}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">Puedes elegir uno o varios. En cada pedido decides con cuál pagar.</p>
      <button
        type="button"
        disabled={pagos.length === 0}
        onClick={() => {
          saveConsumer({ ...c, pagos });
          onDone();
        }}
        className={botonGuardar}
      >
        Guardar
      </button>
    </div>
  );
}

function Tile({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="serif text-2xl">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}
