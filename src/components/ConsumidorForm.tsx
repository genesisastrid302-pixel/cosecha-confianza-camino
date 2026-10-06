import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { EMPTY_CONSUMER, METODOS_PAGO, MUNICIPIOS, direccionValida, listarConsumidores, registrarConsumidor, validarAcceso, type ConsumerProfile } from "@/lib/accounts";
import { contactoRepetido, guardarClave, iniciarSesion } from "@/lib/acceso";

export function ConsumidorForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<2 | 3>(2);
  const [p, setP] = useState<ConsumerProfile>(EMPTY_CONSUMER);
  const [guardando, setGuardando] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
  const pill = (on: boolean) => `flex-1 rounded-xl border py-3 text-sm ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;

  if (paso === 3) {
    return (
      <form
        className="flex min-h-full flex-col px-5 pb-8 pt-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const perfil = { ...p, nombre: p.nombre.trim(), correo: p.correo.trim().toLowerCase(), direccion: p.direccion.trim() };
          const err = validarAcceso(p.telefono, password, password2) || contactoRepetido(listarConsumidores().map((c) => c.perfil), perfil);
          if (err) return setError(err);
          setGuardando(true);
          try {
            // La cuenta queda guardada en este navegador y se entra con ella
            const id = registrarConsumidor(perfil);
            await guardarClave("consumidor", id, password);
            iniciarSesion("consumidor", id);
            navigate({ to: "/consumidor" });
          } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo crear la cuenta.");
            setGuardando(false);
          }
        }}
      >
        <button type="button" onClick={() => setPaso(2)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="eyebrow mt-6">Paso 3 de 3</span>
        <h1 className="display mt-2 text-3xl">Crea tu acceso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Con tu teléfono o correo entras la próxima vez.</p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Teléfono celular</span>
            <input required inputMode="numeric" maxLength={10} value={p.telefono} onChange={(e) => setP({ ...p, telefono: e.target.value.replace(/\D/g, "") })} className={input} placeholder="81 1234 5678" />
          </label>
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
        <button type="submit" disabled={guardando} className="mt-8 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background disabled:opacity-60">
          {guardando ? "Creando tu cuenta…" : "Crear mi cuenta"}
        </button>
      </form>
    );
  }

  return (
    <form
      className="flex min-h-full flex-col px-5 pb-8 pt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (p.entrega === "domicilio" && !direccionValida(p.direccion)) return setError("Escribe la dirección a donde te llevamos tu canasta: calle, número y colonia.");
        if (p.pagos.length === 0) return setError("Elige al menos un método de pago.");
        setError("");
        setPaso(3);
      }}
    >
      <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="eyebrow mt-6">Paso 2 de 3</span>
      <h1 className="display mt-2 text-3xl">Cuéntanos de tu mesa</h1>

      <div className="mt-6 space-y-4">
        <label className="block"><span className="text-xs text-muted-foreground">Nombre</span><input required maxLength={100} value={p.nombre} onChange={(e) => setP({ ...p, nombre: e.target.value })} className={input} placeholder="Adriana Martínez" /></label>
        <label className="block"><span className="text-xs text-muted-foreground">Correo</span><input required type="email" maxLength={255} value={p.correo} onChange={(e) => setP({ ...p, correo: e.target.value })} className={input} placeholder="adriana@correo.com" /></label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Municipio (área metropolitana de Monterrey)</span>
          <select required value={p.municipio} onChange={(e) => setP({ ...p, municipio: e.target.value })} className={input}>
            <option value="" disabled>Selecciona tu municipio</option>
            {MUNICIPIOS.map((z) => <option key={z}>{z}</option>)}
          </select>
        </label>
        <div>
          <span className="text-xs text-muted-foreground">¿Cómo prefieres recibir?</span>
          <div className="mt-1.5 flex gap-2">
            <button type="button" className={pill(p.entrega === "domicilio")} onClick={() => setP({ ...p, entrega: "domicilio" })}>A domicilio</button>
            <button type="button" className={pill(p.entrega === "pickup")} onClick={() => setP({ ...p, entrega: "pickup" })}>Recoger</button>
          </div>
          {p.entrega === "domicilio" ? (
            <label className="mt-3 block">
              <span className="text-xs text-muted-foreground">Dirección de entrega</span>
              <input
                maxLength={140}
                autoComplete="street-address"
                value={p.direccion}
                onChange={(e) => { setP({ ...p, direccion: e.target.value }); setError(""); }}
                className={input}
                placeholder="Calle, número y colonia"
              />
              <span className="mt-1.5 block text-[11px] text-muted-foreground">
                {p.municipio ? `En ${p.municipio}. ` : ""}Puedes cambiarla en cada pedido o desde tu perfil.
              </span>
            </label>
          ) : (
            <p className="mt-1.5 text-[11px] text-muted-foreground">Recoges en un punto Milpa. Si después quieres entrega a domicilio, agregas tu dirección al pedir.</p>
          )}
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Métodos de pago</span>
          <div className="mt-1.5 flex gap-2">
            {METODOS_PAGO.map((m) => {
              const on = p.pagos.includes(m);
              return (
                <button
                  type="button"
                  key={m}
                  aria-pressed={on}
                  className={`${pill(on)} flex items-center justify-center gap-1.5`}
                  onClick={() => {
                    setError("");
                    // Se guardan siempre en el mismo orden, sin importar cuál tocó primero
                    setP({ ...p, pagos: METODOS_PAGO.filter((x) => (x === m ? !on : p.pagos.includes(x))) });
                  }}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                  {m}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Puedes elegir uno o varios. En cada pedido decides con cuál pagar.</p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <button type="submit" className="mt-8 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
        Continuar
      </button>
    </form>
  );
}
