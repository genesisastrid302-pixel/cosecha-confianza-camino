import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, ChevronDown, IdCard, Mail, Phone, Landmark, Sprout, X } from "lucide-react";
import { CerrarSesion } from "@/components/CerrarSesion";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { CobroFields, IdFoto } from "@/components/ProductorForm";
import { CambiarClave, FilaEditable as Fila, botonGuardar, campo } from "@/components/FilaEditable";
import { contactoRepetido, sesionDe } from "@/lib/acceso";
import { NuevoStamp } from "@/components/NuevoStamp";
import {
  FOTOS_MAX,
  FOTOS_MIN,
  cobroCompleto,
  cobroResumen,
  esNuevo,
  fileToDataUrl,
  listarCuentas,
  RESENAS_PARA_SCORE,
  trustScore,
  updateProducer,
  useProducer,
  type IdTipo,
  type ProducerProfile,
  type Zona,
} from "@/lib/producer-store";
import { formatScore, scoreTone } from "@/lib/score";
import { useOrders } from "@/lib/orders";

export const Route = createFileRoute("/productor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Productor — Milpa" }] }),
  component: Perfil,
});

type Seccion = "personal" | "identificacion" | "historia" | "fotos" | "cobro" | "ubicacion" | "clave" | null;
const idTipos: IdTipo[] = ["INE", "Pasaporte", "Licencia"];
const zonas: Zona[] = ["Galeana", "Allende", "Ramos Arizpe"];

function Perfil() {
  const [state] = useProducer();
  const orders = useOrders();
  const [abierta, setAbierta] = useState<Seccion>(null);
  const p = state.profile;
  const { total } = trustScore(state);
  const foto = p.photos[0];
  const familias = new Set(orders.map((o) => o.cliente)).size;

  const toggle = (s: Seccion) => setAbierta((a) => (a === s ? null : s));

  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tu perfil" title={p.name || "Productor"}>
      <div className="space-y-6 px-5">
        <div className="flex items-center gap-4 pt-3">
          <div className="relative shrink-0">
            {foto ? (
              <img src={foto} alt={p.name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary"><Sprout className="h-8 w-8 text-muted-foreground" /></span>
            )}
            {esNuevo(state) && <NuevoStamp size={44} className="absolute -left-2 -top-2" />}
          </div>
          <div>
            <div className="text-sm">{p.zona ? `${p.zona}, ${p.zona === "Ramos Arizpe" ? "Coahuila" : "Nuevo León"}` : "Ubicación sin capturar"}</div>
            <div className="text-xs text-muted-foreground">{state.crops.length} cultivos en tu catálogo</div>
            {esNuevo(state) ? (
              <div className="mt-1 inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px]">
                {state.resenas}/{RESENAS_PARA_SCORE} reseñas para tu score
              </div>
            ) : (
              <div className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] ${scoreTone(total)}`}>
                Score {formatScore(total)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat n={String(state.crops.length)} l="Cultivos" />
          <Stat n={String(orders.length)} l="Pedidos" />
          <Stat n={String(familias)} l="Familias" />
        </div>

        <section>
          <div className="eyebrow">Cuenta</div>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Fila
              label="Información personal"
              detail={p.correo || "Falta correo"}
              warn={!p.correo || !p.telefono}
              open={abierta === "personal"}
              onClick={() => toggle("personal")}
            >
              <EditarPersonal p={p} onDone={() => setAbierta(null)} />
            </Fila>
            <Fila
              label="Identificación oficial"
              detail={p.idTipo ? `${p.idTipo} · ${p.idEstado === "verificada" ? "Verificada" : "En revisión"}` : "Sin subir"}
              warn={!p.idTipo}
              open={abierta === "identificacion"}
              onClick={() => toggle("identificacion")}
            >
              <EditarIdentificacion p={p} onDone={() => setAbierta(null)} />
            </Fila>
            <Fila
              label="Historia de tu rancho"
              detail={p.story.trim() || "Sin escribir"}
              warn={p.story.trim().length < 40}
              open={abierta === "historia"}
              onClick={() => toggle("historia")}
            >
              <EditarHistoria p={p} onDone={() => setAbierta(null)} />
            </Fila>
            <Fila
              label="Fotos del campo"
              detail={`${p.photos.length} ${p.photos.length === 1 ? "foto" : "fotos"}`}
              warn={p.photos.length < FOTOS_MIN}
              open={abierta === "fotos"}
              onClick={() => toggle("fotos")}
            >
              <EditarFotos p={p} />
            </Fila>
            <Fila
              label="Cuenta para recibir pagos"
              detail={cobroResumen(p)}
              warn={!cobroCompleto(p)}
              open={abierta === "cobro"}
              onClick={() => toggle("cobro")}
            >
              <EditarCobro p={p} onDone={() => setAbierta(null)} />
            </Fila>
            <Fila
              label="Ubicación de la parcela"
              detail={p.zona || "Sin capturar"}
              warn={!p.zona}
              open={abierta === "ubicacion"}
              onClick={() => toggle("ubicacion")}
            >
              <div className="flex gap-2">
                {zonas.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => {
                      updateProducer((s) => ({ ...s, profile: { ...s.profile, zona: z } }));
                      setAbierta(null);
                    }}
                    className={`flex-1 rounded-xl border py-2.5 text-xs ${p.zona === z ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </Fila>
            <Fila label="Contraseña" detail="Cambiar" open={abierta === "clave"} onClick={() => toggle("clave")}>
              <CambiarClave rol="productor" onDone={() => setAbierta(null)} />
            </Fila>
          </div>
        </section>

        <section>
          <div className="eyebrow">Negocio</div>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <LinkFila to="/productor/finanzas" label="Finanzas" detail="Ventas, aportación y pagos" />
            <LinkFila to="/productor/transparencia" label="Transparencia" detail="Evidencia de tu cultivo" />
            <LinkFila to="/productor/catalogo" label="Catálogo" detail={`${state.crops.length} cultivos · ${state.cosechas.length} cosechas compartidas`} />
          </div>
        </section>

        <CerrarSesion rol="productor" />
      </div>
    </AppShell>
  );
}

function EditarPersonal({ p, onDone }: { p: ProducerProfile; onDone: () => void }) {
  const [d, setD] = useState({ name: p.name, correo: p.correo, telefono: p.telefono });
  const [error, setError] = useState("");
  const input = "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-foreground focus:outline-none";
  return (
    <form
      className="space-y-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(d.correo)) return setError("Revisa el correo.");
        if (!/^\d{10}$/.test(d.telefono)) return setError("El teléfono debe tener 10 dígitos.");
        const correo = d.correo.trim().toLowerCase();
        const otras = listarCuentas().filter((c) => c.id !== sesionDe("productor")).map((c) => c.state.profile);
        const repetido = contactoRepetido(otras, { correo, telefono: d.telefono });
        if (repetido) return setError(repetido.replace(" Inicia sesión.", ""));
        updateProducer((s) => ({ ...s, profile: { ...s.profile, ...d, correo, name: d.name.trim() } }));
        onDone();
      }}
    >
      <label className="block text-xs text-muted-foreground">
        Nombre
        <input required value={d.name} maxLength={100} onChange={(e) => setD({ ...d, name: e.target.value })} className={input} />
      </label>
      <label className="block text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Correo</span>
        <input type="email" value={d.correo} maxLength={255} onChange={(e) => setD({ ...d, correo: e.target.value })} className={input} />
      </label>
      <label className="block text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</span>
        <input inputMode="numeric" maxLength={10} value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value.replace(/\D/g, "") })} className={input} />
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button className="w-full rounded-full bg-foreground py-2.5 text-sm text-background">Guardar</button>
    </form>
  );
}

function EditarCobro({ p, onDone }: { p: ProducerProfile; onDone: () => void }) {
  const [d, setD] = useState(p);
  const ok = cobroCompleto(d);
  return (
    <div className="space-y-3">
      <CobroFields p={d} onChange={setD} />
      <button
        type="button"
        disabled={!ok}
        onClick={() => {
          updateProducer((s) => ({ ...s, profile: { ...s.profile, pagos: d.pagos, clabe: d.clabe, banco: d.banco, titular: d.titular, codi: d.codi } }));
          onDone();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-2.5 text-sm text-background disabled:bg-secondary disabled:text-muted-foreground"
      >
        <Landmark className="h-4 w-4" /> Guardar cuenta
      </button>
    </div>
  );
}

function EditarIdentificacion({ p, onDone }: { p: ProducerProfile; onDone: () => void }) {
  const [tipo, setTipo] = useState<IdTipo | "">(p.idTipo);
  // Las fotos solo viven en esta pantalla: se guarda el tipo y que quedó en revisión
  const [frente, setFrente] = useState("");
  const [reverso, setReverso] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        {idTipos.map((t) => (
          <button
            type="button"
            key={t}
            aria-pressed={tipo === t}
            onClick={() => { setTipo(t); setError(""); }}
            className={`rounded-xl border py-2.5 text-xs ${tipo === t ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tipo && (
        <div className={`grid gap-2 ${tipo === "Pasaporte" ? "grid-cols-1" : "grid-cols-2"}`}>
          <IdFoto label={tipo === "Pasaporte" ? "Página con tu foto" : "Frente"} src={frente} onChange={setFrente} />
          {tipo !== "Pasaporte" && <IdFoto label="Reverso" src={reverso} onChange={setReverso} />}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">Al cambiarla vuelve a quedar en revisión. Las fotos no se guardan en este dispositivo.</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="button"
        onClick={() => {
          if (!tipo) return setError("Elige qué identificación vas a subir.");
          if (!frente) return setError("Sube la foto del frente de tu identificación.");
          if (tipo !== "Pasaporte" && !reverso) return setError("Sube la foto del reverso de tu identificación.");
          updateProducer((s) => ({ ...s, profile: { ...s.profile, idTipo: tipo, idEstado: "en_revision" } }));
          onDone();
        }}
        className={botonGuardar}
      >
        <IdCard className="h-4 w-4" /> Enviar a revisión
      </button>
    </div>
  );
}

function EditarHistoria({ p, onDone }: { p: ProducerProfile; onDone: () => void }) {
  const [story, setStory] = useState(p.story);
  return (
    <div className="space-y-2.5">
      <textarea rows={5} maxLength={800} value={story} onChange={(e) => setStory(e.target.value)} className={campo} placeholder="¿Desde cuándo siembras? ¿Qué cultivas y cómo?" />
      <p className={`text-[11px] ${story.trim().length >= 40 ? "text-muted-foreground" : "text-terracota"}`}>
        {story.trim().length >= 40 ? "Es lo que leen las familias en tu perfil." : `Cuenta un poco más: llevas ${story.trim().length} de 40 caracteres.`}
      </p>
      <button
        type="button"
        onClick={() => {
          updateProducer((s) => ({ ...s, profile: { ...s.profile, story: story.trim() } }));
          onDone();
        }}
        className={botonGuardar}
      >
        Guardar
      </button>
    </div>
  );
}

/** Las fotos se guardan al agregarlas o quitarlas */
function EditarFotos({ p }: { p: ProducerProfile }) {
  const guardar = (photos: string[]) => updateProducer((s) => ({ ...s, profile: { ...s.profile, photos } }));
  async function agregar(files: FileList | null) {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).slice(0, FOTOS_MAX - p.photos.length).map((f) => fileToDataUrl(f)));
    guardar([...p.photos, ...urls]);
  }
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Mínimo {FOTOS_MIN}, máximo {FOTOS_MAX}. La primera es tu foto de perfil.</span>
        <span className={p.photos.length >= FOTOS_MIN ? "text-primary" : "text-terracota"}>{p.photos.length}/{FOTOS_MAX}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {p.photos.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button type="button" aria-label="Quitar foto" onClick={() => guardar(p.photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-background/80 p-1">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {p.photos.length < FOTOS_MAX && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-[11px] text-muted-foreground">
            <Camera className="h-5 w-5" /> Agregar
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => agregar(e.target.files)} />
          </label>
        )}
      </div>
    </div>
  );
}

function LinkFila({ to, label, detail }: { to: "/productor/finanzas" | "/productor/transparencia" | "/productor/catalogo"; label: string; detail: string }) {
  return (
    <Link to={to} className="flex w-full items-center justify-between px-4 py-3.5 text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {detail}
        <ChevronDown className="h-4 w-4 -rotate-90" />
      </span>
    </Link>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="serif text-2xl">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
    </div>
  );
}
