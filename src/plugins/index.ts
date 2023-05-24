import { FastifyInstance } from "fastify";

import fastifyPlugin from "fastify-plugin";
import config from "./config";
import sensible from "./sensible";
import prisma from "./prisma";
import redis from "./redis";
import swagger from "./swagger";
import cookie from "./cookie";
import jwt from "./jwt";

export default fastifyPlugin(async (fastify: FastifyInstance) => {
    await Promise.all([fastify.register(config), fastify.register(sensible)]);

    await Promise.all([
        fastify.register(prisma),
        fastify.register(redis),
        fastify.register(cookie),
        fastify.config.NODE_ENV !== "test"
            ? /* istanbul ignore next */ fastify.register(swagger)
            : /* istanbul ignore next */ null,
    ]);

    await Promise.all([fastify.register(jwt)]);
});
