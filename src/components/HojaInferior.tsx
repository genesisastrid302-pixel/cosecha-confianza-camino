import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Hoja que sube desde abajo (bottom sheet). Se monta en el marco de la app
 * (#marco-app), así cubre la pantalla del teléfono aunque el contenido de atrás
 * esté deslizado. Se cierra con la X, tocando fuera o con Escape.
 */
export function HojaInferior({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: ReactNode }) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [marco, setMarco] = useState<HTMLElement | null>(null);
  // onClose suele ser una función nueva en cada render; con la ref el efecto corre una sola vez
  const cerrar = useRef(onClose);
  cerrar.current = onClose;

  useEffect(() => {
    setMarco(document.getElementById("marco-app") ?? document.body);
    // El foco entra a la hoja y regresa a donde estaba al cerrarla
    const antes = document.activeElement as HTMLElement | null;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrar.current();
    window.addEventListener("keydown", alTeclear);
    return () => {
      window.removeEventListener("keydown", alTeclear);
      antes?.focus?.();
    };
  }, []);

  useEffect(() => {
    panel.current?.focus();
  }, [marco]);

  if (!marco) return null;
  return createPortal(
    <div className="absolute inset-0 z-50 flex items-end bg-foreground/40 animate-in fade-in duration-200" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="deslizar-y max-h-[90%] w-full rounded-t-3xl bg-background px-5 pb-8 pt-3 outline-none animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/15" aria-hidden />
        <div className="flex items-center justify-between gap-3">
          <h2 id={idTitulo} className="display text-2xl">
            {titulo}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    marco,
  );
}
