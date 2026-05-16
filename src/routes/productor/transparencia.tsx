import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Camera, Mic, Video, X } from "lucide-react";
import seedlings from "@/assets/seedlings-hand.jpg";
import planting from "@/assets/planting-roots.jpg";
import harvest from "@/assets/harvest-field.jpg";
import field from "@/assets/field-landscape.jpg";

export const Route = createFileRoute("/productor/transparencia")({
  head: () => ({ meta: [{ title: "Transparencia · Productor — Milpa" }] }),
  component: Transparencia,
});

type Piece = { id: string; img: string; label: string; time: string };

const seedPieces: Piece[] = [
  { id: "p1", img: seedlings, label: "Plántulas listas para trasplante", time: "Hoy · 6:40 AM" },
  { id: "p2", img: planting, label: "Trasplante en cama de tierra viva", time: "Ayer" },
  { id: "p3", img: harvest, label: "Cosecha al amanecer con la cuadrilla", time: "3 d" },
  { id: "p4", img: field, label: "Surcos descansando entre ciclos", time: "1 sem" },
];

function Transparencia() {
  const [pieces, setPieces] = useState<Piece[]>(seedPieces);
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null, kind: "Foto" | "Video" | "Audio") {
    if (!files) return;
    const next: Piece[] = [];
    Array.from(files).forEach((f, i) => {
      const url = URL.createObjectURL(f);
      next.push({
        id: `${Date.now()}-${i}`,
        img: kind === "Audio" ? field : url,
        label: kind === "Audio" ? `Nota de voz · ${f.name}` : f.name,
        time: "Ahora mismo",
      });
    });
    setPieces((prev) => [...next, ...prev]);
  }

  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tu historia viva" title="Transparencia">
      {/* Inputs ocultos que abren cámara o galería del teléfono */}
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, "Foto")}
      />
      <input
        ref={videoInput}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, "Video")}
      />
      <input
        ref={audioInput}
        type="file"
        accept="audio/*"
        capture
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, "Audio")}
      />

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
            <UploadBtn icon={Camera} label="Foto del cultivo" onClick={() => photoInput.current?.click()} />
            <UploadBtn icon={Video} label="Video corto" onClick={() => videoInput.current?.click()} />
            <UploadBtn icon={Mic} label="Nota de voz" onClick={() => audioInput.current?.click()} />
          </div>
        </section>

        {/* Portfolio — proceso de cultivo */}
        <section>
          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Portafolio vivo · proceso de cultivo</div>
            <span className="text-[11px] text-muted-foreground">{pieces.length} piezas</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {pieces.map((p) => (
              <PieceCard key={p.id} piece={p} onRemove={() => setPieces((prev) => prev.filter((x) => x.id !== p.id))} />
            ))}
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

function UploadBtn({ icon: Icon, label, onClick }: { icon: typeof Camera; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card p-2 text-[11px] text-foreground/70 transition active:scale-[0.97]"
    >
      <Icon className="h-6 w-6 text-primary" />
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}

function PieceCard({ piece, onRemove }: { piece: Piece; onRemove: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card">
      <button
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/85 text-foreground/70 backdrop-blur"
        aria-label="Quitar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="aspect-square overflow-hidden">
        <img src={piece.img} alt={piece.label} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="p-2">
        <div className="text-xs leading-tight line-clamp-2">{piece.label}</div>
        <div className="text-[10px] text-muted-foreground">{piece.time}</div>
      </div>
    </div>
  );
}
