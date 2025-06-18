export type FetchingFormData = {
  mode: 'db' | 'cache' | 'hybrid';
  limit: number;
};

export interface FetchResult {
  data: Product[];
  responseTime: number;
  mode: string;
  limit: number;
  cacheHit?: boolean;
  error?: string;
}

export interface Product {
  _id?: string;
  id: string;
  name: string;
  price: number;
  description: string;
  company: string;
  avatar: string;
  material: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  __v?: number;
}

export interface CachedProduct extends Omit<Product, '_id'> {
  _id: string;
}

export interface ResponseTimeMetric {
  timestamp: number;
  mode: 'db' | 'cache' | 'hybrid';
  responseTime: number;
}

export interface CacheInfo {
  count: number;
  ttl: number;
}

export interface ResponseTimeStats {
  db: number[];
  cache: number[];
  hybrid: number[];
}