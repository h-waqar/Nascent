import { Product, Category } from "@/types/models";

/**
 * Canonical Mock Data (D-05, D-08)
 * This file serves as the temporary database for UI development.
 * All records must strictly follow the interfaces defined in @/types/models.
 */

export const CATEGORIES: Category[] = [
  {
    id: "cat-01",
    slug: "signature-collection",
    name: "Signature Collection",
    description: "The core olfactory identities of Nascent. Timeless, clinical, and precise.",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "cat-02",
    slug: "monochrome-series",
    name: "Monochrome Series",
    description: "Fragrances explored through a single, dominant note.",
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: "cat-03",
    slug: "discovery-sets",
    name: "Discovery Sets",
    description: "Curated selections to explore the Nascent spectrum.",
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-01",
    slug: "ink-paper",
    name: "Ink & Paper",
    description: "A clinical exploration of cedarwood, vetiver, and a cold metallic accord. Mimics the scent of a fresh luxury publication.",
    price: 120,
    stock: 24,
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000"
    ],
    scentNotes: ["Cedarwood", "Vetiver", "ISO E Super", "Metal"],
    categoryId: "cat-01",
    isFeatured: true,
  },
  {
    id: "prod-02",
    slug: "concrete-bloom",
    name: "Concrete Bloom",
    description: "The contrast between harsh brutalist architecture and the fragile iris flower. Cold, powdery, and industrial.",
    price: 145,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000"
    ],
    scentNotes: ["Iris", "Gunpowder", "Concrete Accord", "Ambroxan"],
    categoryId: "cat-01",
    isFeatured: true,
  },
  {
    id: "prod-03",
    slug: "absolute-zero",
    name: "Absolute Zero",
    description: "The olfactory representation of silence. A sharp, freezing blast of peppermint and frankincense.",
    price: 95,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc206e?auto=format&fit=crop&q=80&w=1000"
    ],
    scentNotes: ["Peppermint", "Frankincense", "White Musk"],
    categoryId: "cat-02",
  },
  {
    id: "prod-04",
    slug: "vanta-black",
    name: "Vanta Black",
    description: "The darkest oud fragrance in our collection. Smoked leather and intense amber.",
    price: 210,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000"
    ],
    scentNotes: ["Oud", "Cypriol", "Leather", "Birch Tar"],
    categoryId: "cat-02",
    isFeatured: true,
  },
];
