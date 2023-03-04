import { FastifyInstance } from "fastify";
import { build } from "../index";

declare global {
    var fastify: FastifyInstance;
}

beforeAll(async () => {
    global.fastify = await build();
});

afterAll(async () => {
    await global.fastify.close();
});
