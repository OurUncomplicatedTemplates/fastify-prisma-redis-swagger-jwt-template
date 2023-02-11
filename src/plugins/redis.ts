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

        fastify.addHook("preHandler", (req, reply, next) => {
            req.redis = fastify.redis;
            return next();
        });
    },
    { dependencies: ["config"] }
);
