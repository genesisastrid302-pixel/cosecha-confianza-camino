import { Link } from "@tanstack/react-router";
import { Seal } from "./Seal";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 text-foreground">
          <Seal className="h-9 w-9 text-primary" />
          <div className="leading-tight">
            <div className="serif text-base">Milpa</div>
            <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground">cadena corta</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/consumidor" className="text-foreground/70 hover:text-foreground transition-colors">Mercado</Link>
          <Link to="/productor/santiago" className="text-foreground/70 hover:text-foreground transition-colors">Productores</Link>
          <Link to="/trazabilidad" className="text-foreground/70 hover:text-foreground transition-colors">Trazabilidad</Link>
        </nav>
        <Link
          to="/consumidor"
          className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
