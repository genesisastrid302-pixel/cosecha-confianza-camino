import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Truck, Package } from "lucide-react";
import {
  EMPTY_DISTRIBUTOR,
  MUNICIPIOS,
  saveDistributor,
  validarAcceso,
  type DistributorProfile,
} from "@/lib/accounts";

/** ¿La cuenta de cobro del distribuidor está completa? */
export function cobroDistribuidorCompleto(d: DistributorProfile) {
  if (d.cobro === "CLABE") return /^\d{18}$/.test(d.clabe) && d.banco.trim().length > 1 && d.titular.trim().length > 2;
  if (d.cobro === "CoDi") return /^\d{10}$/.test(d.codi);
  return false;
}

export function DistribuidorForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<2 | 3>(2);
  const [d, setD] = useState<DistributorProfile>(EMPTY_DISTRIBUTOR);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
  const pill = (on: boolean) => `flex-1 rounded-xl border py-3 text-sm ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;
  const toggleZona = (z: string) => setD({ ...d, zonas: d.zonas.includes(z) ? d.zonas.filter((x) => x !== z) : [...d.zonas, z] });

  if (paso === 3) {
    return (
      <form
        className="flex min-h-full flex-col px-5 pb-8 pt-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!d.cobro) return setError("Elige cómo quieres recibir tus pagos.");
          if (!cobroDistribuidorCompleto(d)) return setError(d.cobro === "CLABE" ? "Completa CLABE (18 dígitos), banco y titular." : "El celular de CoDi debe tener 10 dígitos.");
          const err = validarAcceso(d.telefono, password, password2);
          if (err) return setError(err);
          saveDistributor({ ...d, nombre: d.nombre.trim() });
          navigate({ to: "/distribuidor" });
        }}
      >
        <button type="button" onClick={() => setPaso(2)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="eyebrow mt-6">Paso 3 de 3</span>
        <h1 className="display mt-2 text-3xl">Cobro y acceso</h1>

        <div className="mt-6 space-y-4">
          <div>
            <span className="text-xs text-muted-foreground">¿Dónde recibes lo de logística?</span>
            <div className="mt-1.5 flex gap-2">
              {(["CLABE", "CoDi"] as const).map((m) => (
                <button type="button" key={m} className={pill(d.cobro === m)} onClick={() => setD({ ...d, cobro: m })}>{m}</button>
              ))}
            </div>
            {d.cobro === "CLABE" && (
              <div className="mt-2 space-y-2">
                <input inputMode="numeric" maxLength={18} value={d.clabe} onChange={(e) => setD({ ...d, clabe: e.target.value.replace(/\D/g, "") })} className={input} placeholder="CLABE · 18 dígitos" aria-label="CLABE" />
                <div className="grid grid-cols-2 gap-2">
                  <input maxLength={40} value={d.banco} onChange={(e) => setD({ ...d, banco: e.target.value })} className={input} placeholder="Banco" aria-label="Banco" />
                  <input maxLength={100} value={d.titular} onChange={(e) => setD({ ...d, titular: e.target.value })} className={input} placeholder="Titular" aria-label="Titular" />
                </div>
              </div>
            )}
            {d.cobro === "CoDi" && (
              <input inputMode="numeric" maxLength={10} value={d.codi} onChange={(e) => setD({ ...d, codi: e.target.value.replace(/\D/g, "") })} className={input} placeholder="Celular ligado a CoDi" aria-label="Celular CoDi" />
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Recibes la parte de logística y cadena de frío de cada pedido que entregas. Si un consumidor paga en efectivo, lo cobras tú al entregar.
            </p>
          </div>
          <label className="block">
            <span className="text-xs text-muted-foreground">Contraseña</span>
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Repite la contraseña</span>
            <input required type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className={input} autoComplete="new-password" />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <button type="submit" className="mt-8 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
          Crear mi cuenta
        </button>
      </form>
    );
  }

  return (
    <form
      className="flex min-h-full flex-col px-5 pb-8 pt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!d.transporte) return setError("Elige cómo transportas.");
        if (d.transporte === "Vehículo propio" && !d.vehiculo) return setError("Elige tu tipo de vehículo.");
        if (d.transporte === "Paquetería" && d.paqueteria.trim().length < 2) return setError("Escribe qué paquetería usas.");
        if (d.zonas.length === 0) return setError("Elige al menos un municipio donde entregas.");
        setError("");
        setPaso(3);
      }}
    >
      <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="eyebrow mt-6">Paso 2 de 3</span>
      <h1 className="display mt-2 text-3xl">Cuéntanos de tu ruta</h1>

      <div className="mt-6 space-y-4">
        <label className="block"><span className="text-xs text-muted-foreground">Nombre</span><input required maxLength={100} value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} className={input} placeholder="Claudia Ramírez" /></label>
        <label className="block"><span className="text-xs text-muted-foreground">Correo</span><input required type="email" maxLength={255} value={d.correo} onChange={(e) => setD({ ...d, correo: e.target.value })} className={input} placeholder="claudia@correo.com" /></label>
        <label className="block"><span className="text-xs text-muted-foreground">Teléfono celular</span><input required inputMode="numeric" maxLength={10} value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value.replace(/\D/g, "") })} className={input} placeholder="81 1234 5678" /></label>

        <div>
          <span className="text-xs text-muted-foreground">¿Cómo transportas?</span>
          <div className="mt-1.5 flex gap-2">
            <button type="button" className={pill(d.transporte === "Vehículo propio")} onClick={() => setD({ ...d, transporte: "Vehículo propio" })}>
              <Truck className="mr-1.5 inline h-4 w-4" /> Vehículo propio
            </button>
            <button type="button" className={pill(d.transporte === "Paquetería")} onClick={() => setD({ ...d, transporte: "Paquetería" })}>
              <Package className="mr-1.5 inline h-4 w-4" /> Paquetería
            </button>
          </div>
          {d.transporte === "Vehículo propio" && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                {["Auto", "Camioneta", "Moto"].map((v) => (
                  <button type="button" key={v} className={pill(d.vehiculo === v)} onClick={() => setD({ ...d, vehiculo: v })}>{v}</button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setD({ ...d, refrigerado: !d.refrigerado })}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm">Tiene cámara fría o hielera térmica</span>
                <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${d.refrigerado ? "bg-primary" : "bg-secondary"}`}>
                  <span className={`h-5 w-5 rounded-full bg-background shadow transition ${d.refrigerado ? "translate-x-5" : ""}`} />
                </span>
              </button>
            </div>
          )}
          {d.transporte === "Paquetería" && (
            <input maxLength={60} value={d.paqueteria} onChange={(e) => setD({ ...d, paqueteria: e.target.value })} className={input} placeholder="Nombre del servicio de paquetería" aria-label="Paquetería" />
          )}
        </div>

        <div>
          <span className="text-xs text-muted-foreground">Municipios donde entregas</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {MUNICIPIOS.map((z) => (
              <button
                type="button"
                key={z}
                onClick={() => toggleZona(z)}
                className={`rounded-full border px-3 py-1.5 text-xs ${d.zonas.includes(z) ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <button type="submit" className="mt-8 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
        Continuar
      </button>
    </form>
  );
}
