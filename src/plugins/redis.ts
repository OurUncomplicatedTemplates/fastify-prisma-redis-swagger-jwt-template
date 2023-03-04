import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyRedis, { FastifyRedis } from "@fastify/redis";
import Redis from "ioredis";

declare module "fastify" {
    interface FastifyRequest {
        redis: FastifyRedis;
    }
}

declare module "ioredis" {
    interface Redis {
        remember(
            key: string,
            ttl: number,
            callback: () => string | Promise<string>
        ): Promise<string>;
        rememberJSON<T>(
            key: string,
            ttl: number,
            callback: () => T | Promise<void | T>
        ): Promise<T>;
        invalidateCaches(...keys: string[]): Promise<void>;
    }
}

export let redis: Redis;

export default fastifyPlugin(
    async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
        redis = new Redis({
            host: fastify.config.REDIS_HOST,
            password: fastify.config.REDIS_PASSWORD,
        });

        redis.remember = async (key, ttl, callback) => {
            let value = await fastify.redis.get(key);

            if (value !== null) {
                return value;
            }

            value = await callback();

            await fastify.redis.setex(key, ttl, value);

            return value;
        };

        redis.rememberJSON = async (key, ttl, callback) => {
            return JSON.parse(
                await fastify.redis.remember(key, ttl, async () => {
                    return JSON.stringify(await callback());
                })
            );
        };

        redis.invalidateCaches = async (...keys) => {
            await Promise.all(
                keys.map(async (key) => {
                    await fastify.redis.del(key);
                })
            );
        };

        await fastify.register(fastifyRedis, { client: redis });

        fastify.addHook("preHandler", (req, reply, next) => {
            req.redis = fastify.redis;
            return next();
        });

        fastify.addHook("onClose", async (fastify) => {
            redis.disconnect();
        });
    },
    { dependencies: ["config"] }
);
