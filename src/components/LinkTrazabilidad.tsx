import { Link } from "@tanstack/react-router";
import { QrCode } from "lucide-react";

/** Acceso a la página pública del QR. El texto es el título de esa pantalla. */
export function LinkTrazabilidad({ id, className = "" }: { id: string; className?: string }) {
  return (
    <Link
      to="/lote/$id"
      params={{ id }}
      className={`flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm ${className}`}
    >
      <QrCode className="h-4 w-4" /> Trazabilidad del pedido
    </Link>
  );
}
