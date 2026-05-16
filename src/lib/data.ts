import santiago from "@/assets/producer-santiago.jpg";
import rosa from "@/assets/producer-rosa.jpg";
import tomato from "@/assets/product-tomato.jpg";
import honey from "@/assets/product-honey.jpg";
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
    name: "Santiago Treviño",
    region: "Ramos Arizpe, Coahuila",
    practice: "Frutas y verduras agroecológicas",
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
    practice: "Miel agroecológica de floración silvestre",
    photo: rosa,
    score: 91,
    years: 18,
    note: "La floración de mezquite empezó tarde este año. La miel viene más oscura, con cuerpo. Es la favorita de mis nietos.",
    metrics: [
      { label: "Colmenas activas", value: "32" },
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
  badge?: "miel" | "temporada" | "ultimos";
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
    id: "miel",
    name: "Miel de mezquite",
    producerSlug: "rosa",
    photo: honey,
    price: 240,
    unit: "frasco 500g",
    harvestIn: 0,
    unitsLeft: 5,
    story: "Cosechada al amanecer del 8 de mayo. Sin filtrar industrialmente.",
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
