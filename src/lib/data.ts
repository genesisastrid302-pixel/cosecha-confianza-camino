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
  /** Ubicación aproximada del campo [lat, lng], para el mapa de ruta */
  coords: [number, number];
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
    coords: [25.5418, -100.9474],
    practice: "Verduras agroecológicas de semilla ancestral",
    photo: santiago,
    score: 9.6,
    years: 12,
    note: "Esta semana el jitomate salió más chico porque llovió menos, pero está más dulce. Cosecho lo que ustedes piden — ni un kilo más.",
    metrics: [
      { label: "Cultivos activos", value: "7" },
      { label: "Score de confianza", value: "9.6/10" },
      { label: "Familias servidas", value: "184" },
      { label: "Distancia a tu mesa", value: "98 km" },
    ],
  },
  rosa: {
    slug: "rosa",
    name: "Rosa María Lozano",
    region: "Galeana, Nuevo León",
    coords: [24.8253, -100.075],
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
  /** Precio por kg en productos que se venden por kilo o por gramo; por pieza o manojo en los demás */
  price: number;
  /** "gramo" = se pide por gramos (en pasos de `paso`); la cantidad del carrito y del pedido va en gramos */
  unit: string;
  /** Gramos de cada paso y mínimo a pedir, en productos por gramo */
  paso?: number;
  harvestIn: number; // days
  /** Existencia: kg en productos por kilo o por gramo; piezas o manojos en los demás */
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
    unit: "gramo", paso: 250,
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
    unit: "gramo", paso: 250,
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
    unit: "gramo", paso: 100,
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
    price: 28, unit: "gramo", paso: 250, harvestIn: 1, unitsLeft: 21,
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
/** Otros cultivos del Mercado: primero del mismo productor y luego de la misma temporada */
export function productosRelacionados(id: string, max = 6) {
  const base = products.find((p) => p.id === id);
  if (!base) return [];
  const afinidad = (p: Product) => (p.producerSlug === base.producerSlug ? 2 : 0) + (p.season === base.season ? 1 : 0);
  return products
    .filter((p) => p.id !== id)
    .sort((a, b) => afinidad(b) - afinidad(a))
    .slice(0, max);
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
    components: { calificacion: 95, consistencia: 100, distribuidor: 92 },
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
export function unitLabel(unit: string, cantidad = 1) {
  if (unit === "kilo") return "kg";
  if (unit === "gramo") return "g";
  return cantidad === 1 ? unit : `${unit}s`;
}

/** Unidad en la que se muestra el precio: por gramo también se compara por kg */
export const unidadPrecio = (unit: string) => (unit === "kilo" || unit === "gramo" ? "kg" : unit);

/** "250 g", "1.25 kg", "2 kg", "3 manojos" */
export function cantidadTexto(unit: string, cantidad: number) {
  if (unit === "gramo") return cantidad < 1000 ? `${cantidad} g` : `${+(cantidad / 1000).toFixed(2)} kg`;
  return `${cantidad} ${unitLabel(unit, cantidad)}`;
}

/** Lo que cuesta esa cantidad (por gramo el precio es por kg) */
export const importe = (price: number, unit: string, cantidad: number) =>
  unit === "gramo" ? Math.round((price * cantidad) / 10) / 100 : price * cantidad;

/** "$186" o "$9.50": centavos solo cuando los hay (al pedir por gramos) */
export const dinero = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

/** Suma importes sin arrastrar errores de punto flotante */
export const sumar = (montos: number[]) => Math.round(montos.reduce((a, b) => a + b, 0) * 100) / 100;

/** Cuánto suma cada toque de + y cuánto es lo mínimo */
export const pasoDe = (p: Pick<Product, "unit" | "paso">) => (p.unit === "gramo" ? (p.paso ?? 250) : 1);

/** Existencia del cultivo: "14 kg" (también en productos por gramo), "28 manojos" */
export const existenciaTexto = (p: Pick<Product, "unit" | "unitsLeft">) =>
  p.unit === "gramo" ? `${p.unitsLeft} kg` : `${p.unitsLeft} ${unitLabel(p.unit, p.unitsLeft)}`;

/** Cantidad de un pedido en la unidad de la existencia (gramos → kg) */
export const enUnidadDeExistencia = (unit: string, cantidad: number) => (unit === "gramo" ? cantidad / 1000 : cantidad);

/** Máximo que se puede pedir, en la misma unidad que la cantidad del carrito */
export const maximoDe = (p: Pick<Product, "unit" | "unitsLeft">) => (p.unit === "gramo" ? p.unitsLeft * 1000 : p.unitsLeft);
