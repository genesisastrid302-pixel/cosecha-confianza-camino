/**
 * Estampa ondulada roja con el texto "Nuevo", para productores
 * que aún no juntan las reseñas necesarias para tener score.
 */
export function NuevoStamp({ size = 52, className = "" }: { size?: number; className?: string }) {
  // Contorno ondulado: 10 ondas alrededor de un círculo
  const waves = 10;
  const steps = 200;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = 44 + 4 * Math.cos(a * waves);
    points.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <svg
      role="img"
      aria-label="Productor nuevo"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`-rotate-12 drop-shadow-sm ${className}`}
    >
      <polygon points={points.join(" ")} fill="#E1162F" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFFFFF"
        fontFamily="'Work Sans', system-ui, sans-serif"
        fontWeight="700"
        fontSize="19"
        letterSpacing="0.5"
      >
        NUEVO
      </text>
    </svg>
  );
}
