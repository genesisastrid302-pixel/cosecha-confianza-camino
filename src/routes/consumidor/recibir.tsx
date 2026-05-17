import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import santiago from "@/assets/producer-santiago.jpg";
import {
  ArrowLeft, Camera, CheckCircle2, Star, Sparkles, Thermometer, Leaf, Package, Heart, X,
  QrCode, Snowflake, CalendarDays, MapPin, Sprout, Truck, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/consumidor/recibir")({
  head: () => ({ meta: [{ title: "Confirmar entrega · Milpa" }] }),
  component: Recibir,
});

type Step = "confirm" | "scan" | "rate" | "thanks";

const aspects = [
  { id: "frescura", label: "Frescura", icon: Leaf },
  { id: "empaque", label: "Empaque", icon: Package },
  { id: "temperatura", label: "Temperatura", icon: Thermometer },
] as const;

function Recibir() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("confirm");
  const [scanned, setScanned] = useState(false);
  const [overall, setOverall] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [tipMerma, setTipMerma] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function onPhotos(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...next]);
  }

  return (
    <AppShell
      tabs={consumidorTabs}
      tone="terracota"
      eyebrow={step === "thanks" ? "Gracias" : "Confirmación de llegada"}
      title={step === "confirm" ? "¿Ya llegó?" : step === "scan" ? "Escanea tu canasta" : step === "rate" ? "¿Cómo te llegó?" : "Cerrado con cariño"}
      right={
        step !== "thanks" && (
          <Link to="/consumidor/pedidos" className="rounded-full bg-secondary p-2">
            <X className="h-4 w-4" />
          </Link>
        )
      }
    >
      <div className="space-y-6 px-5 pb-10">
        {/* Tarjeta del pedido */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex gap-3 p-3">
            <img src={santiago} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#MLP-0518</div>
              <div className="serif text-base leading-tight">De Ezequiel · Seis Tierras</div>
              <div className="text-[11px] text-muted-foreground">2 kg jitomate · 1 manojo cilantro</div>
            </div>
          </div>
        </div>

        {step === "confirm" && (
          <>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="serif text-xl leading-tight">Claudia dejó tu canasta en la puerta</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Confirma para cerrar el ciclo. Tu retroalimentación llega de regreso al campo.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => setStep("rate")}
                className="h-14 w-full rounded-2xl bg-foreground text-background text-base"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Sí, ya tengo mi canasta
              </Button>
              <Button
                variant="ghost"
                className="h-12 w-full rounded-2xl text-muted-foreground"
                onClick={() => navigate({ to: "/consumidor/pedidos" })}
              >
                Aún no llega
              </Button>
            </div>
          </>
        )}

        {step === "rate" && (
          <>
            {/* Estrellas globales */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="eyebrow">¿Cómo te llegó tu canasta?</div>
              <div className="mt-3 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setOverall(n)}
                    className="transition active:scale-90"
                    aria-label={`${n} estrellas`}
                  >
                    <Star
                      className={`h-9 w-9 ${
                        n <= overall ? "fill-miel text-miel" : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {overall === 0 && "Toca para calificar"}
                {overall === 1 && "Algo salió mal — cuéntanos"}
                {overall === 2 && "Esperabas más"}
                {overall === 3 && "Aceptable"}
                {overall === 4 && "Muy bien"}
                {overall === 5 && "Perfecto — sabor a casa"}
              </div>
            </section>

            {/* Aspectos */}
            <section>
              <div className="eyebrow">Detalle por aspecto</div>
              <div className="mt-3 space-y-3">
                {aspects.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <a.icon className="h-4 w-4 text-primary" />
                        <span className="serif text-base">{a.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setRatings((r) => ({ ...r, [a.id]: n }))}
                            aria-label={`${a.label} ${n}`}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                n <= (ratings[a.id] ?? 0)
                                  ? "fill-miel text-miel"
                                  : "text-border"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Evidencia */}
            <section>
              <div className="eyebrow">Foto al desempacar (opcional)</div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="mt-3 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-card text-[10px] text-muted-foreground"
                >
                  <Camera className="h-5 w-5 text-primary" />
                  Subir foto
                </button>
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/85"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Comentario */}
            <section className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
              <div className="eyebrow text-terracota">Nota para Ezequiel</div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Llegó fresco, el cilantro huele riquísimo…"
                className="mt-2 w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
              />
              <div className="mt-1 text-[11px] text-muted-foreground">
                Tu mensaje llega directo al productor.
              </div>
            </section>

            {/* Merma */}
            <button
              onClick={() => setTipMerma((v) => !v)}
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                tipMerma ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    tipMerma ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <div className="serif text-base leading-tight">Reportar merma</div>
                  <div className="text-[11px] text-muted-foreground">
                    ¿Algo llegó golpeado o de menos?
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-primary">{tipMerma ? "Sí" : "Agregar"}</span>
            </button>

            <Button
              disabled={overall === 0}
              onClick={() => setStep("thanks")}
              className="h-14 w-full rounded-2xl bg-foreground text-base text-background disabled:opacity-40"
            >
              Enviar al productor
            </Button>
          </>
        )}

        {step === "thanks" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-9 w-9 fill-terracota text-terracota" />
            </div>
            <div>
              <div className="serif text-2xl leading-tight">Cerraste el ciclo</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Ezequiel recibe tu nota junto con la cosecha de mañana. Así sigue la
                conversación entre tu mesa y el campo.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-left">
              <Row label="Calificación general" value={`${overall}★`} />
              {aspects.map(
                (a) =>
                  ratings[a.id] && (
                    <Row key={a.id} label={a.label} value={`${ratings[a.id]}★`} />
                  ),
              )}
              {photos.length > 0 && (
                <Row label="Evidencia" value={`${photos.length} foto${photos.length > 1 ? "s" : ""}`} />
              )}
              {tipMerma && <Row label="Merma reportada" value="Sí" />}
            </div>

            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-left">
              <div className="eyebrow text-primary">Impacto de esta canasta</div>
              <p className="serif mt-1 text-sm leading-relaxed">
                Apoyaste 98 km de cadena corta y evitaste ~1.2 kg de empaque
                industrializado. Gracias por sembrar confianza.
              </p>
            </div>

            <Link
              to="/consumidor"
              className="block h-14 rounded-2xl bg-foreground pt-4 text-base text-background"
            >
              Volver al mercado
            </Link>
          </div>
        )}

        {step === "confirm" && (
          <Link
            to="/consumidor/pedidos"
            className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Volver al seguimiento
          </Link>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="serif">{value}</span>
    </div>
  );
}
