"use server";

import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/ProductModels";
import { client } from "@/lib/redis";
import { FetchingFormData } from "@/lib/types";
import { saveFetchTiming } from "@/app/actions/ReportFetching";

export interface FetchDataResponse {
  success: boolean;
  data?: any[];
  error?: string;
  source?: 'database' | 'cache' | 'hybrid';
  count?: number;
  timing?: {
    total: number;
    dbQuery?: number;
    cacheRead?: number;
    cacheWrite?: number;
  };
  cacheInfo?: {
    hit: boolean;
    ttl?: number;
  };
}

export async function fetchData(data: FetchingFormData): Promise<FetchDataResponse> {
  const { mode, limit = 10 } = data;
  console.log(`[${new Date().toISOString()}] Fetching data with mode: ${mode}, limit: ${limit}`);

  const startTime = Date.now();
  let dbQueryStart = 0;
  let cacheReadStart = 0;
  let cacheWriteStart = 0;
  
  const response: FetchDataResponse = {
    success: false,
    source: mode as 'database' | 'cache' | 'hybrid',
    cacheInfo: { hit: false },
    timing: {
      total: 0,
      dbQuery: 0,
      cacheRead: 0,
      cacheWrite: 0
    }
  };
  
  const updateTotalTime = () => {
    if (response.timing) {
      response.timing.total = Date.now() - startTime;
    }
  };
  
  const timeOperation = async <T>(operation: () => Promise<T>, timeRef: keyof NonNullable<FetchDataResponse['timing']>): Promise<T> => {
    const start = Date.now();
    try {
      return await operation();
    } finally {
      if (response.timing) {
        response.timing[timeRef] = (response.timing[timeRef] || 0) + (Date.now() - start);
      }
    }
  };

  try {
    switch (mode) {
      case "db": {
        // Database operation
        const dbData = await timeOperation(async () => {
          await connectDB();
          return await ProductModel.find({}).limit(limit).lean();
        }, 'dbQuery');
        
        if (dbData.length > 0) {
          // Cache write operation
          await timeOperation(async () => {
            const stringifiedData = dbData.map(item => JSON.stringify(item));
            await client.del("products");
            await client.lpush("products", ...stringifiedData);
            await client.expire("products", 60 * 60 * 24);
          }, 'cacheWrite');
          
          response.success = true;
          response.data = dbData;
          response.count = dbData.length;
          response.source = 'database';
          response.cacheInfo = { hit: false };
        } else {
          response.error = 'No data found in database';
        }
        break;
      }

      case "cache": {
        // Cache read operation
        const cachedData = await timeOperation(
          () => client.lrange("products", 0, limit - 1),
          'cacheRead'
        );
        
        if (cachedData.length > 0) {
          const parsedData = cachedData.map(item => {
            try {
              return JSON.parse(item);
            } catch (e) {
              console.error('Error parsing cached item:', e);
              return null;
            }
          }).filter(Boolean);
          
          // Get TTL
          const ttl = await timeOperation(
            () => client.ttl("products"),
            'cacheRead'
          );
          
          response.success = true;
          response.data = parsedData;
          response.count = parsedData.length;
          response.source = 'cache';
          response.cacheInfo = {
            hit: true,
            ttl
          };
        } else {
          response.error = 'No data found in cache';
        }
        break;
      }

      case "hybrid": {
        // First try to get from cache
        const cachedData = await timeOperation(
          () => client.lrange("products", 0, limit - 1),
          'cacheRead'
        );

        if (cachedData.length >= limit) {
          // Cache HIT: enough data in cache
          const parsedData = cachedData.map(item => JSON.parse(item)).slice(0, limit);
          const ttl = await timeOperation(
            () => client.ttl("products"),
            'cacheRead'
          );

          response.success = true;
          response.data = parsedData;
          response.count = parsedData.length;
          response.source = 'cache';
          response.cacheInfo = {
            hit: true,
            ttl
          };
        } else {
          // Cache MISS: not enough data in cache, get the rest from DB
          const parsedCached = cachedData.map(item => JSON.parse(item));
          const remainingLimit = limit - parsedCached.length;

          // Only fetch from DB if we need more data
          let dbData: any[] = [];
          if (remainingLimit > 0) {
            dbData = await timeOperation(async () => {
              await connectDB();
              return await ProductModel.find({}).limit(remainingLimit).lean();
            }, 'dbQuery');
          }

          const combinedData = [...parsedCached, ...dbData];

          // Update cache with combined data if we got new data from DB
          if (dbData.length > 0) {
            await timeOperation(async () => {
              const stringifiedData = combinedData.map(item => JSON.stringify(item));
              await client.del("products");
              await client.lpush("products", ...stringifiedData);
              await client.expire("products", 60 * 60 * 24);
            }, 'cacheWrite');
          }

          // Get final TTL
          const ttl = await timeOperation(
            () => client.ttl("products"),
            'cacheRead'
          );

          response.success = true;
          response.data = combinedData;
          response.count = combinedData.length;
          response.source = 'hybrid';
          response.cacheInfo = {
            hit: false, // Mark as cache miss
            ttl
          };
        }
        break;
      }

      default:
        response.error = 'Invalid mode specified. Use "db", "cache", or "hybrid"';
        break;
    }

    // Update total time and log results
    updateTotalTime();

    // Save timing to Redis for reporting
    try {
      await saveFetchTiming(mode, {
        timestamp: Date.now(),
        total: response.timing?.total || 0,
      });
    } catch (timingErr) {
      console.error("Failed to record timing in Redis:", timingErr);
    }

    console.log(`[${new Date().toISOString()}] ${mode} fetch completed in ${response.timing?.total}ms`, 
      response.success ? `(found ${response.count} items)` : `(error: ${response.error})`,
      `\nTiming details: ${JSON.stringify(response.timing, null, 2)}`
    );

    return response;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[${new Date().toISOString()}] Error in fetchData (${mode}):`, error);
    
    return {
      success: false,
      error: `Failed to fetch data: ${errorMessage}`,
      source: mode as 'database' | 'cache' | 'hybrid',
      cacheInfo: { hit: false }
    };
  }
}
