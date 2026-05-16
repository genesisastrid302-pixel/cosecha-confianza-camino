import { Sprout, Package, Camera, Bell, User } from "lucide-react";
import type { Tab } from "./AppShell";

export const productorTabs: Tab[] = [
  { to: "/productor", label: "Inicio", icon: Sprout },
  { to: "/productor/catalogo", label: "Catálogo", icon: Package },
  { to: "/productor/transparencia", label: "Transparencia", icon: Camera },
  { to: "/productor/pedidos", label: "Pedidos", icon: Bell },
  { to: "/productor/perfil", label: "Perfil", icon: User },
];

import { Home, ShoppingBasket, Users, ListOrdered, User as UserIcon } from "lucide-react";

export const consumidorTabs: Tab[] = [
  { to: "/consumidor", label: "Mercado", icon: Home },
  { to: "/consumidor/productores", label: "Productores", icon: Users },
  { to: "/consumidor/carrito", label: "Carrito", icon: ShoppingBasket },
  { to: "/consumidor/pedidos", label: "Pedidos", icon: ListOrdered },
  { to: "/consumidor/perfil", label: "Perfil", icon: UserIcon },
];

import { Map, ClipboardList, QrCode, BarChart3, User as UserIcon2 } from "lucide-react";

export const distribuidorTabs: Tab[] = [
  { to: "/distribuidor", label: "Ruta", icon: Map },
  { to: "/distribuidor/recoleccion", label: "Recolección", icon: ClipboardList },
  { to: "/distribuidor/trazabilidad", label: "Trazabilidad", icon: QrCode },
  { to: "/distribuidor/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/distribuidor/perfil", label: "Perfil", icon: UserIcon2 },
];
