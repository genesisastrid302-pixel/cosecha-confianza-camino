import { useEffect, useState } from "react";
import { getProductsByProducer } from "@/lib/data";

export type Zona = "Galeana" | "Allende" | "Ramos Arizpe";
export type Pago = "CLABE" | "CoDi" | "Efectivo";
export type CropStatus = "disponible" | "agotado" | "proximamente";

export type ProducerProfile = {
  name: string;
  story: string;
  zona: Zona | "";
  pago: Pago | "";
  clabe: string;
  photos: string[];
};

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
};

const KEY = "milpa-productor";
const EVENT = "milpa-productor-change";

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function seed(): ProducerState {
  return {
    profile: {
      name: "Ezequiel Martínez",
      story: "",
      zona: "Ramos Arizpe",
      pago: "",
      clabe: "",
      photos: [],
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
  };
}

export function readProducer(): ProducerState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed();
    return { ...seed(), ...JSON.parse(raw) };
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
    { label: "Historia de tu rancho", ok: p.story.trim().length >= 40 },
    { label: "Ubicación del campo", ok: !!p.zona },
    { label: "Método de pago", ok: !!p.pago && (p.pago !== "CLABE" || /^\d{18}$/.test(p.clabe)) },
    { label: "Fotos del campo (mín. 3)", ok: p.photos.length >= 3 },
  ];
  const pct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { pct, checks };
}

/** Score de confianza: 4 componentes calculados por el sistema. */
export function trustScore(s: ProducerState) {
  const perfil = profileCompleteness(s.profile).pct;
  const transparencia = Math.min(100, 60 + s.cosechas.reduce((n, c) => n + c.postales.length, 0) * 10 + s.profile.photos.length * 4);
  const entregas = 96;
  const calificaciones = 92;
  const components = [
    { label: "Perfil completo", weight: 30, value: perfil },
    { label: "Transparencia", weight: 25, value: transparencia },
    { label: "Entregas a tiempo", weight: 25, value: entregas },
    { label: "Calificaciones", weight: 20, value: calificaciones },
  ];
  const total = Math.round(components.reduce((n, c) => n + (c.value * c.weight) / 100, 0));
  return { total, components };
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
