import { Link } from "@tanstack/react-router";
import { useId } from "react";
import { productosRelacionados, unitLabel } from "@/lib/data";
import { cookie12, pathCaja } from "@/lib/formas";

const COOKIE12 = pathCaja(cookie12);

/** Carrusel de cultivos del Mercado con la foto dentro de un marco Cookie de 12 lados */
export function ProductosRelacionados({ id }: { id: string }) {
  const clip = `cookie12-${useId().replace(/:/g, "")}`;
  const lista = productosRelacionados(id);
  if (lista.length === 0) return null;

  return (
    <section aria-labelledby={`${clip}-titulo`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id={clip} clipPathUnits="objectBoundingBox">
          <path d={COOKIE12} />
        </clipPath>
      </svg>
      <h2 id={`${clip}-titulo`} className="serif text-2xl">
        Productos relacionados
      </h2>
      <ul className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden">
        {lista.map((p) => (
          <li key={p.id} className="w-28 shrink-0 snap-start">
            <Link to="/consumidor/producto/$id" params={{ id: p.id }} className="group block text-center">
              <span className="relative mx-auto block h-28 w-28">
                <img
                  src={p.photo}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full bg-primary/15 object-cover transition group-active:scale-95"
                  style={{ clipPath: `url(#${clip})` }}
                />
              </span>
              <span className="serif mt-2 block text-sm leading-tight">{p.name}</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                ${p.price} / {unitLabel(p.unit)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
