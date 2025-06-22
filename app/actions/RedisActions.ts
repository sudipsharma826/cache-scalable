// app/actions/RedisActions.ts
"use server";

import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/ProductModels";
import { client } from "@/lib/redis";

export interface RedisKeyInfo {
  key: string;
  type: string;
  ttl: number;
  size: number;
  length?: number;
  value?: any;
}

export async function getRedisInfo() {
  if (typeof window !== 'undefined') return {};
  try {
    const info = await client.info();
    return info.split('\r\n').reduce((acc: Record<string, string>, line) => {
      const [key, value] = line.split(':');
      if (key && value) acc[key] = value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Redis info error:', error);
    return {};
  }
}

export async function getProductsKeyInfo(): Promise<RedisKeyInfo | null> {
  if (typeof window !== 'undefined') return null;
  try {
    const type = await client.type('products');
    const ttl = await client.ttl('products');
    const sampleData = type === 'list' ? await client.lrange('products', 0, 4) : [];
    const size = sampleData.reduce((acc, item) => acc + Buffer.byteLength(JSON.stringify(item)), 0);
    const length = type === 'list' ? await client.llen('products') : 0;
    
    return { 
      key: 'products',
      type,
      ttl,
      size,
      length,
      value: sampleData
    };
  } catch (error) {
    console.error('Products key error:', error);
    return null;
  }
}

export async function clearProductsKey() {
  if (typeof window !== 'undefined') return false;
  try {
    await client.del('products');
    return true;
  } catch (error) {
    console.error('Clear products error:', error);
    return false;
  }
}

export interface LoadDataResult {
  success: boolean;
  data?: any[];
  cacheHit?: boolean;
  responseTime?: number;
  dbQueryTime?: number;
  count?: number;
  error?: string;
  cacheInfo?: {
    hit: boolean;
    ttl?: number;
  };
}

export async function loadData(limit: number = 10): Promise<LoadDataResult> {
  if (typeof window !== 'undefined') {
    return { success: false, error: 'Cannot run on client side' };
  }

  const startTime = Date.now();
  const result: LoadDataResult = {
    success: false,
    cacheHit: false,
    responseTime: 0,
    count: 0,
    cacheInfo: {
      hit: false,
      ttl: 0
    }
  };
  
  try {
    // Check cache first
    const cachedData = await client.lrange('products', 0, limit - 1);
    
    if (cachedData.length > 0) {
      const parsedData = cachedData.map(item => {
        try {
          return JSON.parse(item);
        } catch (e) {
          console.error('Error parsing cached item:', e);
          return null;
        }
      }).filter(Boolean);
      
      const ttl = await client.ttl('products');
      const responseTime = Date.now() - startTime;
      
      // Ensure all data is serializable
      const serializedData = JSON.parse(JSON.stringify(parsedData));
      
      return {
        success: true,
        data: serializedData,
        cacheHit: true,
        responseTime,
        count: serializedData.length,
        cacheInfo: {
          hit: true,
          ttl
        },
        dbQueryTime: 0
      };
    }
    
    // If no cache, load from database
    await connectDB();
    
    const dbStartTime = Date.now();
    const dbData = await ProductModel.find({}).limit(limit).lean();
    const dbQueryTime = Date.now() - dbStartTime;
    
    if (dbData.length > 0) {
      // Cache the results
      const stringifiedData = dbData.map(item => JSON.stringify(item));
      await client.del('products');
      await client.rpush('products', ...stringifiedData);
      await client.expire('products', 60 * 60 * 24); // 24 hours
      
      // Get cache info after setting
      const ttl = await client.ttl('products');
      const totalTime = Date.now() - startTime;
      
      // Ensure all data is serializable
      const serializedData = JSON.parse(JSON.stringify(dbData));
      
      return {
        success: true,
        data: serializedData,
        cacheHit: false,
        responseTime: totalTime,
        dbQueryTime,
        count: serializedData.length,
        cacheInfo: {
          hit: false,
          ttl
        }
      };
    }
    
    return { 
      success: false,
      error: 'No data found in database',
      responseTime: Date.now() - startTime,
      cacheHit: false,
      count: 0,
      cacheInfo: {
        hit: false,
        ttl: 0
      }
    };
    
  } catch (error) {
    console.error('Error in loadData:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      responseTime: Date.now() - startTime,
      cacheHit: false,
      count: 0,
      cacheInfo: {
        hit: false,
        ttl: 0
      }
    };
  }
}

export async function clearCache(): Promise<{ success: boolean; message: string }> {
  if (typeof window !== 'undefined') {
    return { success: false, message: 'Cannot run on client side' };
  }

  try {
    const keys = await client.keys('*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return { success: true, message: 'Cache cleared successfully' };
  } catch (error) {
    console.error('Error clearing cache:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to clear cache' 
    };
  }
}