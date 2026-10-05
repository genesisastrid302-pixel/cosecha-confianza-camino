import { useEffect, useState, type RefObject } from "react";

/**
 * Línea de scroll vertical siempre visible cuando la pantalla tiene más contenido
 * del que cabe. El navegador oculta la barra nativa en el marco del teléfono (y
 * en móvil solo aparece al deslizar), así que esta la reemplaza. Es solo un
 * indicador: no se arrastra, se desliza el contenido como siempre.
 */
export function IndicadorScroll({ contenedor }: { contenedor: RefObject<HTMLElement | null> }) {
  const [medida, setMedida] = useState<{ top: number; alto: number; abajo: number } | null>(null);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const medir = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight + 4) return setMedida(null);
      // El riel termina arriba de la barra inferior de pestañas, si la hay
      const nav = el.querySelector("nav");
      const abajo = nav ? nav.getBoundingClientRect().height : 0;
      // Mismo arriba que el riel: top-12 en el marco de escritorio (barra de estado), top-2 en el teléfono
      const arriba = window.matchMedia("(min-width: 768px)").matches ? 48 : 8;
      const riel = clientHeight - abajo - 8 - arriba;
      const alto = Math.max(32, (clientHeight / scrollHeight) * riel);
      const top = (scrollTop / (scrollHeight - clientHeight)) * (riel - alto);
      setMedida({ top, alto, abajo });
    };
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const tam = new ResizeObserver(medir);
    tam.observe(el);
    // Cambia de pantalla o crece el contenido → vuelve a medir
    const cambios = new MutationObserver(medir);
    cambios.observe(el, { childList: true, subtree: true });
    return () => {
      el.removeEventListener("scroll", medir);
      tam.disconnect();
      cambios.disconnect();
    };
  }, [contenedor]);

  if (!medida) return null;
  return (
    <div className="pointer-events-none absolute right-1 top-2 z-40 w-[3px] md:top-12" style={{ bottom: medida.abajo + 8 }} aria-hidden>
      <div className="absolute inset-0 rounded-full bg-ink/5" />
      <div className="absolute inset-x-0 rounded-full bg-ink/35" style={{ top: medida.top, height: medida.alto }} />
    </div>
  );
}
