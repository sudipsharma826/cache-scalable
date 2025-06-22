export type FetchingFormData ={
    mode: string;
    limit: number;
};
export type FetchResult = {
  // Core response data
  success: boolean;
  data: any[];
  error?: string;
  
  // Source and metadata
  source: 'db' | 'cache' | 'hybrid';
  count: number;
  
  // Performance timing
  timing: {
    total: number;
    dbQuery: number;
    cacheRead: number;
    cacheWrite: number;
  };
  
  // Cache information
  cacheInfo: {
    hit: boolean;
    ttl?: number;
  };
  
  // Additional metrics
  fetchTimeMs: number;
  cacheStatus: 'hit' | 'miss' | 'none';
  dataSource: 'db' | 'cache' | 'hybrid';
  
  // Timestamp for when the result was generated
  timestamp: number;
  
  // Optional fields for display
  message?: string;
};