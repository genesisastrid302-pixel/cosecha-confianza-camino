import { useEffect, useRef } from "react";
import { FORMAS_CARGA, muestrear, pathDesdeRadios } from "@/lib/formas";

const RADIOS = FORMAS_CARGA.map(muestrear);
const FIJA_MS = 650; // tiempo que se queda cada forma
const CAMBIO_MS = 350; // tiempo de la transformación a la siguiente
const VUELTA_MS = 4700; // una vuelta completa

/** Suaviza la transformación (ease-in-out) */
const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

/**
 * Indicador de carga al estilo de Material 3: una forma verde que gira y se
 * transforma (48 px de contenedor, 38 px de forma). `contenido` agrega el
 * círculo de fondo. Con "reducir movimiento" se queda quieta.
 * https://m3.material.io/components/loading-indicator
 */
export function IndicadorCarga({
  etiqueta = "Cargando",
  contenido = false,
  className = "",
}: {
  etiqueta?: string;
  contenido?: boolean;
  className?: string;
}) {
  const forma = useRef<SVGPathElement>(null);
  const grupo = useRef<SVGGElement>(null);
  // Con contenedor, la forma se achica para dejar aire dentro del círculo
  const radio = contenido ? 15 : 19;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const inicio = performance.now();
    const ciclo = FIJA_MS + CAMBIO_MS;
    const tick = (ahora: number) => {
      // El primer cuadro puede traer una hora anterior a `inicio`; sin el tope el índice sale negativo
      const t = Math.max(0, ahora - inicio);
      const i = Math.floor(t / ciclo) % RADIOS.length;
      const enCiclo = t % ciclo;
      const avance = enCiclo < FIJA_MS ? 0 : suave((enCiclo - FIJA_MS) / CAMBIO_MS);
      const a = RADIOS[i];
      const b = RADIOS[(i + 1) % RADIOS.length];
      forma.current?.setAttribute("d", pathDesdeRadios(a.map((r, k) => r + (b[k] - r) * avance), 24, radio));
      // Gira constante y da un empujón extra mientras cambia de forma
      const giro = (t / VUELTA_MS) * 360 + (Math.floor(t / ciclo) + avance) * 90;
      grupo.current?.setAttribute("transform", `rotate(${giro % 360} 24 24)`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [radio]);

  return (
    <span role="progressbar" aria-label={etiqueta} className={`inline-flex h-12 w-12 items-center justify-center ${className}`}>
      <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
        {contenido && <circle cx="24" cy="24" r="24" className="fill-primary/15" />}
        <g ref={grupo}>
          <path ref={forma} d={pathDesdeRadios(RADIOS[0], 24, radio)} className="fill-primary" />
        </g>
      </svg>
    </span>
  );
}
