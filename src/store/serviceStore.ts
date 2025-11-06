import { create } from 'zustand';

interface Service {
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
  applications?: string;
  customSections?: { title: string; content: string }[];
  specifications?: { title: string; value: string }[];
  queries?: { title: string; type: string }[];
}

interface ServiceStore {
  services: Service[];
  setServices: (services: Service[]) => void;
  getServiceBySlug: (slug: string) => Service | undefined;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  setServices: (services) => set({ services }),
  getServiceBySlug: (slug) => {
    const createSlug = (name: string): string =>
      name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    return get().services.find((s) => createSlug(s.name) === slug);
  },
}));