import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Camera, Mic, Video } from "lucide-react";
import field from "@/assets/field-landscape.jpg";
import tomato from "@/assets/product-tomato.jpg";

export const Route = createFileRoute("/productor/transparencia")({
  head: () => ({ meta: [{ title: "Transparencia · Productor — Milpa" }] }),
  component: Transparencia,
});

function Transparencia() {
  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tu historia viva" title="Transparencia">
      <div className="space-y-6 px-5">
        {/* Score card */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Tu score de confianza</span>
            <span className="text-[10px] text-muted-foreground">Auto-generado</span>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="display text-6xl text-primary">94</span>
            <span className="mb-2 text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: "94%" }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sube esta semana con más evidencia visual y notas de voz.
          </p>
        </div>

        {/* Upload actions */}
        <section>
          <div className="eyebrow">Sumar evidencia</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <UploadBtn icon={Camera} label="Foto del cultivo" />
            <UploadBtn icon={Video} label="Video corto" />
            <UploadBtn icon={Mic} label="Nota de voz" />
          </div>
        </section>

        {/* Portfolio */}
        <section>
          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Portafolio vivo</div>
            <span className="text-[11px] text-muted-foreground">12 piezas</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Piece img={field} label="Riego al amanecer" time="Hoy · 6:40 AM" />
            <Piece img={tomato} label="Cosecha del lunes" time="Ayer" />
            <Piece img={field} label="Compostaje natural" time="3 d" />
            <Piece img={tomato} label="Semillas criollas" time="1 sem" />
          </div>
        </section>

        {/* Nota al consumidor */}
        <section className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
          <div className="eyebrow text-terracota">Nota al consumidor · esta semana</div>
          <textarea
            className="mt-2 w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
            rows={3}
            defaultValue="Esta semana el jitomate salió más chico porque llovió menos, pero está más dulce."
          />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>Visible en el perfil y en el QR del lote</span>
            <button className="font-medium text-terracota">Guardar</button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function UploadBtn({ icon: Icon, label }: { icon: typeof Camera; label: string }) {
  return (
    <button className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card p-2 text-[11px] text-foreground/70">
      <Icon className="h-6 w-6 text-primary" />
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}

function Piece({ img, label, time }: { img: string; label: string; time: string }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card">
      <div className="aspect-square overflow-hidden">
        <img src={img} alt={label} className="h-full w-full object-cover" />
      </div>
      <div className="p-2">
        <div className="text-xs">{label}</div>
        <div className="text-[10px] text-muted-foreground">{time}</div>
      </div>
    </div>
  );
}
