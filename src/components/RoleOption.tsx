import { Sprout } from "lucide-react";

export type Role = "productor" | "distribuidor" | "consumidor";

export function RoleOption({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
  tone,
}: {
  id: Role;
  active: boolean;
  onClick: () => void;
  icon: typeof Sprout;
  title: string;
  subtitle: string;
  tone: "milpa" | "miel" | "terracota";
}) {
  const toneBg = { milpa: "bg-primary/10 text-primary", miel: "bg-miel/15 text-miel", terracota: "bg-terracota/10 text-terracota" }[tone];
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        active ? "border-foreground bg-card shadow-soft" : "border-border bg-card hover:bg-secondary/40"
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneBg}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="serif text-lg leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <div className={`h-5 w-5 rounded-full border-2 ${active ? "border-foreground bg-foreground" : "border-border"}`} />
    </button>
  );
}
