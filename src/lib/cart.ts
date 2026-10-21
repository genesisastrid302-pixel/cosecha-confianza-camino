import { products } from "@/lib/data";

export type CartLine = { id: string; quantity: number };

/**
 * Los productos por gramo antes se pedían en kg: una línea guardada con menos
 * que el mínimo en gramos viene de entonces y se pasa a gramos (2 → 2000 g).
 */
function aGramos(line: CartLine): CartLine {
  const p = products.find((x) => x.id === line.id);
  return p?.unit === "gramo" && line.quantity < (p.paso ?? 250) ? { ...line, quantity: line.quantity * 1000 } : line;
}

const KEY = "milpa-cart";
const EVENT = "milpa-cart-change";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(data)) return [];
    return data
      .filter((line): line is CartLine => typeof line?.id === "string" && Number.isInteger(line?.quantity) && line.quantity > 0)
      .map(aGramos);
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(id: string, quantity: number, max: number) {
  const lines = readCart();
  const existing = lines.find((line) => line.id === id);
  if (existing) existing.quantity = Math.min(max, existing.quantity + quantity);
  else lines.push({ id, quantity: Math.min(max, quantity) });
  writeCart(lines);
}

export function subscribeCart(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}