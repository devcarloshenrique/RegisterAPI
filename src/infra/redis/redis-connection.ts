import { Redis, RedisOptions } from 'ioredis';
import { env } from '../../env';

let _instance: Redis | null = null;

export function getRedis(): Redis {
  if (_instance) return _instance;

  const opts: RedisOptions = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    maxRetriesPerRequest: null,
  };

  _instance = new Redis(opts);
  return _instance;
}
