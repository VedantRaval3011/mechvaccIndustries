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

export interface Service {
  _id: string;
  name: string;
  displayTitle: string;
  group: string;
  price?: number;
  priceLabel?: string;
  description?: string;
  displayImage: string;
  additionalImages?: string[];
  video?: string;
  pdf?: string;
  seoKeywords?: string;
  applications?: string;
  customSections?: CustomSection[];
  specifications: Specification[];
  queries: Query[];
  __v?: number;
}