import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useAvisos, type Rol } from "@/lib/notificaciones";

/** Campanita del encabezado: lleva a Notificaciones y muestra cuántas hay sin ver. */
export function Campana({ rol }: { rol: Rol }) {
  const { nuevos } = useAvisos(rol);
  return (
    <Link
      to={`/${rol}/notificaciones`}
      aria-label={nuevos > 0 ? `Notificaciones · ${nuevos} sin ver` : "Notificaciones"}
      className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary"
    >
      <Bell className="h-5 w-5" />
      {nuevos > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracota px-1 text-[10px] font-medium leading-none text-white">
          {nuevos > 9 ? "9+" : nuevos}
        </span>
      )}
    </Link>
  );
}
