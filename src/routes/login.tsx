import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import illustration from "@/assets/login-illustration.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión — Milpa" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden px-5 pb-6 pt-5">
      <div className="relative -mx-5 -mt-5 h-56 overflow-hidden bg-secondary/40">
        <img
          src={illustration}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-90 select-none"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
        <Link
          to="/"
          className="absolute left-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="relative z-10 mt-6">
        <span className="eyebrow">Bienvenido de vuelta</span>
        <h1 className="display mt-2 text-4xl">Hola otra vez.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          El campo te espera con la cosecha de la semana.
        </p>
      </div>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Field label="Teléfono o correo" placeholder="+52 81 1234 5678" />
        <Field label="Contraseña" placeholder="••••••••" type="password" />
        <div className="text-right">
          <a className="text-xs text-muted-foreground underline">¿Olvidaste tu contraseña?</a>
        </div>
      </form>

      <div className="mt-auto space-y-3 pt-8">
        <Link
          to="/consumidor"
          className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background"
        >
          Entrar
        </Link>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <Link to="/productor" className="rounded-full border border-border py-3 text-center text-muted-foreground">
            Demo productor
          </Link>
          <Link to="/distribuidor" className="rounded-full border border-border py-3 text-center text-muted-foreground">
            Demo distribuidor
          </Link>
          <Link to="/consumidor" className="rounded-full border border-border py-3 text-center text-muted-foreground">
            Demo consumidor
          </Link>
        </div>
        <Link to="/registro" className="block text-center text-sm text-muted-foreground">
          ¿Primera vez? <span className="text-foreground underline">Crear cuenta</span>
        </Link>
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
        className="mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
