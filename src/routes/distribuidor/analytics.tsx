import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { Camera, X, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/distribuidor/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Distribuidor — Milpa" }] }),
  component: Analytics,
});

type Merma = {
  id: string;
  cantidad: string;
  motivo: string;
  photo?: string;
  fecha: Date;
};

function Analytics() {
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [registros, setRegistros] = useState<Merma[]>([
    { id: "m1", cantidad: "1.2", motivo: "Golpe en transporte", fecha: new Date(Date.now() - 86400000) },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalKg = registros.reduce((s, r) => s + (parseFloat(r.cantidad) || 0), 0);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPhoto(URL.createObjectURL(f));
    e.target.value = "";
  }

  function save() {
    if (!cantidad || !motivo) return;
    setRegistros((prev) => [
      { id: `${Date.now()}`, cantidad, motivo, photo, fecha: new Date() },
      ...prev,
    ]);
    setCantidad("");
    setMotivo("");
    setPhoto(undefined);
  }

  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Mayo · 2025" title="Rendimiento">
      <div className="space-y-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { n: "98%", l: "Entregas a tiempo", c: "text-primary" },
            { n: "2.1%", l: "Merma promedio", c: "text-primary" },
            { n: "184", l: "Familias servidas", c: "text-foreground" },
            { n: "4.7", l: "Calificación", c: "text-miel" },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-4">
              <div className={`serif text-3xl ${k.c}`}>{k.n}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="eyebrow">Merma por tramo · semana</div>
          <div className="mt-4 flex items-end gap-2 h-32">
            {[20, 32, 18, 24, 12, 28, 16].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-miel/70" style={{ height: `${h * 2}px` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            {["L","M","M","J","V","S","D"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
        </div>

        {/* Registro de merma */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <div className="eyebrow flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> Registro de merma</div>
            <span className="text-[10px] text-muted-foreground">{totalKg.toFixed(1)} kg este mes</span>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="mt-4 space-y-3"
          >
            <div>
              <label className="eyebrow mb-1 block">Cantidad perdida (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="eyebrow mb-1 block">Motivo</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={2}
                placeholder="Ej. Golpe en transporte, ruptura de cadena de frío…"
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="eyebrow mb-1 block">Foto evidencia</label>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
              {photo ? (
                <div className="relative inline-block">
                  <img src={photo} alt="Evidencia" className="h-24 w-24 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhoto(undefined)}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-[10px] text-muted-foreground"
                >
                  <Camera className="h-5 w-5" />
                  Subir foto
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!cantidad || !motivo}
              className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Guardar merma
            </button>
          </form>

          {registros.length > 0 && (
            <ul className="mt-4 divide-y divide-border border-t border-border">
              {registros.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  {r.photo ? (
                    <img src={r.photo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{r.cantidad} kg · {r.motivo}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {r.fecha.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
          <div className="eyebrow text-primary">Win de la semana</div>
          <p className="mt-2">2 entregas comunitarias en Col. Roma redujeron 18 km de ruta. ¡Sigue así!</p>
        </div>
      </div>
    </AppShell>
  );
}
