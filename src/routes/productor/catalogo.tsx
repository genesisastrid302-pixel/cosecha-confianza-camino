import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Plus, Camera, X, HandHeart, Sprout } from "lucide-react";
import {
  fileToDataUrl,
  newId,
  updateProducer,
  useProducer,
  type Cosecha,
  type CosechaLevel,
  type Crop,
  type CropStatus,
} from "@/lib/producer-store";

export const Route = createFileRoute("/productor/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo · Productor — Milpa" },
      { name: "description", content: "Publica tus cultivos, su disponibilidad y tus cosechas compartidas." },
      { property: "og:title", content: "Catálogo · Productor — Milpa" },
      { property: "og:description", content: "Publica tus cultivos, su disponibilidad y tus cosechas compartidas." },
    ],
  }),
  component: Catalogo,
});

const STATUS: Record<CropStatus, { label: string; cls: string }> = {
  disponible: { label: "Disponible", cls: "bg-primary/10 text-primary" },
  agotado: { label: "Agotado", cls: "bg-secondary text-muted-foreground" },
  proximamente: { label: "Próximamente", cls: "bg-miel/15 text-miel" },
};
const seasons = ["Primavera", "Verano", "Otoño", "Invierno", "Todo el año"];
const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
const fmt = (d: string) => (d ? new Date(d + "T12:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : "—");

function Catalogo() {
  const [state] = useProducer();
  const [editing, setEditing] = useState<Crop | "new" | null>(null);
  const [cosecha, setCosecha] = useState<Cosecha | "new" | null>(null);
  const [filter, setFilter] = useState<CropStatus | "todos">("todos");
  const items = state.crops.filter((c) => filter === "todos" || c.status === filter);

  const setStatus = (id: string, status: CropStatus, extra: Partial<Crop> = {}) =>
    updateProducer((s) => ({ ...s, crops: s.crops.map((c) => (c.id === id ? { ...c, status, ...extra } : c)) }));

  return (
    <AppShell
      tabs={productorTabs}
      tone="milpa"
      eyebrow="Tu catálogo"
      title="Cultivos publicados"
      right={
        <button onClick={() => setEditing("new")} className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-4 text-xs text-background">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      }
    >
      <div className="space-y-3 px-5">
        <button
          onClick={() => setCosecha("new")}
          className="flex w-full items-center gap-3 rounded-2xl bg-primary p-4 text-left text-primary-foreground shadow-paper"
        >
          <HandHeart className="h-6 w-6 shrink-0" />
          <div>
            <div className="serif text-lg leading-tight">Publicar cosecha compartida</div>
            <div className="text-xs opacity-80">Las familias apartan antes de que siembres.</div>
          </div>
        </button>

        {state.cosechas.map((c) => (
          <button key={c.id} onClick={() => setCosecha(c)} className="block w-full rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left">
            <div className="flex items-baseline justify-between">
              <span className="serif text-lg">{c.cropName}</span>
              <span className="text-xs text-muted-foreground">Cosecha {fmt(c.harvestDate)}</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {c.expectedKg} kg esperados · {c.levels.length} niveles · {c.postales.length} postales de campo
            </div>
          </button>
        ))}

        <div className="deslizar-x flex gap-2 text-xs">
          {(["todos", "disponible", "proximamente", "agotado"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 ${filter === t ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}
            >
              {t === "todos" ? "Todos" : STATUS[t].label}
            </button>
          ))}
        </div>

        {items.map((p) => {
          const demand = p.kgEstimated > 0 ? Math.round(((p.kgEstimated - p.kgAvailable) / p.kgEstimated) * 100) : 0;
          return (
            <div key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
              <img src={p.photo} alt={p.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="serif truncate text-lg leading-tight">{p.name}</h3>
                  <div className="serif text-base">${p.pricePerKg}<span className="text-[11px] text-muted-foreground">/kg</span></div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={`rounded-full px-2 py-0.5 ${STATUS[p.status].cls}`}>
                    {STATUS[p.status].label}{p.status === "proximamente" ? ` · ${fmt(p.harvestDate)}` : ""}
                  </span>
                  <span>{p.kgAvailable} kg disp.</span>
                  <span>· {p.season}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">Demanda: {demand}% de {p.kgEstimated} kg estimados</div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <button onClick={() => setEditing(p)} className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">Editar</button>
                  {p.status !== "agotado" && (
                    <button onClick={() => setStatus(p.id, "agotado", { kgAvailable: 0 })} className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Marcar agotado</button>
                  )}
                  {p.status !== "proximamente" && (
                    <button onClick={() => setEditing({ ...p, status: "proximamente" })} className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Próximamente</button>
                  )}
                  {p.status !== "disponible" && (
                    <button onClick={() => setEditing({ ...p, status: "disponible" })} className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Disponible</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No hay cultivos en este estado.</p>}

        <button onClick={() => setEditing("new")} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground">
          <Plus className="h-4 w-4" /> Agregar cultivo
        </button>
      </div>

      {editing && <CropSheet crop={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {cosecha && <CosechaSheet cosecha={cosecha === "new" ? null : cosecha} crops={state.crops} onClose={() => setCosecha(null)} />}
    </AppShell>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-foreground/40" onClick={onClose}>
      <div className="max-h-[90%] w-full overflow-y-auto rounded-t-3xl bg-background px-5 pb-8 pt-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="display text-2xl">{title}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PhotoPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="mt-1.5 flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground">
      {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="flex items-center gap-2"><Camera className="h-5 w-5" /> Subir foto</span>}
      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onChange(await fileToDataUrl(f)); }} />
    </label>
  );
}

function CropSheet({ crop, onClose }: { crop: Crop | null; onClose: () => void }) {
  const [c, setC] = useState<Crop>(
    crop ?? { id: newId(), name: "", photo: "", pricePerKg: 0, kgEstimated: 0, kgAvailable: 0, harvestDate: "", season: "Primavera", status: "proximamente" },
  );
  const [error, setError] = useState("");
  const num = (v: string) => Math.max(0, Number(v) || 0);

  return (
    <Sheet title={crop ? "Editar cultivo" : "Agregar cultivo"} onClose={onClose}>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!c.name.trim()) return setError("Escribe el nombre del cultivo.");
          if (!c.photo) return setError("Sube una foto del cultivo.");
          if (c.pricePerKg <= 0) return setError("El precio por kg debe ser mayor a 0.");
          if (c.kgEstimated <= 0) return setError("Indica los kg estimados para esta cosecha.");
          if (c.kgAvailable > c.kgEstimated) return setError("Los kg disponibles no pueden ser más que los estimados.");
          if (c.status === "proximamente" && !c.harvestDate) return setError("Indica la fecha estimada de cosecha.");
          const next = { ...c, name: c.name.trim(), status: c.kgAvailable === 0 && c.status === "disponible" ? "agotado" : c.status } as Crop;
          updateProducer((s) => ({ ...s, crops: crop ? s.crops.map((x) => (x.id === c.id ? next : x)) : [next, ...s.crops] }));
          onClose();
        }}
      >
        <label className="block"><span className="text-xs text-muted-foreground">Nombre del cultivo</span>
          <input maxLength={60} value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} className={input} placeholder="Jitomate criollo" /></label>
        <div><span className="text-xs text-muted-foreground">Foto</span><PhotoPicker value={c.photo} onChange={(photo) => setC({ ...c, photo })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs text-muted-foreground">Precio por kg ($)</span>
            <input type="number" min={0} inputMode="decimal" value={c.pricePerKg || ""} onChange={(e) => setC({ ...c, pricePerKg: num(e.target.value) })} className={input} /></label>
          <label className="block"><span className="text-xs text-muted-foreground">Fecha estimada de cosecha</span>
            <input type="date" value={c.harvestDate} onChange={(e) => setC({ ...c, harvestDate: e.target.value })} className={input} /></label>
        </div>
        <label className="block rounded-xl border-2 border-primary/40 bg-primary/5 p-3">
          <span className="text-xs font-medium text-primary">Kg estimados para esta cosecha</span>
          <input type="number" min={0} inputMode="numeric" value={c.kgEstimated || ""} onChange={(e) => setC({ ...c, kgEstimated: num(e.target.value) })} className={input} placeholder="Ej. 120" />
          <span className="mt-1.5 block text-[11px] text-muted-foreground">Con este dato calculamos qué porcentaje de tu cosecha ya está pedido.</span>
        </label>
        <label className="block"><span className="text-xs text-muted-foreground">Kg disponibles ahora</span>
          <input type="number" min={0} value={c.kgAvailable || ""} onChange={(e) => setC({ ...c, kgAvailable: num(e.target.value) })} className={input} /></label>
        <label className="block"><span className="text-xs text-muted-foreground">Temporada</span>
          <select value={c.season} onChange={(e) => setC({ ...c, season: e.target.value })} className={input}>
            {[...new Set([c.season, ...seasons])].map((s) => <option key={s}>{s}</option>)}
          </select></label>
        <div><span className="text-xs text-muted-foreground">Estado</span>
          <div className="mt-1.5 flex gap-2">
            {(Object.keys(STATUS) as CropStatus[]).map((s) => (
              <button type="button" key={s} onClick={() => setC({ ...c, status: s })} className={`flex-1 rounded-xl border py-2.5 text-xs ${c.status === s ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}>{STATUS[s].label}</button>
            ))}
          </div></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          {crop && (
            <button type="button" onClick={() => { updateProducer((s) => ({ ...s, crops: s.crops.filter((x) => x.id !== c.id) })); onClose(); }} className="rounded-full border border-border px-5 text-sm text-muted-foreground">Quitar</button>
          )}
          <button type="submit" className="flex-1 rounded-full bg-foreground py-4 text-sm font-medium text-background">{crop ? "Guardar cambios" : "Publicar cultivo"}</button>
        </div>
      </form>
    </Sheet>
  );
}

function CosechaSheet({ cosecha, crops, onClose }: { cosecha: Cosecha | null; crops: Crop[]; onClose: () => void }) {
  const [c, setC] = useState<Cosecha>(
    cosecha ?? {
      id: newId(), cropName: crops[0]?.name ?? "", harvestDate: "", expectedKg: 0,
      levels: [{ name: "Probadita", kg: 2, price: 0 }, { name: "Familiar", kg: 5, price: 0 }, { name: "Comunidad", kg: 10, price: 0 }],
      postales: [],
      creadaEn: new Date().toISOString(),
    },
  );
  const [postal, setPostal] = useState({ photo: "", text: "" });
  const [error, setError] = useState("");
  const setLevel = (i: number, patch: Partial<CosechaLevel>) => setC({ ...c, levels: c.levels.map((l, j) => (j === i ? { ...l, ...patch } : l)) });

  const save = (next: Cosecha) =>
    updateProducer((s) => ({ ...s, cosechas: s.cosechas.some((x) => x.id === next.id) ? s.cosechas.map((x) => (x.id === next.id ? next : x)) : [next, ...s.cosechas] }));

  return (
    <Sheet title={cosecha ? "Cosecha compartida" : "Publicar cosecha compartida"} onClose={onClose}>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!c.cropName.trim()) return setError("Escribe qué vas a cosechar.");
          if (!c.harvestDate) return setError("Indica la fecha estimada de cosecha.");
          if (c.expectedKg <= 0) return setError("Indica los kg esperados.");
          if (c.levels.some((l) => l.price <= 0 || l.kg <= 0)) return setError("Cada nivel necesita kg y precio.");
          save(c);
          onClose();
        }}
      >
        <label className="block"><span className="text-xs text-muted-foreground">Cultivo</span>
          <input list="crops" maxLength={60} value={c.cropName} onChange={(e) => setC({ ...c, cropName: e.target.value })} className={input} />
          <datalist id="crops">{crops.map((x) => <option key={x.id} value={x.name} />)}</datalist></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs text-muted-foreground">Fecha estimada</span>
            <input type="date" value={c.harvestDate} onChange={(e) => setC({ ...c, harvestDate: e.target.value })} className={input} /></label>
          <label className="block"><span className="text-xs text-muted-foreground">Kg esperados</span>
            <input type="number" min={0} value={c.expectedKg || ""} onChange={(e) => setC({ ...c, expectedKg: Math.max(0, Number(e.target.value) || 0) })} className={input} /></label>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Precio por nivel</span>
          <div className="mt-1.5 space-y-2">
            {c.levels.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_70px_90px] items-center gap-2">
                <input value={l.name} maxLength={30} onChange={(e) => setLevel(i, { name: e.target.value })} className="rounded-xl border border-input bg-card px-3 py-2.5 text-sm" />
                <input type="number" min={0} value={l.kg || ""} onChange={(e) => setLevel(i, { kg: Number(e.target.value) || 0 })} className="rounded-xl border border-input bg-card px-3 py-2.5 text-sm" placeholder="kg" />
                <input type="number" min={0} value={l.price || ""} onChange={(e) => setLevel(i, { price: Number(e.target.value) || 0 })} className="rounded-xl border border-input bg-card px-3 py-2.5 text-sm" placeholder="$" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2"><Sprout className="h-4 w-4 text-primary" /><span className="eyebrow">Postales de campo</span></div>
          <p className="mt-1 text-[11px] text-muted-foreground">Cuéntales a las familias cómo va creciendo su cosecha.</p>
          <div className="mt-3 space-y-3">
            {c.postales.map((p) => (
              <div key={p.id} className="flex gap-3">
                <img src={p.photo} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="text-xs"><div className="text-muted-foreground">{fmt(p.date)}</div>{p.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-3"><PhotoPicker value={postal.photo} onChange={(photo) => setPostal({ ...postal, photo })} /></div>
          <textarea rows={2} maxLength={280} value={postal.text} onChange={(e) => setPostal({ ...postal, text: e.target.value })} className={input} placeholder="Ya salieron las primeras flores…" />
          <button
            type="button"
            disabled={!postal.photo || !postal.text.trim()}
            onClick={() => {
              const next = { ...c, postales: [{ id: newId(), date: new Date().toISOString().slice(0, 10), photo: postal.photo, text: postal.text.trim() }, ...c.postales] };
              setC(next);
              if (cosecha) save(next);
              setPostal({ photo: "", text: "" });
            }}
            className="mt-2 w-full rounded-full bg-primary/10 py-2.5 text-sm text-primary disabled:opacity-50"
          >
            Agregar postal
          </button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-foreground py-4 text-sm font-medium text-background">{cosecha ? "Guardar" : "Publicar cosecha compartida"}</button>
      </form>
    </Sheet>
  );
}
