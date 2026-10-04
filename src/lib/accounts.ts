import { useEffect, useState } from "react";

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
  pago: "Tarjeta" | "CoDi" | "Efectivo";
};

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
  pago: "Tarjeta",
};

export const DEMO_DISTRIBUTOR: DistributorProfile = {
  nombre: "Claudia Ramírez",
  correo: "",
  telefono: "",
  transporte: "Vehículo propio",
  vehiculo: "Camioneta",
  refrigerado: true,
  paqueteria: "",
  zonas: ["Monterrey", "San Pedro Garza García"],
  cobro: "",
  clabe: "",
  banco: "",
  titular: "",
  codi: "",
};

const EVENT = "milpa-accounts-change";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function useStored<T>(key: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
    // fallback es una constante del módulo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return value;
}

export const readConsumer = () => read("milpa-consumidor", DEMO_CONSUMER);
export const saveConsumer = (p: ConsumerProfile) => write("milpa-consumidor", p);
export const useConsumer = () => useStored("milpa-consumidor", DEMO_CONSUMER);

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
