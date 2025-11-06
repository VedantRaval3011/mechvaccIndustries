// types/product.ts
export interface Specification {
  title: string;
  value: string;
}

export interface Query {
  title: string;
  type: 'number' | 'string';
}

export interface CustomSection {
     title: string;
     content: string;
   }

export interface Product {
  _id: string;
  name: string;
  displayTitle: string;
  group: string;
  price?: number;
  displayImage: string;
  additionalImages?: string[];
  video?: string;
  pdf?: string;
  seoKeywords?: string;
  description?: string;
  priceLabel?: string;
  applications?: string; // New field for applications
  customSections?: CustomSection[];
  specifications?: Array<{
    title: string;
    value: string;
    _id?: string;
  }>;
  queries?: Query[];
  __v?: number;
}