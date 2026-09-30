import santiago from "@/assets/producer-santiago.jpg";
import rosa from "@/assets/producer-rosa.jpg";
import tomato from "@/assets/product-tomato.jpg";
import limones from "@/assets/product-limones.jpg";
import cilantro from "@/assets/product-cilantro.jpg";
import chiles from "@/assets/product-chiles.jpg";

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
    score: 94,
    years: 12,
    note: "Esta semana el jitomate salió más chico porque llovió menos, pero está más dulce. Cosecho lo que ustedes piden — ni un kilo más.",
    metrics: [
      { label: "Cultivos activos", value: "7" },
      { label: "Score de confianza", value: "94 / 100" },
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
    score: 91,
    years: 18,
    note: "El limón este año salió con cáscara más gruesa por el frío de marzo, pero el jugo está más perfumado. Corto en la mañana, llega a tu casa el mismo día.",
    metrics: [
      { label: "Cultivos activos", value: "5" },
      { label: "Score de confianza", value: "91 / 100" },
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
    badge: "temporada",
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
  // each 0-100
  components: { rating: number; profile: number; onTime: number; waste: number };
};

export const producerDetails: Record<string, ProducerDetail> = {
  santiago: {
    story:
      "Ezequiel heredó Seis Tierras de su abuelo. Recuperó semillas criollas que la familia guardaba en frascos y hoy siembra sin químicos, rotando cultivos como se hacía antes.",
    practices: ["Semilla criolla propia", "Composta y abono verde", "Riego por goteo con agua de lluvia", "Rotación y asociación de cultivos"],
    coldChain: "Cosecha al amanecer, cámara a 8 °C en el rancho y hielera térmica hasta tu puerta. Menos de 24 h del surco a tu mesa.",
    gallery: [seedlings, planting, harvest, landscape],
    components: { rating: 96, profile: 95, onTime: 92, waste: 88 },
  },
  rosa: {
    story:
      "Rosa María cuida la huerta de cítricos que plantó su padre en Galeana. Poda a mano, cosecha fruta madura y vende solo lo que la tierra da en temporada.",
    practices: ["Poda manual", "Control biológico de plagas", "Coberturas vegetales", "Cosecha en punto de madurez"],
    coldChain: "Corte en la mañana, sombra y ventilación natural; traslado refrigerado el mismo día.",
    gallery: [harvest, landscape, seedlings, planting],
    components: { rating: 90, profile: 85, onTime: 80, waste: 70 },
  },
};

export function trustScore10(slug: string) {
  const c = producerDetails[slug]?.components;
  if (!c) return 0;
  return Math.round((c.rating * 0.4 + c.profile * 0.3 + c.onTime * 0.2 + c.waste * 0.1) / 10 * 10) / 10;
}

export function scoreTone(score: number) {
  if (score >= 8) return "bg-primary text-primary-foreground";
  if (score >= 6) return "bg-miel text-ink";
  return "bg-destructive text-destructive-foreground";
}
