import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { Plus, Camera, HandHeart, Sprout, CalendarDays } from "lucide-react";
import { HojaInferior } from "@/components/HojaInferior";
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

type Pestana = "actuales" | "cosecha";

export const Route = createFileRoute("/productor/cultivos")({
  validateSearch: (s: Record<string, unknown>): { tab?: Pestana } => ({ tab: s.tab === "cosecha" ? "cosecha" : undefined }),
  head: () => ({
    meta: [
      { title: "Cultivos · Productor — Milpa" },
      { name: "description", content: "Tus cultivos actuales y tus cosechas compartidas." },
      { property: "og:title", content: "Cultivos · Productor — Milpa" },
      { property: "og:description", content: "Tus cultivos actuales y tus cosechas compartidas." },
    ],
  }),
  component: Cultivos,
});

const STATUS: Record<CropStatus, { label: string; cls: string }> = {
  disponible: { label: "Disponible", cls: "bg-primary/10 text-primary" },
  agotado: { label: "Agotado", cls: "bg-secondary text-muted-foreground" },
  proximamente: { label: "Próximamente", cls: "bg-miel/15 text-miel" },
};
const seasons = ["Primavera", "Verano", "Otoño", "Invierno", "Todo el año"];
const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
const fmt = (d: string) => (d ? new Date(d + "T12:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : "—");

function Cultivos() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: "/productor/cultivos" });
  const pestana: Pestana = tab ?? "actuales";
  const [state] = useProducer();
  const [editing, setEditing] = useState<Crop | "new" | null>(null);
  const [cosecha, setCosecha] = useState<Cosecha | "new" | null>(null);
  const ir = (t: Pestana) => navigate({ search: t === "cosecha" ? { tab: "cosecha" } : {}, replace: true });

  return (
    <AppShell
      tabs={productorTabs}
      tone="milpa"
      eyebrow="Lo que siembras"
      title="Cultivos"
      right={
        <button
          onClick={() => (pestana === "cosecha" ? setCosecha("new") : setEditing("new"))}
          className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-4 text-xs text-background"
        >
          <Plus className="h-4 w-4" /> {pestana === "cosecha" ? "Publicar" : "Agregar"}
        </button>
      }
    >
      <div className="space-y-4 px-5">
        <div role="tablist" aria-label="Cultivos" className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(
            [
              { id: "actuales", label: "Cultivos actuales", n: state.crops.length },
              { id: "cosecha", label: "Cosecha compartida", n: state.cosechas.length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={pestana === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => ir(t.id)}
              className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2.5 text-[13px] transition ${
                pestana === t.id ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.label}
              <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-medium leading-4 text-primary">{t.n}</span>
            </button>
          ))}
        </div>

        <div key={pestana} role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`} className="animate-in fade-in duration-300">
          {pestana === "actuales" ? (
            <CultivosActuales crops={state.crops} onEditar={setEditing} />
          ) : (
            <CosechasCompartidas cosechas={state.cosechas} onAbrir={setCosecha} />
          )}
        </div>
      </div>

      {editing && <CropSheet crop={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {cosecha && <CosechaSheet cosecha={cosecha === "new" ? null : cosecha} crops={state.crops} onClose={() => setCosecha(null)} />}
    </AppShell>
  );
}

/** Foto del cultivo; si no carga, un brote en su lugar (nunca el ícono de imagen rota) */
function FotoCultivo({ src, alt }: { src: string; alt: string }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo)
    return (
      <span role="img" aria-label={alt} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sprout className="h-7 w-7" aria-hidden />
      </span>
    );
  return <img src={src} alt={alt} onError={() => setFallo(true)} className="h-20 w-20 shrink-0 rounded-xl object-cover" />;
}

/** Lo que hoy se puede pedir en el Mercado, se agotó o viene pronto */
function CultivosActuales({ crops, onEditar }: { crops: Crop[]; onEditar: (c: Crop | "new") => void }) {
  const [filter, setFilter] = useState<CropStatus | "todos">("todos");
  const items = crops.filter((c) => filter === "todos" || c.status === filter);
  const setStatus = (id: string, status: CropStatus, extra: Partial<Crop> = {}) =>
    updateProducer((s) => ({ ...s, crops: s.crops.map((c) => (c.id === id ? { ...c, status, ...extra } : c)) }));

  return (
    <div className="space-y-3">
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
            <FotoCultivo src={p.photo} alt={p.name} />
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
                <button onClick={() => onEditar(p)} className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">Editar</button>
                {p.status !== "agotado" && (
                  <button onClick={() => setStatus(p.id, "agotado", { kgAvailable: 0 })} className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Marcar agotado</button>
                )}
                {p.status !== "proximamente" && (
                  <button onClick={() => onEditar({ ...p, status: "proximamente" })} className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Próximamente</button>
                )}
                {p.status !== "disponible" && (
                  <button onClick={() => onEditar({ ...p, status: "disponible" })} className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Disponible</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {items.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">{crops.length === 0 ? "Aún no publicas cultivos." : "No hay cultivos en este estado."}</p>
      )}

      <button onClick={() => onEditar("new")} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground">
        <Plus className="h-4 w-4" /> Agregar cultivo
      </button>
    </div>
  );
}

/** Cosechas que las familias apartan antes de la siembra */
function CosechasCompartidas({ cosechas, onAbrir }: { cosechas: Cosecha[]; onAbrir: (c: Cosecha | "new") => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Las familias apartan su parte antes de que siembres. Así siembras con la certeza de que tu cosecha ya tiene mesa.
      </p>

      {cosechas.map((c) => {
        const ultima = c.postales[0];
        const desde = Math.min(...c.levels.map((l) => l.price).filter((n) => n > 0));
        return (
          <button
            key={c.id}
            onClick={() => onAbrir(c)}
            className="flex w-full gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-left"
          >
            {ultima ? (
              <img src={ultima.photo} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                <Sprout className="h-7 w-7" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="serif truncate text-lg leading-tight">{c.cropName}</span>
                {Number.isFinite(desde) && <span className="shrink-0 text-xs text-muted-foreground">desde ${desde}</span>}
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Cosecha {fmt(c.harvestDate)} · {c.expectedKg} kg esperados
              </span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {c.levels.map((l) => l.name).join(" · ")}
              </span>
              <span className="mt-1 block text-[11px] text-primary">
                {c.postales.length === 0 ? "Sin postales de campo aún" : c.postales.length === 1 ? "1 postal de campo" : `${c.postales.length} postales de campo`}
              </span>
            </span>
          </button>
        );
      })}

      {cosechas.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <HandHeart className="mx-auto h-7 w-7 text-primary" />
          <p className="serif mt-2 text-lg">Aún no publicas cosechas compartidas</p>
          <p className="mt-1 text-sm text-muted-foreground">Elige un cultivo, la fecha estimada y los niveles que pueden apartar las familias.</p>
        </div>
      )}

      <button
        onClick={() => onAbrir("new")}
        className="flex w-full items-center gap-3 rounded-2xl bg-primary p-4 text-left text-primary-foreground shadow-paper"
      >
        <HandHeart className="h-6 w-6 shrink-0" />
        <span>
          <span className="serif block text-lg leading-tight">Publicar cosecha compartida</span>
          <span className="block text-xs opacity-80">Las familias apartan antes de que siembres.</span>
        </span>
      </button>
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
    <HojaInferior titulo={crop ? "Editar cultivo" : "Agregar cultivo"} onClose={onClose}>
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
    </HojaInferior>
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
    <HojaInferior titulo={cosecha ? "Cosecha compartida" : "Publicar cosecha compartida"} onClose={onClose}>
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
    </HojaInferior>
  );
}
