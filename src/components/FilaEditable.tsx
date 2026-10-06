import { useState, type ReactNode } from "react";
import { ChevronDown, KeyRound } from "lucide-react";
import { claveCorrecta, guardarClave, sesionDe, tieneClave, type Rol } from "@/lib/acceso";

/** Estilo de los campos dentro de una fila del perfil */
export const campo =
  "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
export const botonGuardar =
  "flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-2.5 text-sm text-background disabled:bg-secondary disabled:text-muted-foreground";
export const pastilla = (on: boolean) =>
  `rounded-xl border px-3 py-2.5 text-xs ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;

/**
 * Fila del perfil que se abre para editar lo que se registró al crear la cuenta.
 * La usan los tres roles para que el perfil se edite igual en todos.
 */
export function FilaEditable({
  label,
  detail,
  warn,
  open,
  onClick,
  children,
}: {
  label: string;
  detail: string;
  warn?: boolean;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button type="button" onClick={onClick} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm">
        <span className="shrink-0">{label}</span>
        <span className={`flex min-w-0 items-center gap-2 text-xs ${warn ? "text-terracota" : "text-muted-foreground"}`}>
          <span className="truncate">{detail}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div className="border-t border-border bg-secondary/40 px-4 py-4">{children}</div>}
    </div>
  );
}

/** Abre una fila a la vez */
export function useFilaAbierta<T extends string>() {
  const [abierta, setAbierta] = useState<T | null>(null);
  return {
    abierta,
    cerrar: () => setAbierta(null),
    fila: (id: T) => ({ open: abierta === id, onClick: () => setAbierta((a) => (a === id ? null : id)) }),
  };
}

/** Cambio de contraseña de la cuenta con sesión: pide la actual y guarda la nueva */
export function CambiarClave({ rol, onDone }: { rol: Rol; onDone: () => void }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repite, setRepite] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const id = typeof window === "undefined" ? null : sesionDe(rol);
  // La cuenta de ejemplo (y las anteriores a las contraseñas) aún no tienen una
  const conClave = !!id && tieneClave(rol, id);

  return (
    <form
      className="space-y-2.5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!id) return;
        if (nueva.length < 8) return setError("La contraseña nueva debe tener al menos 8 caracteres.");
        if (nueva !== repite) return setError("Las contraseñas no coinciden.");
        setGuardando(true);
        try {
          if (conClave && !(await claveCorrecta(rol, id, actual))) {
            setGuardando(false);
            return setError("La contraseña actual no es correcta.");
          }
          await guardarClave(rol, id, nueva);
          onDone();
        } catch (err) {
          setGuardando(false);
          setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña.");
        }
      }}
    >
      {conClave && (
        <label className="block text-xs text-muted-foreground">
          Contraseña actual
          <input required type="password" autoComplete="current-password" value={actual} onChange={(e) => { setActual(e.target.value); setError(""); }} className={campo} />
        </label>
      )}
      <label className="block text-xs text-muted-foreground">
        Contraseña nueva
        <input required type="password" minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={nueva} onChange={(e) => { setNueva(e.target.value); setError(""); }} className={campo} />
      </label>
      <label className="block text-xs text-muted-foreground">
        Repite la contraseña nueva
        <input required type="password" autoComplete="new-password" value={repite} onChange={(e) => { setRepite(e.target.value); setError(""); }} className={campo} />
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button disabled={guardando} className={botonGuardar}>
        <KeyRound className="h-4 w-4" /> {guardando ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
