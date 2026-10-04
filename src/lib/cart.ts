export type CartLine = { id: string; quantity: number };

const KEY = "milpa-cart";
const EVENT = "milpa-cart-change";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((line): line is CartLine =>
      typeof line?.id === "string" && Number.isInteger(line?.quantity) && line.quantity > 0,
    );
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