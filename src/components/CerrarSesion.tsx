import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { cerrarSesion, type Rol } from "@/lib/acceso";

/** Sale de la cuenta del rol y vuelve a la bienvenida. La cuenta y sus pedidos siguen guardados. */
export function CerrarSesion({ rol }: { rol: Rol }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      // Primero se sale de la pantalla y luego se cierra la sesión, para no pasar por el inicio de sesión
      onClick={() => navigate({ to: "/" }).then(() => cerrarSesion(rol))}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm text-muted-foreground"
    >
      <LogOut className="h-4 w-4" /> Cerrar sesión
    </button>
  );
}
