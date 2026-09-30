import { Sprout, Package, Bell, User, Wallet, Home, ShoppingBasket, HandHeart, ListOrdered, Map, Truck } from "lucide-react";
import type { Tab } from "./AppShell";

export const productorTabs: Tab[] = [
  { to: "/productor", label: "Inicio", icon: Sprout },
  { to: "/productor/catalogo", label: "Catálogo", icon: Package },
  { to: "/productor/pedidos", label: "Pedidos", icon: Bell },
  { to: "/productor/finanzas", label: "Finanzas", icon: Wallet },
  { to: "/productor/perfil", label: "Perfil", icon: User },
];

export const consumidorTabs: Tab[] = [
  { to: "/consumidor", label: "Mercado", icon: Home },
  { to: "/consumidor/cosecha", label: "Cosecha", icon: HandHeart },
  { to: "/consumidor/carrito", label: "Carrito", icon: ShoppingBasket },
  { to: "/consumidor/pedidos", label: "Pedidos", icon: ListOrdered },
  { to: "/consumidor/perfil", label: "Perfil", icon: User },
];

export const distribuidorTabs: Tab[] = [
  { to: "/distribuidor", label: "Inicio", icon: Truck },
  { to: "/distribuidor/catalogo", label: "Catálogo", icon: Package },
  { to: "/distribuidor/ruta", label: "Ruta", icon: Map },
  { to: "/distribuidor/finanzas", label: "Finanzas", icon: Wallet },
  { to: "/distribuidor/perfil", label: "Perfil", icon: User },
];
