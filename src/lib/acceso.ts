import { useEffect, useState } from "react";

/**
 * Acceso a las cuentas reales guardadas en este navegador (prototipo, sin backend).
 * - Sesión: con qué cuenta se entró en cada rol.
 * - Contraseñas: nunca se guarda el texto; solo un derivado (PBKDF2-SHA-256 con sal)
 *   que sirve para comprobar la contraseña al iniciar sesión.
 * Los perfiles viven en src/lib/accounts.ts y src/lib/producer-store.ts.
 */

export type Rol = "consumidor" | "productor" | "distribuidor";

const SESION_KEY = "milpa-sesion";
const CLAVES_KEY = "milpa-claves";
const EVENT = "milpa-sesion-change";

type Clave = { sal: string; hash: string };

function leer<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(key) || "{}");
    return data && typeof data === "object" ? (data as Record<string, T>) : {};
  } catch {
    return {};
  }
}

// --- Sesión ---

/** Id de la cuenta con la que se entró en ese rol, o null si no hay sesión */
export function sesionDe(rol: Rol): string | null {
  return leer<string>(SESION_KEY)[rol] ?? null;
}

export function iniciarSesion(rol: Rol, id: string) {
  window.localStorage.setItem(SESION_KEY, JSON.stringify({ ...leer<string>(SESION_KEY), [rol]: id }));
  window.dispatchEvent(new Event(EVENT));
}

export function cerrarSesion(rol: Rol) {
  const sesiones = leer<string>(SESION_KEY);
  delete sesiones[rol];
  window.localStorage.setItem(SESION_KEY, JSON.stringify(sesiones));
  window.dispatchEvent(new Event(EVENT));
}

export function suscribirSesion(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/** `lista` es false hasta que se leyó el navegador para ESE rol (evita decidir con datos de otra pantalla) */
export function useSesion(rol: Rol | null) {
  const [estado, setEstado] = useState<{ rol: Rol | null; id: string | null; lista: boolean }>({ rol: null, id: null, lista: false });
  useEffect(() => {
    const sync = () => setEstado({ rol, id: rol ? sesionDe(rol) : null, lista: true });
    sync();
    return suscribirSesion(sync);
  }, [rol]);
  return estado.rol === rol ? { id: estado.id, lista: estado.lista } : { id: null, lista: false };
}

// --- Contraseñas ---

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const deB64 = (txt: string) => Uint8Array.from(atob(txt), (c) => c.charCodeAt(0));

async function derivar(password: string, sal: Uint8Array) {
  if (!window.crypto?.subtle) throw new Error("Este navegador no permite proteger la contraseña. Abre la app con https.");
  const base = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sal as BufferSource, iterations: 150_000 }, base, 256);
  return b64(new Uint8Array(bits));
}

const llave = (rol: Rol, id: string) => `${rol}:${id}`;

export async function guardarClave(rol: Rol, id: string, password: string) {
  const sal = window.crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivar(password, sal);
  window.localStorage.setItem(CLAVES_KEY, JSON.stringify({ ...leer<Clave>(CLAVES_KEY), [llave(rol, id)]: { sal: b64(sal), hash } }));
}

/** ¿La cuenta ya tiene contraseña? (las creadas antes de este cambio no) */
export function tieneClave(rol: Rol, id: string) {
  return !!leer<Clave>(CLAVES_KEY)[llave(rol, id)];
}

export async function claveCorrecta(rol: Rol, id: string, password: string) {
  const guardada = leer<Clave>(CLAVES_KEY)[llave(rol, id)];
  if (!guardada) return false;
  return (await derivar(password, deB64(guardada.sal))) === guardada.hash;
}

// --- Identificar una cuenta por teléfono o correo ---

export type Contacto = { correo: string; telefono: string };

export function coincide(c: Contacto, identificador: string) {
  const txt = identificador.trim().toLowerCase();
  const digitos = identificador.replace(/\D/g, "").slice(-10);
  if (!txt) return false;
  return (!!c.correo && c.correo.trim().toLowerCase() === txt) || (digitos.length === 10 && c.telefono === digitos);
}

/** Mensaje si el correo o el teléfono ya están en otra cuenta del mismo rol */
export function contactoRepetido(cuentas: Contacto[], nuevo: Contacto) {
  if (nuevo.telefono && cuentas.some((c) => c.telefono === nuevo.telefono)) return "Ya hay una cuenta con ese teléfono. Inicia sesión.";
  if (nuevo.correo && cuentas.some((c) => c.correo.trim().toLowerCase() === nuevo.correo.trim().toLowerCase()))
    return "Ya hay una cuenta con ese correo. Inicia sesión.";
  return "";
}

export function nuevoId() {
  return window.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}
