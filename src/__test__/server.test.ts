import { FastifyInstance } from "fastify";

describe("GET /api/health", () => {
    let fastify: FastifyInstance;

    beforeAll(async () => {
        fastify = global.fastify;
    });

    it("should return status 200", async () => {
        const response = await fastify.inject({
            method: "GET",
            url: "/api/health",
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: "OK" });
    });
});
