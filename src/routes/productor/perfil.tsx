import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, LogOut, Mail, Phone, Landmark } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";
import { CobroFields } from "@/components/ProductorForm";
import santiago from "@/assets/producer-santiago.jpg";
import {
  cobroCompleto,
  cobroResumen,
  trustScore,
  updateProducer,
  useProducer,
  type ProducerProfile,
  type Zona,
} from "@/lib/producer-store";
import { formatScore, scoreTone } from "@/lib/score";
import { useOrders } from "@/lib/orders";

export const Route = createFileRoute("/productor/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Productor — Milpa" }] }),
  component: Perfil,
});

type Seccion = "personal" | "cobro" | "ubicacion" | null;
const zonas: Zona[] = ["Galeana", "Allende", "Ramos Arizpe"];

function Perfil() {
  const [state] = useProducer();
  const orders = useOrders();
  const [abierta, setAbierta] = useState<Seccion>(null);
  const p = state.profile;
  const { total } = trustScore(state);
  const foto = p.photos[0] ?? santiago;
  const familias = new Set(orders.map((o) => o.cliente)).size;

  const toggle = (s: Seccion) => setAbierta((a) => (a === s ? null : s));

  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tu perfil" title={p.name || "Productor"}>
      <div className="space-y-6 px-5">
        <div className="flex items-center gap-4">
          <img src={foto} alt={p.name} className="h-20 w-20 rounded-full object-cover" />
          <div>
            <div className="text-sm">{p.zona ? `${p.zona}, Coahuila` : "Ubicación sin capturar"}</div>
            <div className="text-xs text-muted-foreground">{state.crops.length} cultivos en tu catálogo</div>
            <div className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] ${scoreTone(total)}`}>
              Score {formatScore(total)}
            </div>
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
          </div>
        </section>

        <section>
          <div className="eyebrow">Negocio</div>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <LinkFila to="/productor/finanzas" label="Ventas y pagos" detail="Lo que recibes y cuándo" />
            <LinkFila to="/productor/transparencia" label="Evidencia y postales" detail={`${p.photos.length} fotos del campo`} />
            <LinkFila to="/productor/catalogo" label="Catálogo y cosecha compartida" detail={`${state.cosechas.length} cosechas`} />
          </div>
        </section>

        <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm text-muted-foreground">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Link>
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
        updateProducer((s) => ({ ...s, profile: { ...s.profile, ...d, name: d.name.trim() } }));
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

function Fila({
  label,
  detail,
  warn,
  open,
  onClick,
  children,
}: {
  label: string;
  detail: string;
  warn?: boolean;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm">
        <span>{label}</span>
        <span className={`flex min-w-0 items-center gap-2 text-xs ${warn ? "text-terracota" : "text-muted-foreground"}`}>
          <span className="truncate">{detail}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div className="border-t border-border bg-secondary/40 px-4 py-4">{children}</div>}
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
