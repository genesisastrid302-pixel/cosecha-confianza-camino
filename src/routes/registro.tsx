import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Sprout, Truck, Home } from "lucide-react";
import { ConsumidorForm } from "@/components/ConsumidorForm";
import { RoleOption } from "@/components/RoleOption";

export const Route = createFileRoute("/registro")({
  head: () => ({ meta: [{ title: "Crear cuenta — Milpa" }] }),
  component: Registro,
});

type Role = "productor" | "distribuidor" | "consumidor";

function Registro() {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  if (step === 2) return <ConsumidorForm onBack={() => setStep(1)} />;

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
        {role === "consumidor" ? (
          <button
            onClick={() => setStep(2)}
            className="block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background transition active:scale-[0.98]"
          >
            Continuar como consumidor
          </button>
        ) : role ? (
          <Link
            to={`/${role}` as "/productor" | "/distribuidor"}
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
        <Link to="/login/rol" className="mt-4 block text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <span className="text-foreground underline">Iniciar sesión</span>
        </Link>
      </div>
    </div>
  );
}
