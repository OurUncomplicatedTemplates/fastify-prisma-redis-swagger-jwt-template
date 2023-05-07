import { FastifyInstance, FastifyPluginOptions } from "fastify";

import fastifyPlugin from "fastify-plugin";
import auth from "./auth";

const getOptionsWithPrefix = (
    options: FastifyPluginOptions,
    prefix: string
) => {
    return {
        ...options,
        prefix: options.prefix + prefix,
    };
};

export default fastifyPlugin(
    async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
        fastify.get("/api/health", async () => {
            return { status: "OK" };
        });

        await Promise.all([
            fastify.register(auth, getOptionsWithPrefix(options, "/auth")),
        ]);
    }
);
