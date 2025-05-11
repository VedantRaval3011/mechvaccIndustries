import { create } from 'zustand';

interface Product {
  _id: string;
  name: string;
  displayTitle: string;
  group: string;
  price?: number;
  priceLabel?: string;
  description?: string;
  displayImage?: string;
  additionalImages?: string[];
  video?: string;
  pdf?: string;
  seoKeywords?: string;
  specifications?: { title: string; value: string }[];
  queries?: { title: string; type: string; value?: string }[];
}

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  getProductBySlug: (slug: string) => Product | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  setProducts: (products) => set({ products }),
  getProductBySlug: (slug) => {
    const createSlug = (name: string): string =>
      name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    return get().products.find((p) => createSlug(p.name) === slug);
  },
}));