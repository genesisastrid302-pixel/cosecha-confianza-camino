import { Sprout } from "lucide-react";

export function Placeholder({ text }: { text: string }) {
  return (
    <div className="mx-5 mt-4 flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
      <Sprout className="h-8 w-8 text-primary" />
      <p className="serif mt-3 text-lg">Esta sección está germinando</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
