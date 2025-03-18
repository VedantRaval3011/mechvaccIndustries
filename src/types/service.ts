// types/service.ts
export interface Specification {
    title: string;
    value: string;
  }
  
  export interface Query {
    title: string;
    type: 'number' | 'string';
  }
  
  export interface Service {
    _id: string;
    name: string;
    displayTitle: string;
    group: string;
    price: number;
    priceLabel?: string;
    description?: string;
    displayImage: string;
    additionalImages: string[];
    video?: string;
    pdf?: string;
    seoKeywords?: string;
    specifications: Specification[];
    queries: Query[];
  }