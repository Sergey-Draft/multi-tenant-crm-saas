import type { ConnectionOptions } from 'bullmq';
import IORedis, { type RedisOptions } from 'ioredis';

function buildRedisOptions(): RedisOptions {
  const maxRetriesPerRequest = null;
  const url = process.env.REDIS_URL?.trim();

  if (!url) {
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest,
    };
  }

  try {
    const parsed = new URL(url);

    return {
      host: parsed.hostname || 'localhost',
      port: parsed.port ? Number(parsed.port) : 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      db:
        parsed.pathname && parsed.pathname !== '/'
          ? Number(parsed.pathname.slice(1))
          : undefined,
      maxRetriesPerRequest,
    };
  } catch {
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest,
    };
  }
}

const redisOptions = buildRedisOptions();

export function getRedisConnectionOptions(): ConnectionOptions {
  return redisOptions as ConnectionOptions;
}

export const redisClient = new IORedis(redisOptions);
