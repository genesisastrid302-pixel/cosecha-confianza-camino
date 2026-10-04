import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { NuevoStamp } from "@/components/NuevoStamp";
import { CompletenessCard } from "@/components/ProductorForm";
import {
  esNuevo,
  profileCompleteness,
  RESENAS_PARA_SCORE,
  trustScore,
  updateProducer,
  useProducer,
} from "@/lib/producer-store";
import { useOrders } from "@/lib/orders";

/**
 * Tarjeta única del score de confianza del productor.
 * Se usa igual en Inicio y en Transparencia para que siempre muestren lo mismo.
 */
export function ScoreCard({ showChecklist = true }: { showChecklist?: boolean }) {
  const [state, ready] = useProducer();
  const orders = useOrders();
  const { total, components } = trustScore(state);
  const { pct, checks } = profileCompleteness(state.profile);
  // lastScore guardado antes en escala de 100 se ignora
  const last = state.lastScore !== null && state.lastScore <= 10 ? state.lastScore : null;
  const dropped = last !== null && total < last;
  const nuevo = esNuevo(state);

  useEffect(() => {
    if (!ready || nuevo) return;
    if (last === null || total > last) updateProducer((s) => ({ ...s, lastScore: total }));
  }, [ready, total, last, nuevo]);

  if (nuevo) {
    const entregas = orders.filter((o) => ["en_recoleccion", "en_ruta", "entregado", "recibido", "calificado"].includes(o.status)).length;
    const capas = [
      {
        label: "Consistencia de datos · 30%",
        value: pct,
        right: pct === 100 ? "Completo" : `${pct}%`,
        help: pct === 100 ? "Tu información básica está completa: ya tienes este 30%." : "Completa tu información básica para ganar este 30%.",
      },
      {
        label: "Calificación de consumidores · 40%",
        value: (state.resenas / RESENAS_PARA_SCORE) * 100,
        right: `${state.resenas}/${RESENAS_PARA_SCORE} reseñas`,
        help: "Cada familia que recibe tu canasta y te califica suma.",
      },
      {
        label: "Registro del distribuidor · 30%",
        value: entregas > 0 ? 100 : 0,
        right: entregas > 0 ? `${entregas} ${entregas === 1 ? "recolección" : "recolecciones"}` : "Pendiente",
        help: "Empieza con tu primera recolección: puntualidad y estado del producto.",
      },
    ];
    return (
      <div className="space-y-3">
        <div className="relative rounded-2xl bg-primary p-5 text-primary-foreground shadow-paper">
          <NuevoStamp size={58} className="absolute right-3 top-3" />
          <div className="pr-16">
            <div className="text-[11px] tracking-widest uppercase opacity-80">Score de confianza</div>
            <div className="serif mt-2 text-2xl leading-tight">Tu score se está formando</div>
            <p className="mt-2 text-xs opacity-80">
              Las familias te ven como Nuevo hasta que juntes {RESENAS_PARA_SCORE} reseñas. Así vas:
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {capas.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between gap-3 text-xs">
                  <span>{c.label}</span>
                  <span className="shrink-0">{c.right}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper/20">
                  <div className="h-full rounded-full bg-paper" style={{ width: `${c.value}%` }} />
                </div>
                <div className="mt-1 text-[11px] opacity-75">{c.help}</div>
              </div>
            ))}
          </div>
        </div>
        {showChecklist && pct < 100 && <CompletenessCard pct={pct} checks={checks} />}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dropped && (
        <div className="flex items-start gap-3 rounded-2xl border border-terracota/40 bg-terracota/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-terracota" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Tu Score bajó de {last?.toFixed(1)} a {total.toFixed(1)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Revisa los componentes de abajo para saber qué mejorar.</p>
            <button onClick={() => updateProducer((s) => ({ ...s, lastScore: total }))} className="mt-2 text-xs underline">Entendido</button>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-paper">
        <div className="text-[11px] tracking-widest uppercase opacity-80">Score de confianza</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="display text-6xl">{total.toFixed(1)}</span>
          <span className="text-lg opacity-80">/ 10</span>
        </div>
        <p className="mt-1 text-xs opacity-80">Lo calcula el sistema. Es lo que ven las familias antes de comprarte.</p>
        <div className="mt-4 space-y-2.5">
          {components.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-xs">
                <span>{c.label} <span className="opacity-70">· {c.weight}%</span></span>
                <span>{(c.value / 10).toFixed(1)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper/20">
                <div className="h-full rounded-full bg-paper" style={{ width: `${c.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {showChecklist && pct < 100 && <CompletenessCard pct={pct} checks={checks} />}
    </div>
  );
}
