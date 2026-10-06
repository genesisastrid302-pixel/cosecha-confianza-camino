import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Sprout, Truck, Home, Handshake } from "lucide-react";
import {
  APORTACION_SOCIO,
  buscarCuenta,
  esNuevo,
  listarCuentas,
  profileCompleteness,
  RESENAS_PARA_SCORE,
  trustScore,
} from "@/lib/producer-store";
import { buscarConsumidor, buscarDistribuidor, listarConsumidores, listarDistribuidores } from "@/lib/accounts";
import { claveCorrecta, guardarClave, iniciarSesion, tieneClave } from "@/lib/acceso";
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

type CuentaLista = { id: string; nombre: string; contacto: string; detalle: string; foto?: string; nuevo?: boolean; ejemplo?: boolean };

/** Cuentas del rol guardadas en este navegador, con lo mínimo para reconocerlas */
function cuentasDe(role: Role): CuentaLista[] {
  if (role === "productor")
    return listarCuentas().map(({ id, state, ejemplo }) => ({
      id,
      nombre: state.profile.name,
      contacto: state.profile.correo || state.profile.telefono,
      detalle: `${esNuevo(state) ? `Nuevo · ${state.resenas}/${RESENAS_PARA_SCORE} reseñas` : `Score ${formatScore(trustScore(state).total)} · ${state.resenas} reseñas`} · perfil ${profileCompleteness(state.profile).pct}%`,
      foto: state.profile.photos[0],
      nuevo: esNuevo(state),
      ejemplo,
    }));
  if (role === "distribuidor")
    return listarDistribuidores().map(({ id, perfil }) => ({
      id,
      nombre: perfil.nombre,
      contacto: perfil.correo || perfil.telefono,
      detalle: [perfil.transporte === "Paquetería" ? `Paquetería · ${perfil.paqueteria}` : perfil.vehiculo || perfil.transporte, perfil.zonas[0]].filter(Boolean).join(" · "),
    }));
  return listarConsumidores().map(({ id, perfil }) => ({
    id,
    nombre: perfil.nombre,
    contacto: perfil.correo || perfil.telefono,
    detalle: `${perfil.entrega === "domicilio" ? "A domicilio" : "Recoge"} · ${perfil.municipio}`,
  }));
}

/** El contacto se muestra a medias: alcanza para reconocer la cuenta sin exhibir el dato completo */
const tel = (t: string) => (/^\d{10}$/.test(t) ? `Tel. ···${t.slice(-4)}` : t.replace(/^(.{2}).*(@.*)$/, "$1···$2"));

function Login() {
  const { rol } = Route.useSearch();
  const role = rol ?? "consumidor";
  const c = COPY[role];
  const Icon = c.icon;
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaLista[]>([]);
  const clave = useRef<HTMLInputElement>(null);
  useEffect(() => setCuentas(cuentasDe(role)), [role]);

  const entrar = async () => {
    const cuenta = buscar(role, identificador);
    if (!cuenta) return setError(`No hay una cuenta de ${role} con ese teléfono o correo en este dispositivo. Revisa el dato o crea tu cuenta.`);
    if (password.length < 8) return setError("Escribe tu contraseña (mínimo 8 caracteres).");
    setEntrando(true);
    try {
      if (!tieneClave(role, cuenta.id)) {
        // Cuenta creada antes de que se guardaran contraseñas: la que escribe ahora queda como su contraseña
        await guardarClave(role, cuenta.id, password);
      } else if (!(await claveCorrecta(role, cuenta.id, password))) {
        setEntrando(false);
        return setError("La contraseña no coincide con la de esa cuenta.");
      }
      iniciarSesion(role, cuenta.id);
      navigate({ to: c.to });
    } catch (e) {
      setEntrando(false);
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    }
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

        <div className={cuentas.length > 0 ? "mt-8" : "mt-24"}>
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
          <Field label="Teléfono o correo" placeholder="81 1234 5678" value={identificador} autoComplete="username" onChange={(v) => { setIdentificador(v); setError(""); }} />
          <Field label="Contraseña" placeholder="••••••••" type="password" value={password} autoComplete="current-password" inputRef={clave} onChange={(v) => { setPassword(v); setError(""); }} />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

        {cuentas.length > 0 && (
          <section className="mt-6">
            <div className="eyebrow">Cuentas en este dispositivo</div>
            <div className="mt-2 space-y-2">
              {cuentas.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => {
                    // La cuenta de ejemplo entra directo; las reales piden su contraseña
                    if (x.ejemplo) {
                      iniciarSesion(role, x.id);
                      return navigate({ to: c.to });
                    }
                    setIdentificador(x.contacto);
                    setError("");
                    clave.current?.focus();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border bg-card/90 p-3 text-left backdrop-blur ${
                    !x.ejemplo && identificador === x.contacto ? "border-foreground" : "border-border"
                  }`}
                >
                  <div className="relative shrink-0">
                    {x.foto ? (
                      <img src={x.foto} alt="" className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary"><Icon className="h-5 w-5" /></span>
                    )}
                    {x.nuevo && <NuevoStamp size={26} className="absolute -left-2 -top-2" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      {x.nombre || "Sin nombre"}
                      {x.ejemplo && <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Ejemplo</span>}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">{x.detalle}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {x.ejemplo ? "Entra sin contraseña" : `${tel(x.contacto)} · pide contraseña`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-auto space-y-3 pt-8">
          <button
            type="button"
            onClick={entrar}
            disabled={entrando}
            className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background disabled:opacity-60"
          >
            {entrando ? "Entrando…" : "Entrar"}
          </button>
          <Link to="/registro" className="block text-center text-sm text-muted-foreground">
            ¿Primera vez? <span className="text-foreground underline">Crear cuenta</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Busca la cuenta real del rol por teléfono o correo */
function buscar(role: Role, identificador: string): { id: string } | undefined {
  if (role === "productor") {
    const cuenta = buscarCuenta(identificador);
    return cuenta && !cuenta.ejemplo ? cuenta : undefined;
  }
  return role === "distribuidor" ? buscarDistribuidor(identificador) : buscarConsumidor(identificador);
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  inputRef,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-input bg-card/80 backdrop-blur px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
