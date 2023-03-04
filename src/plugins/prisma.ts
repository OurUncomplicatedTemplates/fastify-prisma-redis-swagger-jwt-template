import fastifyPlugin from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { PrismaClient } from "@prisma/client";

export let prisma: PrismaClient;

export default fastifyPlugin(
    async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url:
                        fastify.config.NODE_ENV === "test"
                            ? fastify.config.DATABASE_URL_TEST
                            : /* istanbul ignore next */ fastify.config
                                  .DATABASE_URL,
                },
            },
        });

        fastify.addHook("onClose", async (fastify) => {
            await prisma.$disconnect();
        });
    },
    { dependencies: ["config"] }
);
