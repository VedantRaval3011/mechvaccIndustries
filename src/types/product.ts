// types/product.ts
export interface Specification {
  title: string;
  value: string;
}

export interface Query {
  title: string;
  type: 'number' |'string'  ;
}

// types/product.ts
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
  specifications?: Array<{
    title: string;
    value: string;
    _id?: string;
  }>;
  queries?: Query[];
  __v?: number;
}