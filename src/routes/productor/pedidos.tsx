import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { productorTabs } from "@/components/tabs";

export const Route = createFileRoute("/productor/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos · Productor — Milpa" }] }),
  component: Pedidos,
});

const orders = [
  { id: "0518", who: "Adriana M.", zone: "Col. Roma", items: "2 kg jitomate · 1 manojo cilantro", total: 158, state: "pendiente" as const },
  { id: "0517", who: "Ximena R.", zone: "San Pedro", items: "1 kg chiles serranos", total: 54, state: "confirmado" as const },
  { id: "0516", who: "Jorge T.", zone: "Cumbres", items: "Canasta semanal", total: 320, state: "entregado" as const },
  { id: "0515", who: "Marta L.", zone: "Linda Vista", items: "3 kg jitomate", total: 204, state: "entregado" as const },
];

function Pedidos() {
  return (
    <AppShell tabs={productorTabs} tone="milpa" eyebrow="Tus pedidos" title="Esta semana">
      <div className="px-5">
        <div className="flex gap-2 text-xs">
          {["Pendientes", "Confirmados", "Entregados"].map((t, i) => (
            <button
              key={t}
              className={`rounded-full px-3.5 py-1.5 ${
                i === 0 ? "bg-foreground text-background" : "border border-border text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {orders.map((o) => {
            const tone =
              o.state === "pendiente"
                ? "border-terracota/40 bg-terracota/5"
                : o.state === "confirmado"
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card";
            return (
              <div key={o.id} className={`rounded-2xl border-2 ${o.state === "pendiente" ? "border-dashed" : ""} ${tone} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#MLP-{o.id}</div>
                    <div className="serif mt-1 text-base">{o.who} · {o.zone}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{o.items}</div>
                  </div>
                  <div className="serif text-xl">${o.total}</div>
                </div>
                {o.state === "pendiente" && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-full bg-primary py-2.5 text-sm text-primary-foreground">
                      Puedo entregar
                    </button>
                    <button className="rounded-full border border-border px-4 text-sm text-muted-foreground">
                      No esta vez
                    </button>
                  </div>
                )}
                {o.state === "confirmado" && (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-primary">✓ Distribuidor asignado · Claudia</span>
                    <button className="text-foreground underline">Generar QR</button>
                  </div>
                )}
                {o.state === "entregado" && (
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>✓ Pago recibido · ★★★★★</span>
                    <span>Hace 2 d</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
