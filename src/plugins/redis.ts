import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyRedis, { FastifyRedis } from "@fastify/redis";

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

export default fastifyPlugin(
    async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
        await fastify.register(fastifyRedis, {
            host: fastify.config.REDIS_HOST,
            password: fastify.config.REDIS_PASSWORD,
        });

        fastify.redis.remember = async (key, ttl, callback) => {
            let value = await fastify.redis.get(key);

            if (value !== null) {
                return value;
            }

            value = await callback();

            await fastify.redis.setex(key, ttl, value);

            return value;
        };

        fastify.redis.rememberJSON = async (key, ttl, callback) => {
            return JSON.parse(
                await fastify.redis.remember(key, ttl, async () => {
                    return JSON.stringify(await callback());
                })
            );
        };

        fastify.redis.invalidateCaches = async (...keys) => {
            await fastify.redis.del(keys);
        };

        fastify.addHook("preHandler", (req, reply, next) => {
            req.redis = fastify.redis;
            return next();
        });
    },
    { dependencies: ["config"] }
);
