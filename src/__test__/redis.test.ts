import { FastifyInstance } from "fastify";
import { build } from "../index";

describe("remember()", () => {
    let fastify: FastifyInstance;

    beforeAll(async () => {
        fastify = await build();
    });

    afterAll(async () => {
        await fastify.close();
    });

    it("should return callback value, if not cached", async () => {
        await fastify.redis.del("key");

        const value = await fastify.redis.remember("key", 10, () => {
            return "Callback value";
        });

        expect(value).toEqual("Callback value");
    });

    it("should return cached value", async () => {
        await fastify.redis.set("key", "Cached value");

        const value = await fastify.redis.remember("key", 10, () => {
            return "Callback value";
        });

        expect(value).toEqual("Cached value");
    });

    it("should return callback JSON value, if not cached", async () => {
        await fastify.redis.del("key");

        const value = await fastify.redis.rememberJSON("key", 10, () => {
            return [
                {
                    id: "1000",
                    name: "Christian",
                    address: "Christian Ave. 108",
                },
            ];
        });

        expect(value).toEqual([
            {
                id: "1000",
                name: "Christian",
                address: "Christian Ave. 108",
            },
        ]);
    });

    it("should return cached JSON value", async () => {
        await fastify.redis.set(
            "key",
            JSON.stringify({
                id: "1000",
                name: "Christian",
                address: "Christian Ave. 108",
            })
        );

        const value = await fastify.redis.rememberJSON("key", 10, () => {
            return {
                id: "1001",
                name: "Frederik",
                address: "Frederik Ave. 109",
            };
        });

        expect(value).toEqual({
            id: "1000",
            name: "Christian",
            address: "Christian Ave. 108",
        });
    });

    it("should return callback generic value, if not cached", async () => {
        await fastify.redis.del("key");

        const value = await fastify.redis.rememberJSON<{
            id: number;
            name: string;
            address: string;
        }>("key", 10, () => {
            return {
                id: 1000,
                name: "Christian",
                address: "Christian Ave. 108",
            };
        });

        expect(value.id).toEqual(1000);
        expect(value.name).toEqual("Christian");
        expect(value.address).toEqual("Christian Ave. 108");
    });

    it("should return cached value, when setting new generic value", async () => {
        await fastify.redis.set(
            "key",
            JSON.stringify({
                id: 1000,
                name: "Christian",
                address: "Christian Ave. 108",
            })
        );

        const value = await fastify.redis.rememberJSON<{
            id: number;
            name: string;
            address: string;
        }>("key", 10, () => {
            return {
                id: 1001,
                name: "Frederik",
                address: "Frederik Ave. 109",
            };
        });

        expect(value.id).toEqual(1000);
        expect(value.name).toEqual("Christian");
        expect(value.address).toEqual("Christian Ave. 108");
    });

    it("should invalidate all caches set new", async () => {
        await fastify.redis.del("key");
        await fastify.redis.del("key2");

        await fastify.redis.set("key", "Cached Value");
        await fastify.redis.set(
            "key2",
            JSON.stringify({
                id: "1000",
                name: "Christian",
                address: "Christian Ave. 108",
            })
        );

        await fastify.redis.invalidateCaches("key", "key2");

        const value = await fastify.redis.remember("key", 10, () => {
            return "Newest Value";
        });

        const value2 = await fastify.redis.rememberJSON<{
            id: number;
            name: string;
            address: string;
        }>("key2", 10, () => {
            return {
                id: 1001,
                name: "Frederik",
                address: "Frederik Ave. 109",
            };
        });

        expect(value).toEqual("Newest Value");

        expect(value2.id).toEqual(1001);
        expect(value2.name).toEqual("Frederik");
        expect(value2.address).toEqual("Frederik Ave. 109");
    });
});
