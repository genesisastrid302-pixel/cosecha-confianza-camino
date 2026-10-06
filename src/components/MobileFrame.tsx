import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useSesion, type Rol } from "@/lib/acceso";
import { Wifi } from "lucide-react";
import { IndicadorScroll } from "@/components/IndicadorScroll";

/**
 * Mobile app frame.
 * - On phones: full bleed.
 * - On tablet/desktop: shows a phone mock (notch + rounded edges) centered on a warm canvas.
 */
const INMERSIVAS = ["/"];
const ROLES: Rol[] = ["consumidor", "productor", "distribuidor"];

export function MobileFrame({ children }: { children: ReactNode }) {
  const contenido = useRef<HTMLDivElement>(null);
  // Pantallas con imagen de fondo: el contenido sube hasta el borde y la barra de estado va encima, en claro
  const inmersiva = useRouterState({ select: (s) => INMERSIVAS.includes(s.location.pathname) });
  // Las pantallas de cada rol son de la cuenta que inició sesión: sin sesión, primero se entra
  const rol = useRouterState({ select: (s) => ROLES.find((r) => s.location.pathname.split("/")[1] === r) ?? null });
  const sesion = useSesion(rol);
  const navigate = useNavigate();
  const sinSesion = !!rol && sesion.lista && !sesion.id;
  useEffect(() => {
    if (sinSesion && rol) navigate({ to: "/login", search: { rol }, replace: true });
  }, [sinSesion, rol, navigate]);
  const visible = !rol || (sesion.lista && !!sesion.id);
  return (
    <div className="min-h-[100dvh] w-full bg-paper md:flex md:items-center md:justify-center md:py-10">
      {/* Desktop ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.78_0.035_130/0.35),transparent_55%),radial-gradient(circle_at_75%_85%,oklch(0.74_0.135_75/0.18),transparent_50%)]" />
      </div>

      <div className="relative md:w-[420px]">
        {/* Phone frame chrome (desktop only) */}
        <div className="hidden md:block absolute -inset-2 rounded-[3rem] bg-ink/95 shadow-[0_30px_80px_-30px_rgba(60,40,20,0.5)]" />
        <div className="hidden md:block absolute -inset-[1px] rounded-[2.6rem] bg-gradient-to-b from-ink/70 to-ink/40" />

        <div className="relative h-[100dvh] w-full overflow-hidden bg-background md:h-[860px] md:w-[420px] md:rounded-[2.4rem]">
          {/* iOS-style notch (desktop only) */}
          <div className="hidden md:block pointer-events-none absolute left-1/2 top-2 z-50 h-7 w-32 -translate-x-1/2 rounded-full bg-ink" />

          {/* Status bar (desktop only) */}
          <div className={`hidden md:flex pointer-events-none absolute inset-x-0 top-0 z-40 h-10 items-center justify-between px-7 text-[11px] font-medium ${inmersiva ? "text-paper" : "bg-background text-foreground"}`}>
            <span>9:41</span>
            {/* Mismo tamaño que la hora: el texto hereda los 11px y el ícono ocupa su alto de letra */}
            <span className="flex items-center gap-1.5">
              <span>5G</span>
              <Wifi className="h-[13px] w-[13px]" strokeWidth={2.5} aria-label="Wi-Fi" />
            </span>
          </div>

          {/* Content */}
          <div ref={contenido} className={`relative h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              // El contenido empieza debajo de la barra de estado: al deslizar nada se asoma detrás de la hora
              inmersiva ? "" : "md:mt-10 md:h-[calc(100%-2.5rem)]"
            }`}>
            {visible ? children : null}
          </div>
          <IndicadorScroll contenedor={contenido} />
        </div>
      </div>
    </div>
  );
}
