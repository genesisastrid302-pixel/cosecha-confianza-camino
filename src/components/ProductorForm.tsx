import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Camera, X, CheckCircle2, Circle } from "lucide-react";
import {
  fileToDataUrl,
  profileCompleteness,
  readProducer,
  writeProducer,
  type Pago,
  type ProducerProfile,
  type Zona,
} from "@/lib/producer-store";

const zonas: Zona[] = ["Galeana", "Allende", "Ramos Arizpe"];
const pagos: Pago[] = ["CLABE", "CoDi", "Efectivo"];

export function ProductorForm({ onBack }: { onBack: () => void }) {
  const [p, setP] = useState<ProducerProfile>({ name: "", story: "", zona: "", pago: "", clabe: "", photos: [] });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setP({ ...readProducer().profile, name: "", story: "", photos: [] }), []);

  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
  const pill = (on: boolean) => `flex-1 rounded-xl border py-3 text-sm ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;
  const { pct, checks } = profileCompleteness(p);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).slice(0, 6 - p.photos.length).map((f) => fileToDataUrl(f)));
    setP((s) => ({ ...s, photos: [...s.photos, ...urls] }));
  }

  if (done) {
    return (
      <div className="flex min-h-full flex-col px-5 pb-8 pt-5">
        <span className="eyebrow mt-10">Paso 3 de 3</span>
        <h1 className="display mt-2 text-3xl">Bienvenido, {p.name.split(" ")[0]}.</h1>
        <p className="mt-3 text-sm text-muted-foreground">Tu perfil es la primera razón por la que una familia confía en ti.</p>
        <CompletenessCard pct={pct} checks={checks} />
        <Link to="/productor" className="mt-auto block w-full rounded-full bg-foreground py-4 text-center text-sm font-medium text-background">
          Ir a mi inicio
        </Link>
      </div>
    );
  }

  return (
    <form
      className="flex min-h-full flex-col px-5 pb-8 pt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (p.pago === "CLABE" && !/^\d{18}$/.test(p.clabe)) return setError("La CLABE debe tener 18 dígitos.");
        setError("");
        const s = readProducer();
        writeProducer({ ...s, profile: { ...p, name: p.name.trim(), story: p.story.trim() } });
        setDone(true);
      }}
    >
      <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="eyebrow mt-6">Paso 2 de 3</span>
      <h1 className="display mt-2 text-3xl">Cuéntanos de tu campo</h1>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs text-muted-foreground">Nombre</span>
          <input required maxLength={100} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className={input} placeholder="Ezequiel Martínez" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Historia de tu rancho</span>
          <textarea rows={4} maxLength={800} value={p.story} onChange={(e) => setP({ ...p, story: e.target.value })} className={input} placeholder="¿Desde cuándo siembras? ¿Quién trabaja contigo? ¿Cómo cuidas la tierra?" />
        </label>
        <div>
          <span className="text-xs text-muted-foreground">Ubicación del campo</span>
          <div className="mt-1.5 flex gap-2">
            {zonas.map((z) => (
              <button type="button" key={z} className={pill(p.zona === z)} onClick={() => setP({ ...p, zona: z })}>{z}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">¿Cómo quieres recibir tus pagos?</span>
          <div className="mt-1.5 flex gap-2">
            {pagos.map((m) => (
              <button type="button" key={m} className={pill(p.pago === m)} onClick={() => setP({ ...p, pago: m })}>{m}</button>
            ))}
          </div>
          {p.pago === "CLABE" && (
            <input inputMode="numeric" maxLength={18} value={p.clabe} onChange={(e) => setP({ ...p, clabe: e.target.value.replace(/\D/g, "") })} className={input} placeholder="18 dígitos" />
          )}
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Fotos de tu campo</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {p.photos.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setP({ ...p, photos: p.photos.filter((_, j) => j !== i) })} className="absolute right-1 top-1 rounded-full bg-background/80 p-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {p.photos.length < 6 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-[11px] text-muted-foreground">
                <Camera className="h-5 w-5" /> Agregar
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
              </label>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <button type="submit" className="mt-8 w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">
        Crear mi cuenta
      </button>
    </form>
  );
}

export function CompletenessCard({ pct, checks }: { pct: number; checks: { label: string; ok: boolean }[] }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Perfil completo</span>
        <span className="serif text-2xl">{pct}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Tu perfil vale el 30% de tu Score de confianza.</p>
      <ul className="mt-3 space-y-1.5 text-xs">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-2 ${c.ok ? "text-foreground" : "text-muted-foreground"}`}>
            {c.ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
