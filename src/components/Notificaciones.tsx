import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";
import { formatTime } from "@/lib/orders";
import { leerVisto, marcarVistos, useAvisos, type Rol } from "@/lib/notificaciones";

const VACIO: Record<Rol, string> = {
  productor: "Aquí te avisamos de pedidos nuevos, recolecciones, pagos y calificaciones.",
  consumidor: "Aquí te avisamos cuando acepten, empaquen y entreguen tu pedido.",
  distribuidor: "Aquí te avisamos cuando un pedido se confirme y esté listo para recolectar.",
};

/** Pantalla de Notificaciones, la misma para los tres roles. */
export function Notificaciones({ rol, tabs, tone }: { rol: Rol; tabs: Tab[]; tone: "milpa" | "miel" | "terracota" }) {
  const { avisos } = useAvisos(rol);
  // Lo que no había visto antes de entrar se queda resaltado durante esta visita
  const [corte, setCorte] = useState<string | null>(null);
  const hecho = useRef(false);
  useEffect(() => {
    if (hecho.current) return;
    hecho.current = true;
    setCorte(leerVisto(rol));
    marcarVistos(rol);
  }, [rol]);

  const sinVer = corte === null ? 0 : avisos.filter((a) => a.at > corte).length;

  return (
    <AppShell
      tabs={tabs}
      tone={tone}
      eyebrow={sinVer > 0 ? `${sinVer} sin ver` : "Al día"}
      title="Notificaciones"
      right={
        <Link to={`/${rol}`} aria-label="Volver al inicio" className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-2.5 px-5">
        {avisos.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
            <div className="serif mt-2 text-lg">Sin notificaciones todavía</div>
            <p className="mt-1 text-sm text-muted-foreground">{VACIO[rol]}</p>
          </div>
        )}
        {avisos.map((a) => {
          const nuevo = corte !== null && a.at > corte;
          return (
            <Link
              key={a.id}
              to={a.href}
              className={`flex items-start gap-3 rounded-2xl border p-4 transition active:scale-[0.99] ${
                a.alerta ? "border-terracota/40 bg-terracota/5" : nuevo ? "border-primary/30 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  a.alerta ? "bg-terracota/15 text-terracota" : "bg-secondary text-foreground/70"
                }`}
              >
                {a.alerta ? <AlertTriangle className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className={`serif text-base leading-tight ${nuevo ? "" : "text-foreground/80"}`}>{a.titulo}</span>
                  {nuevo && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terracota" aria-label="Sin ver" />}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{a.detalle}</span>
                <span className="mt-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">{formatTime(a.at)}{a.pedido ? ` · #${a.pedido}` : ""}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
