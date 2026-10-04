import { score10, type ScoreLayers } from "@/lib/score";
import santiago from "@/assets/producer-santiago.jpg";
import rosa from "@/assets/producer-rosa.jpg";
import tomato from "@/assets/product-tomato.jpg";
import limones from "@/assets/product-limones.jpg";
import cilantro from "@/assets/product-cilantro.jpg";
import chiles from "@/assets/product-chiles.jpg";
import espinaca from "@/assets/product-espinaca.jpg";
import calabaza from "@/assets/product-calabaza.jpg";
import ejote from "@/assets/product-ejote.jpg";
import lechuga from "@/assets/product-lechuga.jpg";

export type Producer = {
  slug: string;
  name: string;
  region: string;
  practice: string;
  photo: string;
  score: number;
  years: number;
  note: string;
  metrics: { label: string; value: string }[];
};

export const producers: Record<string, Producer> = {
  santiago: {
    slug: "santiago",
    name: "Ezequiel Martínez",
    region: "Rancho Seis Tierras · Ramos Arizpe, Coahuila",
    practice: "Verduras agroecológicas de semilla ancestral",
    photo: santiago,
    score: 9.4,
    years: 12,
    note: "Esta semana el jitomate salió más chico porque llovió menos, pero está más dulce. Cosecho lo que ustedes piden — ni un kilo más.",
    metrics: [
      { label: "Cultivos activos", value: "7" },
      { label: "Score de confianza", value: "9.4/10" },
      { label: "Familias servidas", value: "184" },
      { label: "Distancia a tu mesa", value: "98 km" },
    ],
  },
  rosa: {
    slug: "rosa",
    name: "Rosa María Lozano",
    region: "Galeana, Nuevo León",
    practice: "Cítricos y hortalizas de temporada",
    photo: rosa,
    score: 9.1,
    years: 18,
    note: "El limón este año salió con cáscara más gruesa por el frío de marzo, pero el jugo está más perfumado. Corto en la mañana, llega a tu casa el mismo día.",
    metrics: [
      { label: "Cultivos activos", value: "5" },
      { label: "Score de confianza", value: "9.1/10" },
      { label: "Familias servidas", value: "127" },
      { label: "Distancia a tu mesa", value: "182 km" },
    ],
  },
};

export type Product = {
  id: string;
  name: string;
  producerSlug: string;
  photo: string;
  price: number;
  unit: string;
  harvestIn: number; // days
  unitsLeft: number;
  story: string;
  season: string;
  cropPractice: string;
  badge?: "temporada" | "ultimos";
};

export const products: Product[] = [
  {
    id: "jitomate",
    name: "Jitomate heirloom",
    producerSlug: "santiago",
    photo: tomato,
    price: 68,
    unit: "kilo",
    harvestIn: 3,
    unitsLeft: 14,
    story: "Sembrado el 12 de marzo. Riego por goteo con agua de lluvia captada.",
    season: "Primavera–verano",
    cropPractice: "Semilla ancestral, composta y riego por goteo con agua de lluvia captada.",
    badge: "temporada",
  },
  {
    id: "limones",
    name: "Limón criollo",
    producerSlug: "rosa",
    photo: limones,
    price: 38,
    unit: "kilo",
    harvestIn: 0,
    unitsLeft: 9,
    story: "Cortado al amanecer. Cáscara delgada, jugo perfumado.",
    season: "Otoño–invierno",
    cropPractice: "Poda manual y control biológico de plagas en la huerta.",
    badge: "ultimos",
  },
  {
    id: "cilantro",
    name: "Cilantro fresco",
    producerSlug: "santiago",
    photo: cilantro,
    price: 22,
    unit: "manojo",
    harvestIn: 1,
    unitsLeft: 28,
    story: "Cortado la mañana de la entrega. Aroma intenso, hojas tiernas.",
    season: "Todo el año",
    cropPractice: "Asociación de cultivos y composta para nutrir la tierra.",
  },
  {
    id: "chiles",
    name: "Chiles serranos y manzanos",
    producerSlug: "santiago",
    photo: chiles,
    price: 54,
    unit: "kilo",
    harvestIn: 5,
    unitsLeft: 22,
    story: "Variedades criollas. Picor medio a alto, dependiendo del sol.",
    season: "Primavera–verano",
    cropPractice: "Semilla criolla y rotación de cultivos sin químicos.",
    badge: "temporada",
  },
  {
    id: "espinaca", name: "Espinaca baby", producerSlug: "rosa", photo: espinaca,
    price: 45, unit: "kilo", harvestIn: 2, unitsLeft: 17,
    story: "Hojas tiernas cosechadas a mano.", season: "Otoño–invierno",
    cropPractice: "Coberturas vegetales y control biológico de plagas.", badge: "temporada",
  },
  {
    id: "calabaza", name: "Calabaza de castilla", producerSlug: "santiago", photo: calabaza,
    price: 32, unit: "kilo", harvestIn: 4, unitsLeft: 36,
    story: "Crecida entre surcos de tierra viva.", season: "Otoño",
    cropPractice: "Asociación de cultivos y abono verde para cuidar el suelo.", badge: "temporada",
  },
  {
    id: "ejote", name: "Ejote criollo", producerSlug: "rosa", photo: ejote,
    price: 28, unit: "kilo", harvestIn: 1, unitsLeft: 21,
    story: "Vainas frescas seleccionadas a mano.", season: "Primavera–otoño",
    cropPractice: "Coberturas vegetales y cosecha manual en su punto de madurez.",
  },
  {
    id: "lechuga", name: "Lechuga orejona", producerSlug: "santiago", photo: lechuga,
    price: 18, unit: "pieza", harvestIn: 0, unitsLeft: 24,
    story: "Hojas crujientes recién cortadas del surco.", season: "Otoño–primavera",
    cropPractice: "Composta y rotación de cultivos para mantener la tierra fértil.",
  },
];

export function getProducer(slug: string) {
  return producers[slug];
}
export function getProductsByProducer(slug: string) {
  return products.filter((p) => p.producerSlug === slug);
}

import seedlings from "@/assets/seedlings-hand.jpg";
import planting from "@/assets/planting-roots.jpg";
import harvest from "@/assets/harvest-field.jpg";
import landscape from "@/assets/field-landscape.jpg";

export type ProducerDetail = {
  story: string;
  practices: string[];
  coldChain: string;
  gallery: string[];
  /** Capas del score, cada una 0–100 (ver src/lib/score.ts) */
  components: ScoreLayers;
};

export const producerDetails: Record<string, ProducerDetail> = {
  santiago: {
    story:
      "Ezequiel heredó Seis Tierras de su abuelo. Recuperó semillas criollas que la familia guardaba en frascos y hoy siembra sin químicos, rotando cultivos como se hacía antes.",
    practices: ["Semilla criolla propia", "Composta y abono verde", "Riego por goteo con agua de lluvia", "Rotación y asociación de cultivos"],
    coldChain: "Cosecha al amanecer, cámara a 4–7 °C en el rancho y hielera térmica hasta tu puerta. Menos de 24 h del surco a tu mesa.",
    gallery: [seedlings, planting, harvest, landscape],
    components: { calificacion: 95, consistencia: 95, distribuidor: 92 },
  },
  rosa: {
    story:
      "Rosa María cuida la huerta de cítricos que plantó su padre en Galeana. Poda a mano, cosecha fruta madura y vende solo lo que la tierra da en temporada.",
    practices: ["Poda manual", "Control biológico de plagas", "Coberturas vegetales", "Cosecha en punto de madurez"],
    coldChain: "Corte en la mañana, sombra y ventilación natural; traslado refrigerado el mismo día.",
    gallery: [harvest, landscape, seedlings, planting],
    components: { calificacion: 92, consistencia: 90, distribuidor: 90 },
  },
};

export function trustScore10(slug: string) {
  const c = producerDetails[slug]?.components;
  return c ? score10(c) : 0;
}

export { scoreTone } from "@/lib/score";

/** Unidad corta para mostrar precios: "kilo" → "kg" */
export function unitLabel(unit: string) {
  return unit === "kilo" ? "kg" : unit;
}
