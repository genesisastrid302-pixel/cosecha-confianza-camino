// Hand-drawn circular wordmark used as logo across the app
export function Seal({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <path id="seal-arc-top" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0" fill="none" />
        <path id="seal-arc-bot" d="M 50,50 m -38,0 a 38,38 0 1,0 76,0" fill="none" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="1 2" />
      {/* sprout */}
      <g stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M50 64 V 40" />
        <path d="M50 48 C 44 46, 40 42, 40 36 C 46 36, 50 40, 50 46" fill="currentColor" opacity="0.85" />
        <path d="M50 44 C 56 42, 60 38, 60 32 C 54 32, 50 36, 50 42" fill="currentColor" opacity="0.85" />
      </g>
      <text fontFamily="Fraunces, serif" fontSize="7.5" fill="currentColor" letterSpacing="2">
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">DEL CAMPO · A LA MESA</textPath>
      </text>
      <text fontFamily="Fraunces, serif" fontSize="6.5" fill="currentColor" letterSpacing="3" opacity="0.7">
        <textPath href="#seal-arc-bot" startOffset="50%" textAnchor="middle">MONTERREY · 2025</textPath>
      </text>
    </svg>
  );
}
