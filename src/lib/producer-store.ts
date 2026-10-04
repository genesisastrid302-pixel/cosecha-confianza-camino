import { useEffect, useState } from "react";
import { getProductsByProducer, producerDetails } from "@/lib/data";
import { SCORE_LAYERS, score10 } from "@/lib/score";

export type Zona = "Galeana" | "Allende" | "Ramos Arizpe";
export type Pago = "CLABE" | "CoDi" | "Efectivo";
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
};

/** ¿Cada método de cobro elegido tiene sus datos? */
export function cobroCompleto(p: ProducerProfile) {
  if (p.pagos.length === 0) return false;
  return p.pagos.every((m) => {
    if (m === "CLABE") return /^\d{18}$/.test(p.clabe) && p.banco.trim().length > 1 && p.titular.trim().length > 2;
    if (m === "CoDi") return /^\d{10}$/.test(p.codi);
    return true;
  });
}

/** Texto corto de los métodos de cobro, con las cuentas enmascaradas */
export function cobroResumen(p: ProducerProfile) {
  if (p.pagos.length === 0) return "Sin definir";
  return p.pagos
    .map((m) => {
      if (m === "CLABE") return p.clabe ? `CLABE ${p.banco} ···${p.clabe.slice(-4)}` : "CLABE sin capturar";
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

/** Suma una reseña cuando un consumidor envía su feedback */
export function addResena() {
  updateProducer((s) => ({ ...s, resenas: s.resenas + 1 }));
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
    profile: { ...EMPTY_PROFILE, name: "Ezequiel Martínez", zona: "Ramos Arizpe" },
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

export function readProducer(): ProducerState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    const base = seed();
    // Perfiles guardados antes de agregar correo, teléfono y cuenta de cobro
    const profile = { ...EMPTY_PROFILE, ...parsed.profile };
    // Antes se guardaba un solo método en "pago"
    if (parsed.profile?.pago && !parsed.profile?.pagos) profile.pagos = [parsed.profile.pago];
    return { ...base, ...parsed, profile };
  } catch {
    return seed();
  }
}

export function writeProducer(next: ProducerState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    alert("No hay espacio suficiente para guardar más fotos en este dispositivo.");
    return;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function updateProducer(fn: (s: ProducerState) => ProducerState) {
  writeProducer(fn(readProducer()));
}

export function useProducer(): [ProducerState, boolean] {
  const [state, setState] = useState<ProducerState>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setState(readProducer());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [state, ready];
}

export function profileCompleteness(p: ProducerProfile) {
  const checks = [
    { label: "Nombre", ok: p.name.trim().length > 1 },
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
 * La capa de consistencia depende de lo que el productor captura; las otras dos
 * vienen de consumidores y distribuidor (en la demo, datos de ejemplo).
 */
export function trustScore(s: ProducerState) {
  const perfil = profileCompleteness(s.profile).pct;
  const evidencia = Math.min(100, 60 + s.cosechas.reduce((n, c) => n + c.postales.length, 0) * 10 + s.profile.photos.length * 4);
  const base = producerDetails.santiago.components;
  const layers = {
    consistencia: Math.round((perfil + evidencia) / 2),
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
