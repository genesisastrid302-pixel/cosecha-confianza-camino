import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { distribuidorTabs } from "@/components/tabs";
import { QrCode } from "lucide-react";

export const Route = createFileRoute("/distribuidor/trazabilidad")({
  head: () => ({ meta: [{ title: "Trazabilidad · Distribuidor — Milpa" }] }),
  component: () => (
    <AppShell tabs={distribuidorTabs} tone="miel" eyebrow="Lotes en ruta" title="Trazabilidad">
      <div className="space-y-4 px-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-6 text-sm">
          <QrCode className="h-5 w-5" /> Escanear QR de lote
        </button>

        {["LT-0518", "LT-0519", "LT-0520"].map((id, i) => (
          <div key={id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <div className="serif text-base">Lote {id}</div>
              <span className={`text-[10px] uppercase tracking-widest ${i === 0 ? "text-terracota" : "text-primary"}`}>
                {i === 0 ? "En ruta" : "Entregado"}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex justify-between"><span>Productor</span><span>Santiago T.</span></li>
              <li className="flex justify-between"><span>Cosecha</span><span>17 may · 6:40 AM</span></li>
              <li className="flex justify-between"><span>Cadena de frío</span><span className="text-primary">✓ Estable</span></li>
              <li className="flex justify-between"><span>Destino</span><span>Col. Roma · MTY</span></li>
            </ul>
          </div>
        ))}
      </div>
    </AppShell>
  ),
});
