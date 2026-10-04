import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Sprout, Truck, Home, Handshake } from "lucide-react";
import {
  APORTACION_SOCIO,
  buscarCuenta,
  entrarComoProductor,
  esNuevo,
  listarCuentas,
  profileCompleteness,
  RESENAS_PARA_SCORE,
  trustScore,
} from "@/lib/producer-store";
import { formatScore } from "@/lib/score";
import { NuevoStamp } from "@/components/NuevoStamp";
import type { Role } from "@/components/RoleOption";

const ROLES: Role[] = ["productor", "distribuidor", "consumidor"];
const COPY: Record<Role, { sub: string; icon: typeof Sprout; to: "/productor" | "/distribuidor" | "/consumidor" }> = {
  consumidor: { sub: "El campo te espera con la cosecha de la semana.", icon: Home, to: "/consumidor" },
  productor: { sub: "Tus pedidos y tu cosecha te esperan.", icon: Sprout, to: "/productor" },
  distribuidor: { sub: "Tu ruta del día está lista.", icon: Truck, to: "/distribuidor" },
};
import illustration from "@/assets/login-illustration.png";

export const Route = createFileRoute("/login/")({
  validateSearch: (s: Record<string, unknown>): { rol?: Role } => ({
    rol: ROLES.includes(s.rol as Role) ? (s.rol as Role) : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (!search.rol) throw redirect({ to: "/login/rol" });
  },
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Milpa" },
      { name: "description", content: "Entra a Milpa con tu rol en la cadena agroecológica." },
      { property: "og:title", content: "Iniciar sesión — Milpa" },
      { property: "og:description", content: "Entra a Milpa con tu rol en la cadena agroecológica." },
    ],
  }),
  component: Login,
});

function Login() {
  const { rol } = Route.useSearch();
  const role = rol ?? "consumidor";
  const c = COPY[role];
  const Icon = c.icon;
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState("");
  const [error, setError] = useState("");
  const [cuentas, setCuentas] = useState<ReturnType<typeof listarCuentas>>([]);
  useEffect(() => setCuentas(role === "productor" ? listarCuentas() : []), [role]);

  const entrar = () => {
    if (role !== "productor") return navigate({ to: c.to });
    const cuenta = buscarCuenta(identificador);
    if (!cuenta) return setError("No hay una cuenta de productor con ese teléfono o correo en este dispositivo. Elige una de la lista o crea tu cuenta.");
    entrarComoProductor(cuenta.id);
    navigate({ to: "/productor" });
  };
  return (
    <div className="relative min-h-full overflow-hidden">
      <img
        src={illustration}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-25 select-none"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

      <div className="relative z-10 flex min-h-full flex-col px-5 pb-6 pt-5">
        <Link
          to="/login/rol"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className={role === "productor" ? "mt-8" : "mt-24"}>
          <span className="eyebrow">Bienvenido de vuelta</span>
          <h1 className="display mt-2 text-4xl">Hola otra vez.</h1>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-foreground">
              <Icon className="h-3.5 w-3.5" />
              Entrando como {role}
            </span>
            <Link to="/login/rol" className="text-muted-foreground underline">
              Cambiar
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{c.sub}</p>
          {role === "productor" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs leading-relaxed">
              <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Entras como <strong>socio de Milpa</strong>: aportas el {APORTACION_SOCIO}% de cada venta y se descuenta en
                automático de tus pagos, sin cuotas fijas.
              </span>
            </div>
          )}
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            entrar();
          }}
        >
          <Field label="Teléfono o correo" placeholder="+52 81 1234 5678" value={identificador} onChange={(v) => { setIdentificador(v); setError(""); }} />
          <Field label="Contraseña" placeholder="••••••••" type="password" />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

        {role === "productor" && cuentas.length > 0 && (
          <section className="mt-6">
            <div className="eyebrow">Cuentas en este dispositivo</div>
            <div className="mt-2 space-y-2">
              {cuentas.map(({ id, state, ejemplo }) => {
                const nuevo = esNuevo(state);
                const pct = profileCompleteness(state.profile).pct;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      entrarComoProductor(id);
                      navigate({ to: "/productor" });
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/90 p-3 text-left backdrop-blur"
                  >
                    <div className="relative shrink-0">
                      {state.profile.photos[0] ? (
                        <img src={state.profile.photos[0]} alt="" className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary"><Sprout className="h-5 w-5" /></span>
                      )}
                      {nuevo && <NuevoStamp size={26} className="absolute -left-2 -top-2" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">
                        {state.profile.name || "Sin nombre"}
                        {ejemplo && <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Ejemplo</span>}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {nuevo ? `Nuevo · ${state.resenas}/${RESENAS_PARA_SCORE} reseñas` : `Score ${formatScore(trustScore(state).total)} · ${state.resenas} reseñas`} · perfil {pct}%
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">{state.profile.correo}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-auto space-y-3 pt-8">
          <button
            type="button"
            onClick={entrar}
            className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background"
          >
            Entrar
          </button>
          <Link to="/registro" className="block text-center text-sm text-muted-foreground">
            ¿Primera vez? <span className="text-foreground underline">Crear cuenta</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        {...(onChange ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : {})}
        className="mt-1.5 w-full rounded-xl border border-input bg-card/80 backdrop-blur px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
