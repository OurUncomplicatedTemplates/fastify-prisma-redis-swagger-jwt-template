import { FastifyInstance } from "fastify";
import { build } from "../index";

declare global {
    var fastify: FastifyInstance;
}

jest.mock("../plugins/prisma");
jest.mock("../plugins/redis");

beforeAll(async () => {
    try {
        global.fastify = await build();
    } catch (e) {
        console.error(e);
    }
});

afterAll(async () => {
    await global.fastify.close();
});
