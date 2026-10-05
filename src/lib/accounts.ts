import { useEffect, useState } from "react";
import type { MetodoPago } from "@/lib/orders";

/**
 * Cuentas de consumidor y distribuidor guardadas en el navegador (prototipo, sin backend).
 * La contraseña nunca se guarda: solo se valida en el registro.
 */

export type ConsumerProfile = {
  nombre: string;
  correo: string;
  telefono: string;
  municipio: string;
  entrega: "domicilio" | "pickup";
  /** Métodos de pago que usa; puede tener varios. En cada pedido elige con cuál paga. */
  pagos: MetodoPago[];
};

export const METODOS_PAGO: MetodoPago[] = ["Tarjeta", "CoDi", "Efectivo"];

export type Transporte = "Vehículo propio" | "Paquetería";

export type DistributorProfile = {
  nombre: string;
  correo: string;
  telefono: string;
  transporte: Transporte | "";
  vehiculo: string; // p. ej. "Camioneta" (si es vehículo propio)
  refrigerado: boolean;
  paqueteria: string; // nombre del servicio (si usa paquetería)
  zonas: string[];
  cobro: "CLABE" | "CoDi" | "";
  clabe: string;
  banco: string;
  titular: string;
  codi: string;
};

export const MUNICIPIOS = [
  "Monterrey",
  "San Pedro Garza García",
  "San Nicolás de los Garza",
  "Guadalupe",
  "Apodaca",
  "Santa Catarina",
  "Escobedo",
  "García",
];

export const DEMO_CONSUMER: ConsumerProfile = {
  nombre: "Adriana Martínez",
  correo: "",
  telefono: "",
  municipio: "Monterrey",
  entrega: "domicilio",
  pagos: ["Tarjeta"],
};

export const DEMO_DISTRIBUTOR: DistributorProfile = {
  nombre: "Claudia Ramírez",
  correo: "claudia@rutamty.mx",
  telefono: "8187654321",
  transporte: "Vehículo propio",
  vehiculo: "Camioneta",
  refrigerado: true,
  paqueteria: "",
  zonas: ["Monterrey", "San Pedro Garza García"],
  cobro: "CLABE",
  clabe: "072580009876543210",
  banco: "Banorte",
  titular: "Claudia Ramírez",
  codi: "",
};

/** Formulario de registro en blanco */
export const EMPTY_DISTRIBUTOR: DistributorProfile = {
  nombre: "",
  correo: "",
  telefono: "",
  transporte: "",
  vehiculo: "",
  refrigerado: true,
  paqueteria: "",
  zonas: [],
  cobro: "",
  clabe: "",
  banco: "",
  titular: "",
  codi: "",
};

const EVENT = "milpa-accounts-change";

function read<T>(key: string, fallback: T, normalizar: (v: T, guardado: Record<string, unknown>) => T = (v) => v): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const guardado = JSON.parse(raw);
    return normalizar({ ...fallback, ...guardado }, guardado);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function useStored<T>(key: string, fallback: T, normalizar?: (v: T, guardado: Record<string, unknown>) => T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback, normalizar));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // fallback y normalizar son constantes del módulo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}

/** Cuentas guardadas antes tenían un solo método (`pago`); se conserva como su lista. */
function normalizarConsumidor(c: ConsumerProfile, guardado: Record<string, unknown>): ConsumerProfile {
  const lista: unknown[] = Array.isArray(guardado.pagos) ? guardado.pagos : guardado.pago ? [guardado.pago] : [];
  const pagos = METODOS_PAGO.filter((m) => lista.includes(m));
  return { ...c, pagos: pagos.length ? pagos : DEMO_CONSUMER.pagos };
}

export const readConsumer = () => read("milpa-consumidor", DEMO_CONSUMER, normalizarConsumidor);
export const saveConsumer = (p: ConsumerProfile) => write("milpa-consumidor", p);
export const useConsumer = () => useStored("milpa-consumidor", DEMO_CONSUMER, normalizarConsumidor);

export const readDistributor = () => read("milpa-distribuidor", DEMO_DISTRIBUTOR);
export const saveDistributor = (p: DistributorProfile) => write("milpa-distribuidor", p);
export const useDistributor = () => useStored("milpa-distribuidor", DEMO_DISTRIBUTOR);

/** "Adriana Martínez" → "Adriana M." */
export function nombreCorto(nombre: string) {
  const [first, last] = nombre.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first || "Consumidor";
}

export function validarAcceso(telefono: string, password: string, password2: string) {
  if (!/^\d{10}$/.test(telefono)) return "El teléfono debe tener 10 dígitos.";
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (password !== password2) return "Las contraseñas no coinciden.";
  return "";
}
