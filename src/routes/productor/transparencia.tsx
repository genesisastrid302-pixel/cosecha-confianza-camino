import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Camera, Mic, Video, X, MapPin, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import seedlings from "@/assets/seedlings-hand.jpg";
import planting from "@/assets/planting-roots.jpg";
import harvest from "@/assets/harvest-field.jpg";
import field from "@/assets/field-landscape.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ScoreCard } from "@/components/ScoreCard";

export const Route = createFileRoute("/productor/transparencia")({
  head: () => ({ meta: [{ title: "Transparencia · Productor — Milpa" }] }),
  component: Transparencia,
});

type Kind = "Foto" | "Video" | "Audio";
type Piece = {
  id: string;
  img: string;
  label: string;
  kind: Kind;
  date: Date;
  place: string;
};

type Pending = { file: File; preview: string; kind: Kind };

const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000);

const seedPieces: Piece[] = [
  { id: "p1", img: seedlings, label: "Plántulas listas para trasplante", kind: "Foto", date: today, place: "Invernadero · Ramos Arizpe" },
  { id: "p2", img: planting, label: "Trasplante en cama de tierra viva", kind: "Foto", date: daysAgo(1), place: "Parcela norte · Surco 3" },
  { id: "p3", img: harvest, label: "Cosecha al amanecer con la cuadrilla", kind: "Foto", date: daysAgo(3), place: "Parcela sur · Galeana" },
  { id: "p4", img: field, label: "Surcos descansando entre ciclos", kind: "Foto", date: daysAgo(7), place: "Parcela norte" },
];

function Transparencia() {
  const [pieces, setPieces] = useState<Piece[]>(seedPieces);
  const [pending, setPending] = useState<Pending[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [place, setPlace] = useState("");
  const [label, setLabel] = useState("");

  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null, kind: Kind) {
    if (!files || files.length === 0) return;
    const next: Pending[] = Array.from(files).map((f) => ({
      file: f,
      preview: kind === "Audio" ? field : URL.createObjectURL(f),
      kind,
    }));
    setPending(next);
    setDate(new Date());
    setPlace("");
    setLabel(kind === "Audio" ? "Nota de voz" : "");
  }

  function save() {
    if (pending.length === 0 || !date) return;
    const stamp = Date.now();
    const added: Piece[] = pending.map((p, i) => ({
      id: `${stamp}-${i}`,
      img: p.preview,
      kind: p.kind,
      label: label.trim() || p.file.name,
      date: date!,
      place: place.trim() || "Sin ubicación",
    }));
    setPieces((prev) => [...added, ...prev]);
    setPending([]);
  }

  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tu historia viva" title="Transparencia">
      {/* Inputs ocultos: cámara o galería del teléfono */}
      <input ref={photoInput} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { onFiles(e.target.files, "Foto"); e.target.value = ""; }} />
      <input ref={videoInput} type="file" accept="video/*" capture="environment" className="hidden"
        onChange={(e) => { onFiles(e.target.files, "Video"); e.target.value = ""; }} />
      <input ref={audioInput} type="file" accept="audio/*" capture className="hidden"
        onChange={(e) => { onFiles(e.target.files, "Audio"); e.target.value = ""; }} />

      <div className="space-y-6 px-5">
        {/* Mismo score que en Inicio */}
        <ScoreCard showChecklist={false} />
        <p className="-mt-3 text-xs text-muted-foreground">
          La evidencia que subes aquí es la que ven las familias en tu perfil y en el QR de cada pedido.
        </p>

        {/* Upload actions */}
        <section>
          <div className="eyebrow">Sumar evidencia</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <UploadBtn icon={Camera} label="Foto del cultivo" onClick={() => photoInput.current?.click()} />
            <UploadBtn icon={Video} label="Video corto" onClick={() => videoInput.current?.click()} />
            <UploadBtn icon={Mic} label="Nota de voz" onClick={() => audioInput.current?.click()} />
          </div>
        </section>

        {/* Portfolio */}
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

      {/* Diálogo de metadatos: fecha + lugar por pieza */}
      <Dialog open={pending.length > 0} onOpenChange={(open) => !open && setPending([])}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="serif text-xl">
              {pending.length > 1 ? `${pending.length} piezas nuevas` : "Nueva pieza"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Anota cuándo y dónde para que viva con la evidencia.
            </p>
          </DialogHeader>

          {pending.length > 0 && (
            <div className="deslizar-x flex gap-2 pt-1">
              {pending.map((p, i) => (
                <div key={i} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.kind === "Audio" ? (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      <Mic className="h-5 w-5" />
                    </div>
                  ) : (
                    <img src={p.preview} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="eyebrow mb-1.5 block">Descripción</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej. Riego al amanecer"
              />
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : "Elegir fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    locale={es}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">Lugar</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Ej. Parcela norte · Surco 3"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setPending([])}>Cancelar</Button>
            <Button onClick={save} disabled={!date} className="bg-foreground text-background">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      <div className="space-y-1 p-2">
        <div className="text-xs leading-tight line-clamp-2">{piece.label}</div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <CalendarIcon className="h-2.5 w-2.5" />
          {format(piece.date, "d MMM", { locale: es })}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{piece.place}</span>
        </div>
      </div>
    </div>
  );
}
