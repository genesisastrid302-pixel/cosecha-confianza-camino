import { useEffect, useState } from "react";
import { getProductsByProducer, producerDetails, producers } from "@/lib/data";
import { SCORE_LAYERS, score10 } from "@/lib/score";
import { coincide, iniciarSesion, sesionDe, suscribirSesion } from "@/lib/acceso";

export type Zona = "Galeana" | "Allende" | "Ramos Arizpe";
export type Pago = "CLABE" | "CoDi" | "Efectivo";
export type IdTipo = "INE" | "Pasaporte" | "Licencia";
export type CropStatus = "disponible" | "agotado" | "proximamente";

export type ProducerProfile = {
  name: string;
  correo: string;
  telefono: string;
  story: string;
  zona: Zona | "";
  /** Métodos para recibir pagos (puede elegir varios) */
  pagos: Pago[];
  clabe: string;
  banco: string;
  titular: string;
  /** Celular ligado a CoDi */
  codi: string;
  photos: string[];
  /** Aceptó ser socio de Milpa y aportar un % de sus ventas */
  socio: boolean;
  /** Identificación oficial para verificar que es la persona correcta.
   *  Solo se guarda el tipo y el estado: la foto no se queda en el navegador. */
  idTipo: IdTipo | "";
  idEstado: "" | "en_revision" | "verificada";
};

/** Porcentaje de cada venta que el productor socio aporta a Milpa (ajustable) */
export const APORTACION_SOCIO = 10;

export const EMPTY_PROFILE: ProducerProfile = {
  name: "",
  correo: "",
  telefono: "",
  story: "",
  zona: "",
  pagos: [],
  clabe: "",
  banco: "",
  titular: "",
  codi: "",
  photos: [],
  socio: false,
  idTipo: "",
  idEstado: "",
};

/** La cuenta para transferencias puede ser CLABE (18 dígitos) o tarjeta de débito (16) */
export function tipoCuenta(clabe: string): "CLABE" | "Tarjeta" | null {
  if (/^\d{18}$/.test(clabe)) return "CLABE";
  if (/^\d{16}$/.test(clabe)) return "Tarjeta";
  return null;
}

/** Lista exacta de lo que falta en los métodos de cobro elegidos (vacía = completo) */
export function cobroFaltantes(p: ProducerProfile): string[] {
  const faltan: string[] = [];
  if (p.pagos.length === 0) return ["Elige al menos una forma de recibir tus pagos."];
  if (p.pagos.includes("CLABE")) {
    if (!tipoCuenta(p.clabe)) faltan.push(`Transferencia: la CLABE lleva 18 dígitos (o 16 si es tarjeta); llevas ${p.clabe.length}.`);
    if (p.banco.trim().length < 2) faltan.push("Transferencia: escribe el banco.");
    if (p.titular.trim().length < 3) faltan.push("Transferencia: escribe el nombre del titular.");
  }
  if (p.pagos.includes("CoDi") && !/^\d{10}$/.test(p.codi)) {
    faltan.push(`CoDi: el celular lleva 10 dígitos; llevas ${p.codi.length}.`);
  }
  return faltan;
}

/** ¿Cada método de cobro elegido tiene sus datos? */
export function cobroCompleto(p: ProducerProfile) {
  return cobroFaltantes(p).length === 0;
}

/** Texto corto de los métodos de cobro, con las cuentas enmascaradas */
export function cobroResumen(p: ProducerProfile) {
  if (p.pagos.length === 0) return "Sin definir";
  return p.pagos
    .map((m) => {
      if (m === "CLABE") return tipoCuenta(p.clabe) ? `${tipoCuenta(p.clabe)} ${p.banco} ···${p.clabe.slice(-4)}` : "Transferencia sin capturar";
      if (m === "CoDi") return p.codi ? `CoDi ···${p.codi.slice(-4)}` : "CoDi sin celular";
      return "Efectivo";
    })
    .join(" · ");
}

export type Crop = {
  id: string;
  name: string;
  photo: string;
  pricePerKg: number;
  kgEstimated: number;
  kgAvailable: number;
  harvestDate: string; // yyyy-mm-dd
  season: string;
  status: CropStatus;
};

export type Postal = { id: string; date: string; photo: string; text: string };
export type CosechaLevel = { name: string; kg: number; price: number };
export type Cosecha = {
  id: string;
  cropName: string;
  harvestDate: string;
  expectedKg: number;
  levels: CosechaLevel[];
  postales: Postal[];
  /** Cuándo se publicó; sirve para avisar a quienes ya le compraron */
  creadaEn?: string;
};

export type ProducerState = {
  profile: ProducerProfile;
  crops: Crop[];
  cosechas: Cosecha[];
  lastScore: number | null;
  /** Reseñas de consumidores recibidas; con menos de RESENAS_PARA_SCORE es "Nuevo" */
  resenas: number;
};

/** Reseñas necesarias para dejar de ser "Nuevo" y mostrar el score */
export const RESENAS_PARA_SCORE = 10;
/** Fotos del campo que se piden mientras el productor es nuevo */
export const FOTOS_MIN = 5;
export const FOTOS_MAX = 15;

export function esNuevo(s: ProducerState) {
  return s.resenas < RESENAS_PARA_SCORE;
}

/** Suma una reseña a la cuenta del productor que atendió el pedido, cuando el consumidor lo califica */
export function addResena(productorId?: string) {
  if (!productorId) return;
  const cuentas = readCuentas();
  const cuenta = cuentas[productorId] ?? (productorId === DEMO_ID ? seed() : undefined);
  if (!cuenta) return;
  if (!writeCuentas({ ...cuentas, [productorId]: { ...cuenta, resenas: cuenta.resenas + 1 } })) return;
  window.dispatchEvent(new Event(EVENT));
}

const KEY = "milpa-productor";
const EVENT = "milpa-productor-change";

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function seed(): ProducerState {
  return {
    // Productor de ejemplo con su información básica completa (datos ficticios)
    profile: {
      ...EMPTY_PROFILE,
      name: "Ezequiel Martínez",
      correo: "ezequiel@seistierras.mx",
      telefono: "8441234567",
      story: producerDetails.santiago.story,
      zona: "Ramos Arizpe",
      pagos: ["CLABE", "Efectivo"],
      clabe: "012180001234567890",
      banco: "BBVA",
      titular: "Ezequiel Martínez",
      photos: [producers.santiago.photo, ...producerDetails.santiago.gallery],
      socio: true,
      idTipo: "INE",
      idEstado: "verificada",
    },
    crops: getProductsByProducer("santiago").map((p) => ({
      id: p.id,
      name: p.name,
      photo: p.photo,
      pricePerKg: p.price,
      kgEstimated: Math.max(p.unitsLeft * 2, 10),
      kgAvailable: p.unitsLeft,
      harvestDate: inDays(p.harvestIn),
      season: p.season,
      status: p.harvestIn > 0 ? "proximamente" : "disponible",
    })),
    cosechas: [],
    lastScore: null,
    // El productor de ejemplo ya tiene historial; uno recién registrado empieza en 0
    resenas: 24,
  };
}

/** Cuenta sin datos: lo que hay mientras no se ha iniciado sesión */
function vacio(): ProducerState {
  return { profile: EMPTY_PROFILE, crops: [], cosechas: [], lastScore: null, resenas: 0 };
}

// --- Varias cuentas de productor en el mismo navegador ---
// Cada cuenta vive en CUENTAS_KEY bajo un id estable; la sesión (src/lib/acceso.ts) dice con cuál se entró.
// La cuenta de ejemplo (Ezequiel) siempre existe con el id DEMO_ID y entra sin contraseña.

const CUENTAS_KEY = "milpa-productores";
export const DEMO_ID = "demo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizar(parsed: any): ProducerState {
  // Perfiles guardados antes de agregar correo, teléfono y cuenta de cobro
  const profile = { ...EMPTY_PROFILE, ...parsed.profile };
  // Antes se guardaba un solo método en "pago"
  if (parsed.profile?.pago && !parsed.profile?.pagos) profile.pagos = [parsed.profile.pago];
  return { ...seed(), ...parsed, profile };
}

function readCuentas(): Record<string, ProducerState> {
  try {
    const raw = window.localStorage.getItem(CUENTAS_KEY);
    const cuentas: Record<string, ProducerState> = {};
    if (raw) for (const [id, st] of Object.entries(JSON.parse(raw))) cuentas[id] = normalizar(st);
    // Versión anterior: una sola cuenta en KEY. Se conserva como cuenta propia.
    const legado = window.localStorage.getItem(KEY);
    if (legado) {
      const st = normalizar(JSON.parse(legado));
      if (st.profile.correo && st.profile.correo !== seed().profile.correo) cuentas[newId()] = st;
      window.localStorage.removeItem(KEY);
      window.localStorage.setItem(CUENTAS_KEY, JSON.stringify(cuentas));
    }
    return cuentas;
  } catch {
    return {};
  }
}

function writeCuentas(cuentas: Record<string, ProducerState>) {
  try {
    window.localStorage.setItem(CUENTAS_KEY, JSON.stringify(cuentas));
  } catch {
    alert("No hay espacio suficiente para guardar más fotos en este dispositivo.");
    return false;
  }
  return true;
}

/** Cuenta de productor con sesión iniciada (vacía si no hay sesión) */
export function readProducer(): ProducerState {
  if (typeof window === "undefined") return vacio();
  const id = sesionDe("productor");
  if (!id) return vacio();
  return readCuentas()[id] ?? (id === DEMO_ID ? seed() : vacio());
}

/** Guarda cambios en la cuenta con la que se entró */
export function writeProducer(next: ProducerState) {
  const id = sesionDe("productor");
  if (!id) return;
  if (!writeCuentas({ ...readCuentas(), [id]: next })) return;
  window.dispatchEvent(new Event(EVENT));
}

/** Crea una cuenta nueva y devuelve su id; las demás cuentas se conservan.
 *  La sesión la inicia quien registra, ya con la contraseña guardada. */
export function registrarProductor(profile: ProducerProfile) {
  const id = newId();
  const nueva: ProducerState = { ...seed(), resenas: 0, lastScore: null, cosechas: [], profile };
  if (!writeCuentas({ ...readCuentas(), [id]: nueva })) return null;
  window.dispatchEvent(new Event(EVENT));
  return id;
}

/** Cuentas de productor guardadas en este navegador; la de ejemplo va primero */
export function listarCuentas(): { id: string; state: ProducerState; ejemplo: boolean }[] {
  if (typeof window === "undefined") return [];
  const cuentas = readCuentas();
  const demo = cuentas[DEMO_ID] ?? seed();
  return [
    { id: DEMO_ID, state: demo, ejemplo: true },
    ...Object.entries(cuentas)
      .filter(([id]) => id !== DEMO_ID)
      .map(([id, state]) => ({ id, state, ejemplo: false })),
  ];
}

/** Busca una cuenta por correo o teléfono */
export function buscarCuenta(identificador: string) {
  return listarCuentas().find((c) => coincide(c.state.profile, identificador));
}

export function entrarComoProductor(id: string) {
  iniciarSesion("productor", id);
}

export function updateProducer(fn: (s: ProducerState) => ProducerState) {
  writeProducer(fn(readProducer()));
}

export function useProducer(): [ProducerState, boolean] {
  const [state, setState] = useState<ProducerState>(vacio);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setState(readProducer());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    const quitar = suscribirSesion(sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      quitar();
    };
  }, []);
  return [state, ready];
}

export function profileCompleteness(p: ProducerProfile) {
  const checks = [
    { label: "Nombre", ok: p.name.trim().length > 1 },
    { label: "Identificación oficial", ok: !!p.idTipo && p.idEstado !== "" },
    { label: "Correo y teléfono", ok: /\S+@\S+\.\S+/.test(p.correo) && /^\d{10}$/.test(p.telefono) },
    { label: "Historia de tu rancho", ok: p.story.trim().length >= 40 },
    { label: "Ubicación del campo", ok: !!p.zona },
    { label: "Cuenta para recibir pagos", ok: cobroCompleto(p) },
    { label: "Acuerdo de socio", ok: p.socio },
    { label: `Fotos del campo (mín. ${FOTOS_MIN})`, ok: p.photos.length >= FOTOS_MIN },
  ];
  const pct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { pct, checks };
}

/**
 * Score de confianza sobre 10, con las 3 capas del modelo (src/lib/score.ts).
 * - Consistencia de datos (30 %): información básica completa del productor.
 * - Calificación (40 %) y registro del distribuidor (30 %): vienen de consumidores
 *   y distribuidor; en la demo usan los datos de ejemplo.
 */
export function trustScore(s: ProducerState) {
  const base = producerDetails.santiago.components;
  const layers = {
    consistencia: profileCompleteness(s.profile).pct,
    calificacion: base.calificacion,
    distribuidor: base.distribuidor,
  };
  const components = SCORE_LAYERS.map((l) => ({ label: l.label, weight: l.weight, value: layers[l.key], help: l.help }));
  return { total: score10(layers), components };
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Reduce una foto a máx. 800px para guardarla en el dispositivo. */
export function fileToDataUrl(file: File, max = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale;
      c.height = img.height * scale;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
