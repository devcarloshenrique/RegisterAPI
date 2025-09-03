import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['dev','test', 'production']).default('dev'),
    PORT: z.coerce.number().default(3333),    
    JWT_SECRET: z.string(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string(),
    REDIS_DB: z.coerce.number().default(0),
    QUEUE_PREFIX: z.string().default('registerapi'),
    BULLMQ_CONCURRENCY: z.coerce.number().default(4),
    BULLMQ_ATTEMPTS: z.coerce.number().default(5),
    BULLMQ_BACKOFF_MS: z.coerce.number().default(10000),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
    console.error('Invalid environment variable', _env.error.format())

    throw new Error('Invalid environment varaibles')
}

export const env = _env.data