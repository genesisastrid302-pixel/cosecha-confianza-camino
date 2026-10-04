import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Camera, X, CheckCircle2, Circle } from "lucide-react";
import { Handshake, IdCard, ShieldCheck } from "lucide-react";
import {
  APORTACION_SOCIO,
  FOTOS_MAX,
  FOTOS_MIN,
  cobroFaltantes,
  cobroResumen,
  tipoCuenta,
  EMPTY_PROFILE,
  fileToDataUrl,
  profileCompleteness,
  registrarProductor,
  type IdTipo,
  type Pago,
  type ProducerProfile,
  type Zona,
} from "@/lib/producer-store";

const zonas: Zona[] = ["Galeana", "Allende", "Ramos Arizpe"];
const pagos: Pago[] = ["CLABE", "CoDi", "Efectivo"];
const idTipos: IdTipo[] = ["INE", "Pasaporte", "Licencia"];

export function ProductorForm({ onBack }: { onBack: () => void }) {
  const [p, setP] = useState<ProducerProfile>(EMPTY_PROFILE);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  // Las fotos de la identificación solo viven en esta pantalla; no se guardan en el navegador
  const [idFrente, setIdFrente] = useState("");
  const [idReverso, setIdReverso] = useState("");
  useEffect(() => setP(EMPTY_PROFILE), []);

  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
  const pill = (on: boolean) => `flex-1 rounded-xl border py-3 text-sm ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;
  const { pct, checks } = profileCompleteness(p);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).slice(0, FOTOS_MAX - p.photos.length).map((f) => fileToDataUrl(f)));
    setP((s) => ({ ...s, photos: [...s.photos, ...urls] }));
  }

  if (done) {
    return (
      <div className="flex min-h-full flex-col px-5 pb-8 pt-5">
        <span className="eyebrow mt-10">Paso 3 de 3</span>
        <h1 className="display mt-2 text-3xl">Bienvenido, {p.name.split(" ")[0]}.</h1>
        <p className="mt-3 text-sm text-muted-foreground">Ya eres socio de Milpa. Tu perfil es la primera razón por la que una familia confía en ti.</p>
        <div className="mt-6 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Recibes tus pagos en</span><span className="text-right">{cobroResumen(p)}</span></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Tu aportación como socio</span><span>{APORTACION_SOCIO}% por venta</span></div>
        </div>
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
        if (!/^\d{10}$/.test(p.telefono)) return setError("El teléfono debe tener 10 dígitos.");
        if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
        if (password !== password2) return setError("Las contraseñas no coinciden.");
        if (!p.idTipo) return setError("Elige qué identificación vas a subir.");
        if (!idFrente) return setError("Sube la foto del frente de tu identificación.");
        if (p.idTipo !== "Pasaporte" && !idReverso) return setError("Sube la foto del reverso de tu identificación.");
        const faltan = cobroFaltantes(p);
        if (faltan.length > 0) return setError(faltan[0]);
        if (p.photos.length < FOTOS_MIN) return setError(`Como productor nuevo, sube al menos ${FOTOS_MIN} fotos de tu campo.`);
        if (!p.socio) return setError("Para vender en Milpa necesitas aceptar el acuerdo de socio.");
        setError("");
        // Cuenta nueva: sin reseñas, el score se genera con el feedback de los consumidores.
        // Las cuentas que ya existían en este dispositivo se conservan.
        registrarProductor({ ...p, name: p.name.trim(), story: p.story.trim(), idEstado: "en_revision" });
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
          <input required maxLength={100} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className={input} placeholder="Agregar nombre" />
        </label>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Identificación oficial</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Para confirmar que eres tú. El nombre debe ser el mismo que escribiste arriba.
          </p>
          <div className="mt-3 flex gap-2">
            {idTipos.map((t) => (
              <button type="button" key={t} aria-pressed={p.idTipo === t} className={pill(p.idTipo === t)} onClick={() => setP({ ...p, idTipo: t })}>{t}</button>
            ))}
          </div>
          {p.idTipo && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <IdFoto label={p.idTipo === "Pasaporte" ? "Página con tu foto" : "Frente"} src={idFrente} onChange={setIdFrente} />
              {p.idTipo !== "Pasaporte" && <IdFoto label="Reverso" src={idReverso} onChange={setIdReverso} />}
            </div>
          )}
          <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Solo la usa Milpa para verificar tu cuenta. No se muestra a consumidores ni distribuidores.
          </p>
        </div>
        <label className="block">
          <span className="text-xs text-muted-foreground">Correo</span>
          <input required type="email" maxLength={255} value={p.correo} onChange={(e) => setP({ ...p, correo: e.target.value })} className={input} placeholder="correo@ejemplo.com" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Teléfono celular</span>
          <input required inputMode="numeric" maxLength={10} value={p.telefono} onChange={(e) => setP({ ...p, telefono: e.target.value.replace(/\D/g, "") })} className={input} placeholder="81 1234 5678" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-muted-foreground">Contraseña</span>
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="8+ caracteres" autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Repetir</span>
            <input required type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className={input} autoComplete="new-password" />
          </label>
        </div>
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
        <CobroFields p={p} onChange={setP} />
        <SocioCard checked={p.socio} onChange={(socio) => setP({ ...p, socio })} />
        <div>
          <span className="flex justify-between text-xs text-muted-foreground">
            <span>Fotos de tu campo · mínimo {FOTOS_MIN}</span>
            <span className={p.photos.length >= FOTOS_MIN ? "text-primary" : ""}>{p.photos.length}/{FOTOS_MAX}</span>
          </span>
          <p className="mt-1 text-[11px] text-muted-foreground">Como eres nuevo, las familias aún no te conocen: tus fotos son tu carta de presentación mientras juntas tus primeras reseñas.</p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {p.photos.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setP({ ...p, photos: p.photos.filter((_, j) => j !== i) })} className="absolute right-1 top-1 rounded-full bg-background/80 p-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {p.photos.length < FOTOS_MAX && (
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

/** Foto de un lado de la identificación (vista previa solo en esta pantalla) */
function IdFoto({ label, src, onChange }: { label: string; src: string; onChange: (v: string) => void }) {
  return (
    <label className="relative flex aspect-[8/5] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-border text-[11px] text-muted-foreground">
      {src ? (
        <>
          <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute bottom-1 left-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] text-foreground">{label} · cambiar</span>
        </>
      ) : (
        <>
          <Camera className="h-5 w-5" />
          {label}
        </>
      )}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        aria-label={`Foto de identificación: ${label}`}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await fileToDataUrl(f, 600));
        }}
      />
    </label>
  );
}

/** Aviso bajo un campo: en verde cuando está completo, en rojo con lo que falta */
function Estado({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <p className={`mt-1 text-[11px] ${ok ? "text-primary" : "text-terracota"}`}>{ok ? "✓ " : ""}{children}</p>;
}

/** Datos para recibir pagos; puede elegir varios métodos y cada uno pide sus datos */
export function CobroFields({ p, onChange }: { p: ProducerProfile; onChange: (p: ProducerProfile) => void }) {
  const input = "mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none";
  const pill = (on: boolean) => `flex-1 rounded-xl border py-3 text-sm ${on ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`;
  const toggle = (m: Pago) => {
    if (p.pagos.includes(m)) return onChange({ ...p, pagos: p.pagos.filter((x) => x !== m) });
    // Al activar un método se proponen los datos que ya escribió arriba
    const next = { ...p, pagos: [...p.pagos, m] };
    if (m === "CoDi" && !p.codi && /^\d{10}$/.test(p.telefono)) next.codi = p.telefono;
    if (m === "CLABE" && !p.titular && p.name.trim()) next.titular = p.name.trim();
    onChange(next);
  };
  const cuenta = tipoCuenta(p.clabe);
  return (
    <div>
      <span className="text-xs text-muted-foreground">¿Cómo quieres recibir tus pagos? Puedes elegir varias</span>
      <div className="mt-1.5 flex gap-2">
        {pagos.map((m) => (
          <button type="button" key={m} aria-pressed={p.pagos.includes(m)} className={pill(p.pagos.includes(m))} onClick={() => toggle(m)}>{m}</button>
        ))}
      </div>
      {p.pagos.includes("CLABE") && (
        <div className="mt-3 rounded-xl border border-border p-3">
          <div className="text-xs font-medium">Transferencia</div>
          <input inputMode="numeric" maxLength={18} value={p.clabe} onChange={(e) => onChange({ ...p, clabe: e.target.value.replace(/\D/g, "").slice(0, 18) })} className={input} placeholder="CLABE (18 dígitos) o tarjeta (16)" aria-label="CLABE" />
          <Estado ok={!!cuenta}>
            {cuenta ? `${cuenta} completa` : `Llevas ${p.clabe.length} dígitos: la CLABE lleva 18 y la tarjeta de débito 16`}
          </Estado>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <input maxLength={40} value={p.banco} onChange={(e) => onChange({ ...p, banco: e.target.value })} className={input} placeholder="Banco" aria-label="Banco" />
            <input maxLength={100} value={p.titular} onChange={(e) => onChange({ ...p, titular: e.target.value })} className={input} placeholder="Titular" aria-label="Titular de la cuenta" />
          </div>
          {(p.banco.trim().length < 2 || p.titular.trim().length < 3) && (
            <Estado ok={false}>
              Falta {[p.banco.trim().length < 2 && "el banco", p.titular.trim().length < 3 && "el titular"].filter(Boolean).join(" y ")}
            </Estado>
          )}
        </div>
      )}
      {p.pagos.includes("CoDi") && (
        <div className="mt-3 rounded-xl border border-border p-3">
          <div className="text-xs font-medium">CoDi</div>
          <input inputMode="numeric" maxLength={10} value={p.codi} onChange={(e) => onChange({ ...p, codi: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={input} placeholder="Celular ligado a CoDi · 10 dígitos" aria-label="Celular CoDi" />
          <Estado ok={/^\d{10}$/.test(p.codi)}>
            {/^\d{10}$/.test(p.codi) ? "Celular completo" : `Llevas ${p.codi.length} de 10 dígitos`}
          </Estado>
        </div>
      )}
      {p.pagos.includes("Efectivo") && (
        <p className="mt-3 rounded-xl border border-border p-3 text-[11px] text-muted-foreground">
          <span className="block text-xs font-medium text-foreground">Efectivo</span>
          El distribuidor te paga en mano al recolectar tu producto. No necesitas capturar nada más.
        </p>
      )}
    </div>
  );
}

/** Acuerdo de socio: el productor aporta un % de cada venta a Milpa */
export function SocioCard({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <Handshake className="h-5 w-5 text-primary" />
        <span className="serif text-lg">Eres socio de Milpa</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Milpa no compra tu cosecha: tú vendes directo a las familias y la app trabaja contigo. Como socio aportas el{" "}
        <strong className="text-foreground">{APORTACION_SOCIO}% de cada venta</strong> para sostener la plataforma, tu
        score, el QR de trazabilidad y la cosecha compartida.
      </p>
      <ul className="mt-3 space-y-1.5 text-xs">
        <li>· Se descuenta en automático de cada pago; nunca pagas por adelantado ni hay cuota fija.</li>
        <li>· Si una venta se cobra en efectivo, tu aportación se descuenta de tu siguiente pago digital.</li>
        <li>· Ejemplo: vendes $1,000 → recibes ${(1000 * (100 - APORTACION_SOCIO)) / 100} y aportas ${(1000 * APORTACION_SOCIO) / 100}.</li>
      </ul>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--primary)]" />
        <span>Acepto ser socio y aportar el {APORTACION_SOCIO}% de mis ventas a Milpa.</span>
      </label>
    </div>
  );
}
