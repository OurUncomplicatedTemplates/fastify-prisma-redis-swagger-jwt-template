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
});
