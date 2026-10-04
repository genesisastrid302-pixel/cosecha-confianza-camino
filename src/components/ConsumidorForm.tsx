import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

const zonas = ["Monterrey", "San Pedro Garza García", "San Nicolás de los Garza", "Guadalupe", "Apodaca", "Santa Catarina", "Escobedo", "García"];

export function ConsumidorForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [entrega, setEntrega] = useState<"pickup" | "domicilio">("domicilio");
  const [pago, setPago] = useState("Tarjeta");
  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
  const pill = (on: boolean) => `flex-1 rounded-xl border py-3 text-sm ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;

  return (
    <form
      className="flex min-h-full flex-col px-5 pb-8 pt-5"
      onSubmit={(e) => { e.preventDefault(); navigate({ to: "/consumidor" }); }}
    >
      <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="eyebrow mt-6">Paso 2 de 3</span>
      <h1 className="display mt-2 text-3xl">Cuéntanos de tu mesa</h1>

      <div className="mt-6 space-y-4">
        <label className="block"><span className="text-xs text-muted-foreground">Nombre</span><input required maxLength={100} className={input} placeholder="Adriana Martínez" /></label>
        <label className="block"><span className="text-xs text-muted-foreground">Correo</span><input required type="email" maxLength={255} className={input} placeholder="adriana@correo.com" /></label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Municipio (área metropolitana de Monterrey)</span>
          <select required defaultValue="" className={input}>
            <option value="" disabled>Selecciona tu municipio</option>
            {zonas.map((z) => <option key={z}>{z}</option>)}
          </select>
        </label>
        <div>
          <span className="text-xs text-muted-foreground">Tipo de entrega</span>
          <div className="mt-1.5 flex gap-2">
            <button type="button" className={pill(entrega === "pickup")} onClick={() => setEntrega("pickup")}>Pick up</button>
            <button type="button" className={pill(entrega === "domicilio")} onClick={() => setEntrega("domicilio")}>Domicilio</button>
          </div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Método de pago</span>
          <div className="mt-1.5 flex gap-2">
            {["Tarjeta", "CoDi", "Efectivo"].map((m) => (
              <button type="button" key={m} className={pill(pago === m)} onClick={() => setPago(m)}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" className="mt-8 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
        Crear mi cuenta
      </button>
    </form>
  );
}
