import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import santiago from "@/assets/producer-santiago.jpg";
import { CheckCircle2, PackageCheck } from "lucide-react";

const steps = [
  { t: "Cosechado", d: "Ayer · 6:40 AM", s: "done" as const },
  { t: "Empacado · Lote LT-0518", d: "Ayer · 7:15 AM", s: "done" as const },
  { t: "Recolectado por Claudia", d: "Hoy · 8:02 AM · 8°C", s: "done" as const },
  { t: "En ruta a tu colonia", d: "Hoy · 9:30 AM", s: "done" as const },
  { t: "Entrega en tu puerta", d: "Hoy · 10:42 AM", s: "active" as const },
];

export const Route = createFileRoute("/consumidor/pedidos")({
  head: () => ({ meta: [{ title: "Tus pedidos · Milpa" }] }),
  component: () => (
    <AppShell tabs={consumidorTabs} tone="terracota" eyebrow="En curso" title="Tu pedido">
      <div className="space-y-5 px-5">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <img src={santiago} alt="Ezequiel" className="h-32 w-full object-cover" />
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#MLP-0518</div>
            <div className="serif mt-1 text-lg">De Ezequiel · Seis Tierras</div>
            <div className="text-[11px] text-muted-foreground">2 kg jitomate · 1 manojo cilantro</div>
          </div>
        </div>

        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="relative flex gap-4 pl-1">
              {i < steps.length - 1 && <span className={`absolute left-[11px] top-7 h-full w-px ${s.s === "done" ? "bg-primary/60" : "bg-border"}`} />}
              <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
                s.s === "done" ? "border-primary bg-primary text-primary-foreground"
                : s.s === "active" ? "border-terracota text-terracota animate-pulse"
                : "border-border text-muted-foreground"
              }`}>
                {s.s === "done" ? "✓" : i + 1}
              </div>
              <div className="flex-1">
                <div className="serif text-base leading-tight">{s.t}</div>
                <div className="text-[11px] text-muted-foreground">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA: marcar como recibido */}
        <Link
          to="/consumidor/recibir"
          className="flex items-center justify-between rounded-2xl bg-foreground p-5 text-background shadow-[0_10px_30px_-10px_rgba(60,40,20,0.4)] transition active:scale-[0.98]"
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">El repartidor está en tu puerta</div>
            <div className="serif mt-1 text-lg">Confirmar que llegó →</div>
          </div>
          <PackageCheck className="h-7 w-7" />
        </Link>

        <div className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
          <div className="eyebrow text-terracota">Nota de Ezequiel</div>
          <p className="serif mt-2 italic">"Esta semana el jitomate salió más chico, pero está más dulce."</p>
        </div>

        {/* Historial */}
        <section>
          <div className="eyebrow">Pedidos anteriores</div>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm">#MLP-0511 · Canasta Seis Tierras</div>
                <div className="text-[11px] text-muted-foreground">Hace 7 días · Calificaste 5★</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm">#MLP-0504 · Limón criollo de Rosa</div>
                <div className="text-[11px] text-muted-foreground">Hace 14 días · Calificaste 5★</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  ),
});
