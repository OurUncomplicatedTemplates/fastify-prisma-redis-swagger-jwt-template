import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import Redis from "ioredis";
import { v4 } from "uuid";

declare module "fastify" {
    interface FastifyRequest {
        redis: Redis;
    }
    interface FastifyInstance {
        redis: Redis;
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
    async (fastify: FastifyInstance) => {
        redis = new Redis(fastify.config.REDIS_URL, {
            keyPrefix:
            fastify.config.NODE_ENV === "test"
                ? /* istanbul ignore next */ v4()
                : /* istanbul ignore next */ undefined,
        });

        redis.remember = async (key, ttl, callback) => {
            let value = await redis.get(key);

            if (value !== null) {
                return value;
            }

            value = await callback();

            await redis.setex(key, ttl, value);

            return value;
        };

        redis.rememberJSON = async (key, ttl, callback) => {
            return JSON.parse(
                await redis.remember(key, ttl, async () => {
                    return JSON.stringify(await callback());
                })
            );
        };

        redis.invalidateCaches = async (...keys) => {
            await Promise.all(
                keys.map(async (key) => {
                    await redis.del(key);
                })
            );
        };

        fastify.decorate("redis", redis);
        fastify.decorateRequest("redis", {
            getter: /* istanbul ignore next */ () => redis,
        });

        fastify.addHook("onClose", async () => {
            redis.disconnect();
        });
    },
    { dependencies: ["config"] }
);
