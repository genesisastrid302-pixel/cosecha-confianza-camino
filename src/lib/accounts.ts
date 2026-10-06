import { useEffect, useState } from "react";
import type { MetodoPago } from "@/lib/orders";
import { coincide, nuevoId, sesionDe, suscribirSesion, type Rol } from "@/lib/acceso";

/**
 * Cuentas reales de consumidor y distribuidor guardadas en el navegador (prototipo, sin backend).
 * Puede haber varias por rol; la sesión dice con cuál se entró (src/lib/acceso.ts).
 * La contraseña no vive aquí: acceso.ts guarda solo su derivado para comprobarla.
 */

export type ConsumerProfile = {
  nombre: string;
  correo: string;
  telefono: string;
  municipio: string;
  /** Calle, número y colonia a donde le llevan su canasta ("" si aún no la registra) */
  direccion: string;
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

/** Sin sesión no hay datos de nadie: los formularios y pantallas parten de aquí */
export const EMPTY_CONSUMER: ConsumerProfile = {
  nombre: "",
  correo: "",
  telefono: "",
  municipio: "",
  direccion: "",
  entrega: "domicilio",
  pagos: [],
};

/** Mínimo para que un repartidor pueda llegar: calle, número y colonia */
export const direccionValida = (direccion: string) => direccion.trim().length >= 8;

/** "Calle Hidalgo 214, Col. Roma, Monterrey" */
export function direccionCompleta(c: Pick<ConsumerProfile, "direccion" | "municipio">) {
  return [c.direccion.trim(), c.municipio].filter(Boolean).join(", ");
}

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

/** Cuentas guardadas antes tenían un solo método (`pago`); se conserva como su lista. */
function normalizarConsumidor(guardado: Record<string, unknown>): ConsumerProfile {
  const lista: unknown[] = Array.isArray(guardado.pagos) ? guardado.pagos : guardado.pago ? [guardado.pago] : [];
  const c = { ...EMPTY_CONSUMER, ...guardado } as ConsumerProfile & { pago?: unknown };
  delete c.pago;
  return { ...c, pagos: METODOS_PAGO.filter((m) => lista.includes(m)) };
}

const normalizarDistribuidor = (guardado: Record<string, unknown>) => ({ ...EMPTY_DISTRIBUTOR, ...guardado }) as DistributorProfile;

type Almacen<T> = {
  rol: Rol;
  /** Todas las cuentas del rol: { id: perfil } */
  key: string;
  /** Versión anterior: un solo perfil por navegador */
  legado: string;
  vacio: T;
  normalizar: (guardado: Record<string, unknown>) => T;
};

const CONSUMIDORES: Almacen<ConsumerProfile> = {
  rol: "consumidor",
  key: "milpa-consumidores",
  legado: "milpa-consumidor",
  vacio: EMPTY_CONSUMER,
  normalizar: normalizarConsumidor,
};

const DISTRIBUIDORES: Almacen<DistributorProfile> = {
  rol: "distribuidor",
  key: "milpa-distribuidores",
  legado: "milpa-distribuidor",
  vacio: EMPTY_DISTRIBUTOR,
  normalizar: normalizarDistribuidor,
};

function leerCuentas<T extends { correo: string; telefono: string }>(a: Almacen<T>): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const cuentas: Record<string, T> = {};
    const raw = window.localStorage.getItem(a.key);
    if (raw) for (const [id, v] of Object.entries(JSON.parse(raw))) cuentas[id] = a.normalizar(v as Record<string, unknown>);
    // El perfil único de la versión anterior se conserva como una cuenta más (si tenía cómo identificarse)
    const legado = window.localStorage.getItem(a.legado);
    if (legado) {
      const perfil = a.normalizar(JSON.parse(legado));
      if (perfil.correo || perfil.telefono) cuentas[nuevoId()] = perfil;
      window.localStorage.removeItem(a.legado);
      window.localStorage.setItem(a.key, JSON.stringify(cuentas));
    }
    return cuentas;
  } catch {
    return {};
  }
}

function guardarCuentas<T>(a: Almacen<T>, cuentas: Record<string, T>) {
  window.localStorage.setItem(a.key, JSON.stringify(cuentas));
  window.dispatchEvent(new Event(EVENT));
}

function registrar<T extends { correo: string; telefono: string }>(a: Almacen<T>, perfil: T) {
  const id = nuevoId();
  guardarCuentas(a, { ...leerCuentas(a), [id]: perfil });
  return id;
}

function activa<T extends { correo: string; telefono: string }>(a: Almacen<T>): T {
  const id = sesionDe(a.rol);
  return (id && leerCuentas(a)[id]) || a.vacio;
}

function guardarActiva<T extends { correo: string; telefono: string }>(a: Almacen<T>, perfil: T) {
  const id = sesionDe(a.rol);
  if (!id) return;
  guardarCuentas(a, { ...leerCuentas(a), [id]: perfil });
}

function listar<T extends { correo: string; telefono: string }>(a: Almacen<T>) {
  return Object.entries(leerCuentas(a)).map(([id, perfil]) => ({ id, perfil }));
}

function useActiva<T extends { correo: string; telefono: string }>(a: Almacen<T>): T {
  const [value, setValue] = useState<T>(a.vacio);
  useEffect(() => {
    const sync = () => setValue(activa(a));
    sync();
    window.addEventListener(EVENT, sync);
    const quitar = suscribirSesion(sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      quitar();
    };
    // el almacén es una constante del módulo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

/** Crea la cuenta y devuelve su id (la sesión la inicia quien registra, ya con la contraseña guardada) */
export const registrarConsumidor = (p: ConsumerProfile) => registrar(CONSUMIDORES, p);
export const listarConsumidores = () => listar(CONSUMIDORES);
/** Las demás cuentas del rol (para no repetir teléfono ni correo al editar el perfil) */
export const otrosConsumidores = () => listarConsumidores().filter((c) => c.id !== sesionDe("consumidor")).map((c) => c.perfil);
export const otrosDistribuidores = () => listarDistribuidores().filter((c) => c.id !== sesionDe("distribuidor")).map((c) => c.perfil);
export const buscarConsumidor = (identificador: string) => listarConsumidores().find((c) => coincide(c.perfil, identificador));
/** Perfil del consumidor con sesión iniciada (vacío si no hay sesión) */
export const readConsumer = () => activa(CONSUMIDORES);
export const saveConsumer = (p: ConsumerProfile) => guardarActiva(CONSUMIDORES, p);
export const useConsumer = () => useActiva(CONSUMIDORES);

export const registrarDistribuidor = (p: DistributorProfile) => registrar(DISTRIBUIDORES, p);
export const listarDistribuidores = () => listar(DISTRIBUIDORES);
export const buscarDistribuidor = (identificador: string) => listarDistribuidores().find((c) => coincide(c.perfil, identificador));
export const readDistributor = () => activa(DISTRIBUIDORES);
export const saveDistributor = (p: DistributorProfile) => guardarActiva(DISTRIBUIDORES, p);
export const useDistributor = () => useActiva(DISTRIBUIDORES);

/** "Adriana Martínez" → "Adriana M." */
export function nombreCorto(nombre: string) {
  const [first, last] = nombre.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first || "";
}

export function validarAcceso(telefono: string, password: string, password2: string) {
  if (!/^\d{10}$/.test(telefono)) return "El teléfono debe tener 10 dígitos.";
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (password !== password2) return "Las contraseñas no coinciden.";
  return "";
}
