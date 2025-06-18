import Redis from 'ioredis';

// Types
export type RedisClient = Redis;
export type FetchMode = 'db' | 'cache' | 'hybrid';

// Redis Client
export const client = new Redis(process.env.UNSTASH_REDIS_URL || "redis://localhost:6379");

// Simple Redis connection helper
async function withRedis<T>(fn: (client: RedisClient) => Promise<T>): Promise<T> {
  try {
    if (client.status !== 'ready') {
      await client.connect();
    }
    return await fn(client);
  } catch (error) {
    console.error('Redis error:', error);
    throw error;
  }
}
