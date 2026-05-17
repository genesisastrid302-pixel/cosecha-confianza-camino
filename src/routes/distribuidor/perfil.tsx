import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { ChevronRight, LogOut, Camera, X, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/distribuidor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Distribuidor — Milpa" }] }),
  component: Perfil,
});

type Merma = {
  id: string;
  cantidad: string;
  motivo: string;
  photo?: string;
  fecha: Date;
};

function Perfil() {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
  }

  return (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Tu perfil" title="Claudia R.">
      <div className="space-y-5 px-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-sm">Camioneta MTY-04 · Cámara fría</div>
          <div className="text-xs text-muted-foreground">3 productores asignados · 38 rutas este mes</div>
        </div>

        {/* Registro de merma */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="eyebrow flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> Registro de merma</div>
              <div className="serif mt-1 text-xl">{totalKg.toFixed(1)} kg este mes</div>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
            >
              {open ? "Cerrar" : "Registrar"}
            </button>
          </div>

          {open && (
            <div className="mt-4 space-y-3">
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
                      onClick={() => setPhoto(undefined)}
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-[10px] text-muted-foreground"
                  >
                    <Camera className="h-5 w-5" />
                    Subir foto
                  </button>
                )}
              </div>
              <button
                onClick={save}
                disabled={!cantidad || !motivo}
                className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                Guardar merma
              </button>
            </div>
          )}

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

        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {["Productores asignados", "Configuración de cámara fría", "Método de pago recibido", "Historial de rutas"].map((l) => (
            <button key={l} className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm">
              <span>{l}</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm text-muted-foreground">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Link>
      </div>
    </AppShell>
  );
}
