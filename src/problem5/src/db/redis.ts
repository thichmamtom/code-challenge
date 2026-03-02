import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;
let isConnected = false;

export function getRedis(): Redis | null {
  // Singleton pattern for global access
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      lazyConnect: true,
    });

    redis.on('connect', () => {
      isConnected = true;
    });

    redis.on('error', (err) => {
      isConnected = false;
    });

    redis.on('close', () => {
      isConnected = false;
    });
  }

  return isConnected ? redis : null;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit().catch(() => {});
    redis = null;
    isConnected = false;
  }
}
