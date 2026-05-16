import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Sprout, Truck, Home } from "lucide-react";

export const Route = createFileRoute("/registro")({
  head: () => ({ meta: [{ title: "Crear cuenta — Milpa" }] }),
  component: Registro,
});

type Role = "productor" | "distribuidor" | "consumidor";

function Registro() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <div className="flex h-full flex-col px-5 pb-8 pt-5">
      <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div className="mt-6">
        <span className="eyebrow">Paso 1 de 3</span>
        <h1 className="display mt-2 text-4xl">¿Cuál es tu lugar en la cadena?</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Elige el rol con el que vas a entrar. Después podrás cambiarlo desde tu perfil.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <RoleOption
          id="productor"
          active={role === "productor"}
          onClick={() => setRole("productor")}
          icon={Sprout}
          title="Soy productor"
          subtitle="Cultivo y vendo lo que cosecho"
          tone="milpa"
        />
        <RoleOption
          id="distribuidor"
          active={role === "distribuidor"}
          onClick={() => setRole("distribuidor")}
          icon={Truck}
          title="Soy distribuidor"
          subtitle="Recolecto y llevo a domicilio"
          tone="miel"
        />
        <RoleOption
          id="consumidor"
          active={role === "consumidor"}
          onClick={() => setRole("consumidor")}
          icon={Home}
          title="Soy consumidor"
          subtitle="Compro para mi familia"
          tone="terracota"
        />
      </div>

      <div className="mt-auto pt-8">
        {role ? (
          <Link
            to={`/${role}` as "/productor" | "/distribuidor" | "/consumidor"}
            className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background transition active:scale-[0.98]"
          >
            Continuar como {role}
          </Link>
        ) : (
          <button
            disabled
            className="block w-full rounded-full bg-secondary py-4 text-center text-sm font-medium text-muted-foreground"
          >
            Selecciona un rol
          </button>
        )}
        <Link to="/login" className="mt-4 block text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <span className="text-foreground underline">Iniciar sesión</span>
        </Link>
      </div>
    </div>
  );
}

function RoleOption({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
  tone,
}: {
  id: Role;
  active: boolean;
  onClick: () => void;
  icon: typeof Sprout;
  title: string;
  subtitle: string;
  tone: "milpa" | "miel" | "terracota";
}) {
  const toneBg = { milpa: "bg-primary/10 text-primary", miel: "bg-miel/15 text-miel", terracota: "bg-terracota/10 text-terracota" }[tone];
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        active ? "border-foreground bg-card shadow-soft" : "border-border bg-card hover:bg-secondary/40"
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneBg}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="serif text-lg leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <div className={`h-5 w-5 rounded-full border-2 ${active ? "border-foreground bg-foreground" : "border-border"}`} />
    </button>
  );
}
