import { useEffect, useState, type RefObject } from "react";

/**
 * Línea de scroll vertical para pantallas con más contenido del que cabe.
 * Aparece al entrar a la pantalla y mientras se desliza, y se desvanece al
 * quedarse quieta (como iOS y Android): avisa que hay más sin quedarse
 * encima de las fotos. Es solo un indicador: no se arrastra.
 */
export function IndicadorScroll({ contenedor }: { contenedor: RefObject<HTMLElement | null> }) {
  const [medida, setMedida] = useState<{ top: number; alto: number; abajo: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    let ocultar: ReturnType<typeof setTimeout> | undefined;
    // Se muestra y, si nada se mueve en 1.2 s, se desvanece
    const mostrar = () => {
      setVisible(true);
      clearTimeout(ocultar);
      ocultar = setTimeout(() => setVisible(false), 1200);
    };
    let ruta = location.pathname;
    const medir = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight + 4) return setMedida(null);
      // El riel termina arriba de la barra inferior de pestañas, si la hay
      const nav = el.querySelector("nav");
      const abajo = nav ? nav.getBoundingClientRect().height : 0;
      // Mismo arriba que el riel: top-12 en el marco de escritorio (barra de estado), top-2 en el teléfono
      const arriba = window.matchMedia("(min-width: 768px)").matches ? 48 : 8;
      // El riel se mide en el marco, no en el contenido (que empieza debajo de la barra de estado)
      const riel = (el.parentElement?.clientHeight ?? clientHeight) - abajo - 8 - arriba;
      const alto = Math.max(32, (clientHeight / scrollHeight) * riel);
      const top = (scrollTop / (scrollHeight - clientHeight)) * (riel - alto);
      setMedida({ top, alto, abajo });
    };
    const alDeslizar = () => {
      medir();
      mostrar();
    };
    medir();
    mostrar();
    el.addEventListener("scroll", alDeslizar, { passive: true });
    const tam = new ResizeObserver(medir);
    tam.observe(el);
    // Crece el contenido → vuelve a medir; cambia de pantalla → además se vuelve a mostrar
    const cambios = new MutationObserver(() => {
      medir();
      if (location.pathname !== ruta) {
        ruta = location.pathname;
        mostrar();
      }
    });
    cambios.observe(el, { childList: true, subtree: true });
    return () => {
      clearTimeout(ocultar);
      el.removeEventListener("scroll", alDeslizar);
      tam.disconnect();
      cambios.disconnect();
    };
  }, [contenedor]);

  if (!medida) return null;
  return (
    <div
      className={`pointer-events-none absolute right-1 top-2 z-40 w-[3px] transition-opacity duration-500 md:top-12 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ bottom: medida.abajo + 8 }}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-ink/5" />
      <div className="absolute inset-x-0 rounded-full bg-ink/35" style={{ top: medida.top, height: medida.alto }} />
    </div>
  );
}
