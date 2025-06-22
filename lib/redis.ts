import Redis from 'ioredis';
export const client = new Redis(process.env.UNSTASH_REDIS_URL || "redis://localhost:6379");
