import fastifyPlugin from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export default fastifyPlugin(
    async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
        fastify.addHook("onClose", async (fastify) => {
            await prisma.$disconnect();
        });
    },
    { dependencies: ["config"] }
);
