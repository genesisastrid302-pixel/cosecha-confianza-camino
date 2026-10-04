import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Sprout, Truck, Home } from "lucide-react";
import { RoleOption, type Role } from "@/components/RoleOption";

export const Route = createFileRoute("/login/rol")({
  head: () => ({
    meta: [
      { title: "Elige tu rol — Milpa" },
      { name: "description", content: "Elige si entras como productor, distribuidor o consumidor." },
      { property: "og:title", content: "Elige tu rol — Milpa" },
      { property: "og:description", content: "Elige si entras como productor, distribuidor o consumidor." },
    ],
  }),
  component: LoginRol,
});

function LoginRol() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <div className="flex h-full flex-col px-5 pb-8 pt-5">
      <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div className="mt-6">
        <span className="eyebrow">Bienvenido de vuelta</span>
        <h1 className="display mt-2 text-4xl">¿Con qué rol entras?</h1>
        <p className="mt-3 text-sm text-muted-foreground">Elige cómo quieres entrar hoy.</p>
      </div>

      <div className="mt-6 space-y-3">
        <RoleOption id="productor" active={role === "productor"} onClick={() => setRole("productor")} icon={Sprout} title="Soy productor" subtitle="Cultivo y vendo lo que cosecho" tone="milpa" />
        <RoleOption id="distribuidor" active={role === "distribuidor"} onClick={() => setRole("distribuidor")} icon={Truck} title="Soy distribuidor" subtitle="Recolecto y llevo a domicilio" tone="miel" />
        <RoleOption id="consumidor" active={role === "consumidor"} onClick={() => setRole("consumidor")} icon={Home} title="Soy consumidor" subtitle="Compro para mi familia" tone="terracota" />
      </div>

      <div className="mt-auto pt-8">
        {role ? (
          <Link
            to="/login"
            search={{ rol: role }}
            className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background transition active:scale-[0.98]"
          >
            Continuar
          </Link>
        ) : (
          <button disabled className="block w-full rounded-full bg-secondary py-4 text-center text-sm font-medium text-muted-foreground">
            Selecciona un rol
          </button>
        )}
        <Link to="/registro" className="mt-4 block text-center text-sm text-muted-foreground">
          ¿Primera vez? <span className="text-foreground underline">Crear cuenta</span>
        </Link>
      </div>
    </div>
  );
}
