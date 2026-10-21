import { useId } from "react";
import { cookie12, pathCaja } from "@/lib/formas";

const COOKIE12 = pathCaja(cookie12);

/** Foto recortada con el marco Cookie de 12 lados (Material 3) */
export function FotoCookie({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const clip = `cookie-${useId().replace(/:/g, "")}`;
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id={clip} clipPathUnits="objectBoundingBox">
          <path d={COOKIE12} />
        </clipPath>
      </svg>
      <img src={src} alt={alt} loading="lazy" className={`bg-primary/15 object-cover ${className}`} style={{ clipPath: `url(#${clip})` }} />
    </>
  );
}
