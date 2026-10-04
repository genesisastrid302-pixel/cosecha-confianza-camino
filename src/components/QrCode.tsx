/**
 * QR visual para el prototipo. Dibuja un patrón determinista a partir del texto
 * (mismo texto → mismo dibujo) con los tres cuadros de posición de un QR real.
 * No es escaneable; cuando haya backend se reemplaza por una librería de QR.
 */
export function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  const n = 25;
  let seed = 0;
  for (const ch of value) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rand() > 0.52) cells.push({ x, y });

  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width={7} height={7} fill="currentColor" />
      <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="var(--card, #fff)" />
      <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="currentColor" />
    </g>
  );

  return (
    <svg
      role="img"
      aria-label={`Código QR de ${value}`}
      width={size}
      height={size}
      viewBox={`-2 -2 ${n + 4} ${n + 4}`}
      shapeRendering="crispEdges"
      className="text-foreground"
    >
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="var(--card, #fff)" />
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}
