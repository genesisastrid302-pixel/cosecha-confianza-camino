import { createFileRoute, Link } from "@tanstack/react-router";
import illustration from "@/assets/login-illustration.png";
import { Seal } from "@/components/Seal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Milpa — Del campo a tu mesa" },
      { name: "description", content: "App de trazabilidad agroecológica para cadenas cortas en Monterrey." },
    ],
  }),
  component: Apertura,
});

function Apertura() {
  return (
    <div className="relative flex h-full flex-col text-paper">
      <img
        src={illustration}
        alt="Ilustración de la cadena corta Milpa"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/65 to-ink/95" />

      <div className="relative flex h-full flex-col px-6 pb-8 pt-14">
        <Seal className="h-14 w-14 text-paper" />

        <div className="mt-auto">
          <span className="text-[11px] tracking-[0.3em] uppercase text-paper/70">
            Cadena corta · Monterrey
          </span>
          <h1 className="display mt-3 text-[3.2rem] leading-[0.92]">
            Del campo
            <br />
            a tu mesa,
            <br />
            <em className="not-italic text-miel">con nombre.</em>
          </h1>
          <p className="mt-5 max-w-[28ch] text-[15px] leading-relaxed text-paper/85">
            Conoce a quien siembra lo que comes. Trazabilidad real para productores, distribuidores y familias.
          </p>

          <div className="mt-10 space-y-3">
            <Link
              to="/registro"
              className="block w-full rounded-full bg-paper py-4 text-center text-sm font-medium text-ink transition active:scale-[0.98]"
            >
              Crear mi cuenta
            </Link>
            <Link
              to="/login"
              className="block w-full rounded-full border border-paper/30 py-4 text-center text-sm text-paper transition active:scale-[0.98]"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <p className="mt-6 text-center text-[11px] text-paper/50">
            Al continuar aceptas el manifiesto de la cadena corta.
          </p>
        </div>
      </div>
    </div>
  );
}
