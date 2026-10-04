/**
 * Score de confianza (sobre 10), según el modelo de negocio:
 * validación por sistema en 3 capas.
 */
export type ScoreLayers = {
  /** Capa 1 · consistencia de datos: fotos con fecha y ubicación, temporadas, perfil completo (0–100) */
  consistencia: number;
  /** Capa 2 · calificación cruzada del consumidor: últimas 20 reseñas, incluye merma reportada (0–100) */
  calificacion: number;
  /** Capa 3 · registro del distribuidor como tercero: entregas a tiempo y estado en recolección (0–100) */
  distribuidor: number;
};

export const SCORE_LAYERS: { key: keyof ScoreLayers; label: string; weight: number; help: string }[] = [
  { key: "calificacion", label: "Calificación de consumidores", weight: 40, help: "Promedio de las últimas 20 reseñas, incluye la merma que reportan" },
  { key: "consistencia", label: "Consistencia de datos", weight: 30, help: "Información básica completa: datos, identificación, cuenta de cobro y fotos del campo" },
  { key: "distribuidor", label: "Registro del distribuidor", weight: 30, help: "Entregas a tiempo y estado del producto al recolectar" },
];

export function score10(layers: ScoreLayers) {
  const total = SCORE_LAYERS.reduce((n, l) => n + (layers[l.key] * l.weight) / 100, 0);
  return Math.round(total) / 10;
}

/** Colores acordados: verde ≥ 8, amarillo ≥ 5, rojo < 5 */
export function scoreTone(score: number) {
  if (score >= 8) return "bg-primary text-primary-foreground";
  if (score >= 5) return "bg-miel text-ink";
  return "bg-destructive text-destructive-foreground";
}

export function formatScore(score: number) {
  return `${score.toFixed(1)}/10`;
}
