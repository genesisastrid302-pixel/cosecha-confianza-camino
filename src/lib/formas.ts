/**
 * Formas orgánicas inspiradas en Material 3 Expressive (MaterialShapes).
 * Cada forma es un radio en función del ángulo (0..1), así todas comparten el
 * mismo número de puntos y se pueden transformar unas en otras suavemente.
 * https://developer.android.com/reference/kotlin/androidx/compose/material3/MaterialShapes
 */

export type Forma = (angulo: number) => number;

const elipse = (ancho: number, alto: number): Forma => (t) =>
  (ancho * alto) / Math.hypot(alto * Math.cos(t), ancho * Math.sin(t));

/** Cookie12Sided: 12 lóbulos redondeados (star de 12 puntas, radio interior 0.8, esquinas redondeadas) */
export const cookie12: Forma = (t) => 0.92 + 0.08 * Math.cos(12 * t);

/** Secuencia del indicador de carga de Material 3 (SoftBurst → … → Oval) */
export const FORMAS_CARGA: Forma[] = [
  (t) => 0.88 + 0.12 * Math.cos(10 * t), // SoftBurst
  (t) => 0.9 + 0.1 * Math.cos(9 * t), // Cookie9Sided
  (t) => 0.9 + 0.1 * Math.cos(5 * t), // Pentagon redondeado
  elipse(1, 0.62), // Pill
  (t) => 0.94 + 0.06 * Math.cos(8 * t), // Sunny
  (t) => 0.86 + 0.14 * Math.cos(4 * t), // Cookie4Sided
  elipse(1, 0.8), // Oval
];

export const PUNTOS = 144;

/** Radios de una forma muestreados en PUNTOS ángulos */
export function muestrear(forma: Forma): number[] {
  return Array.from({ length: PUNTOS }, (_, i) => forma((i / PUNTOS) * Math.PI * 2));
}

/** Path SVG cerrado centrado en (c, c) con radio máximo r */
export function pathDesdeRadios(radios: number[], c: number, r: number): string {
  return (
    radios
      .map((k, i) => {
        const t = (i / radios.length) * Math.PI * 2;
        return `${i === 0 ? "M" : "L"}${(c + Math.cos(t) * k * r).toFixed(3)} ${(c + Math.sin(t) * k * r).toFixed(3)}`;
      })
      .join(" ") + " Z"
  );
}

/** Path en coordenadas 0..1, para un clipPath con clipPathUnits="objectBoundingBox" */
export const pathCaja = (forma: Forma) => pathDesdeRadios(muestrear(forma), 0.5, 0.5);
