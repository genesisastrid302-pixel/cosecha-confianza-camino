import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { coordsDe, LOCAL_DISTRIBUIDOR, type Coords, type PuntoMapa } from "@/lib/distribucion";

/** Servidor público de OSRM: traza la ruta por calles sin clave (uso de demo) */
const OSRM = "https://router.project-osrm.org/route/v1/driving/";

const pin = (clase: string, contenido: string) =>
  `<span class="pin-ruta ${clase}">${contenido}</span>`;
const ICONO_LOCAL =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>';

/**
 * Mapa real (OpenStreetMap + Leaflet) de la ruta del día. Los pines llevan el
 * mismo número y color que la lista de paradas; la línea sale del local.
 * Leaflet usa `window`, por eso se carga solo en el navegador.
 */
export function MapaRuta({ puntos }: { puntos: PuntoMapa[] }) {
  const el = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);
  const capa = useRef<LayerGroup | null>(null);
  const [trazo, setTrazo] = useState<"calles" | "aproximado">("calles");
  const clave = puntos.map((p) => `${p.n}:${p.tipo}:${p.coords.join(",")}`).join("|");

  useEffect(() => {
    let cancelado = false;
    const ctrl = new AbortController();

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !el.current) return;

      if (!mapa.current) {
        mapa.current = L.map(el.current, { scrollWheelZoom: false, zoomSnap: 0.5 });
        mapa.current.attributionControl.setPrefix(false);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapa.current);
        capa.current = L.layerGroup().addTo(mapa.current);
      }
      const m = mapa.current;
      const grupo = capa.current!;
      grupo.clearLayers();

      const origen = coordsDe(LOCAL_DISTRIBUIDOR)!;
      const ruta: Coords[] = [origen, ...puntos.map((p) => p.coords)].filter(
        (c, i, arr) => i === 0 || c.join() !== arr[i - 1].join(),
      );

      // Primero un trazo recto; se reemplaza por el de calles cuando responde OSRM
      const dibujarLinea = (coords: Coords[], aproximado: boolean) => [
        L.polyline(coords, { className: "ruta-borde", weight: 7, interactive: false }).addTo(grupo),
        L.polyline(coords, {
          className: aproximado ? "ruta-linea ruta-aprox" : "ruta-linea",
          weight: 4,
          interactive: false,
        }).addTo(grupo),
      ];
      let lineas = dibujarLinea(ruta, true);

      L.marker(origen, {
        icon: L.divIcon({
          className: "",
          html: pin("pin-local", ICONO_LOCAL),
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
        title: "Local Milpa · punto de salida",
        alt: "Local Milpa, punto de salida",
        zIndexOffset: -100,
      }).addTo(grupo);
      for (const p of puntos) {
        L.marker(p.coords, {
          icon: L.divIcon({
            className: "",
            html: pin(`pin-${p.tipo}`, String(p.n)),
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          title: `${p.n}. ${p.titulo}`,
          alt: `Parada ${p.n}: ${p.titulo}`,
          zIndexOffset: p.n,
        }).addTo(grupo);
      }

      m.fitBounds(L.latLngBounds(ruta), { padding: [32, 32], maxZoom: 14 });

      if (ruta.length < 2) return;
      try {
        const res = await fetch(
          `${OSRM}${ruta.map(([lat, lng]) => `${lng},${lat}`).join(";")}?overview=full&geometries=geojson`,
          {
            signal: ctrl.signal,
          },
        );
        const data = await res.json();
        const geo: [number, number][] | undefined = data?.routes?.[0]?.geometry?.coordinates;
        if (cancelado || !geo) throw new Error("sin ruta");
        lineas.forEach((l) => l.remove());
        lineas = dibujarLinea(
          geo.map(([lng, lat]) => [lat, lng] as Coords),
          false,
        );
        setTrazo("calles");
      } catch {
        if (!cancelado) setTrazo("aproximado");
      }
    })();

    return () => {
      cancelado = true;
      ctrl.abort();
    };
    // `clave` resume `puntos`: solo se redibuja si cambian las paradas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(
    () => () => {
      mapa.current?.remove();
      mapa.current = null;
    },
    [],
  );

  return (
    <div className="mapa-ruta relative isolate h-56 overflow-hidden rounded-2xl border border-border bg-secondary">
      <div ref={el} className="h-full w-full" role="region" aria-label="Mapa de la ruta del día" />
      {trazo === "aproximado" && (
        <span className="pointer-events-none absolute right-3 top-3 z-[500] rounded-full bg-card/90 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Trazo aproximado
        </span>
      )}
    </div>
  );
}
