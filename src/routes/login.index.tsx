import { createFileRoute, Link, redirect, useSearch } from "@tanstack/react-router";
import { ChevronLeft, Sprout, Truck, Home } from "lucide-react";
import type { Role } from "@/components/RoleOption";

const ROLES: Role[] = ["productor", "distribuidor", "consumidor"];
const COPY: Record<Role, { sub: string; icon: typeof Sprout; to: "/productor" | "/distribuidor" | "/consumidor" }> = {
  consumidor: { sub: "El campo te espera con la cosecha de la semana.", icon: Home, to: "/consumidor" },
  productor: { sub: "Tus pedidos y tu cosecha te esperan.", icon: Sprout, to: "/productor" },
  distribuidor: { sub: "Tu ruta del día está lista.", icon: Truck, to: "/distribuidor" },
};
import illustration from "@/assets/login-illustration.png";

export const Route = createFileRoute("/login/")({
  head: () => ({ meta: [{ title: "Iniciar sesión — Milpa" }] }),
  component: Login,
});

function Login() {
  const { rol } = useSearch({ from: "/login/" }) as { rol?: Role };
  const role = rol ?? "consumidor";
  const c = COPY[role];
  const Icon = c.icon;
  return (
    <div className="relative h-full overflow-hidden">
      <img
        src={illustration}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-25 select-none"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

      <div className="relative z-10 flex h-full flex-col px-5 pb-6 pt-5">
        <Link
          to="/login/rol"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="mt-24">
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
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Field label="Teléfono o correo" placeholder="+52 81 1234 5678" />
          <Field label="Contraseña" placeholder="••••••••" type="password" />
        </form>

        <div className="mt-auto space-y-3 pt-8">
          <Link
            to={c.to}
            className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background"
          >
            Entrar
          </Link>
          <Link to="/registro" className="block text-center text-sm text-muted-foreground">
            ¿Primera vez? <span className="text-foreground underline">Crear cuenta</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-input bg-card/80 backdrop-blur px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
