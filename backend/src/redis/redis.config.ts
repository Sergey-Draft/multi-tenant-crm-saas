import type { RedisOptions } from 'ioredis';

function getRedisConnectionOptions(): RedisOptions {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);

    return {
      host: url.hostname,
      port: Number(url.port || 6379),
      password: url.password || undefined,
      username: url.username || undefined,
      maxRetriesPerRequest: null,
    };
  }

  return {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
  };
}

export const redisConnectionOptions = getRedisConnectionOptions();
