import { Link, useRouterState } from "@tanstack/react-router";
import { type ComponentType } from "react";
import { Campana } from "@/components/Campana";
import type { Rol } from "@/lib/notificaciones";

export type Tab = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export function BottomNav({ tabs, tone = "milpa" }: { tabs: Tab[]; tone?: "milpa" | "miel" | "terracota" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeColor = { milpa: "text-primary", miel: "text-miel", terracota: "text-terracota" }[tone];

  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-border bg-background/95 backdrop-blur-xl">
      <ul className="flex items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {tabs.map((t) => {
          const active = pathname === t.to || (t.to !== tabs[0].to && pathname.startsWith(t.to));
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                className={`flex flex-col items-center gap-1 py-1.5 text-[10px] tracking-wide ${
                  active ? activeColor : "text-foreground/50"
                }`}
              >
                <t.icon className={`h-5 w-5 ${active ? "" : "opacity-80"}`} />
                <span className={active ? "font-medium" : ""}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({
  title,
  eyebrow,
  children,
  tabs,
  tone,
  right,
  back,
}: {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  tabs?: Tab[];
  tone?: "milpa" | "miel" | "terracota";
  right?: React.ReactNode;
  /** Botón de regresar: siempre arriba a la izquierda, sobre el título */
  back?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {(title || eyebrow) && (
        <header className="sticky top-0 z-20 bg-background/85 px-5 pb-3 pt-4 backdrop-blur-xl">
          {back && <div className="mb-3">{back}</div>}
          <div className="flex items-start justify-between gap-3">
            <div>
              {eyebrow && <div className="eyebrow">{eyebrow}</div>}
              {title && <h1 className="display mt-1 text-4xl">{title}</h1>}
            </div>
            {/* Las pantallas principales de cada rol llevan la campanita; las que traen su propio botón, no */}
            {right ?? (tabs && !back ? <Campana rol={tabs[0].to.slice(1) as Rol} /> : null)}
          </div>
        </header>
      )}
      <main className="flex-1 pb-6">{children}</main>
      {tabs && <BottomNav tabs={tabs} tone={tone} />}
    </div>
  );
}
