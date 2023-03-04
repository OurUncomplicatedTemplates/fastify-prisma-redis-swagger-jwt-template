import { FastifyInstance, FastifyPluginOptions } from "fastify";

import fastifyPlugin from "fastify-plugin";
import authRoute from "./modules/auth/auth.route";

export default fastifyPlugin(
    async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
        fastify.get("/api/health", async (request, response) => {
            return { status: "OK" };
        });

        await Promise.all([
            fastify.register(authRoute, { prefix: options.prefix + "/auth" }),
        ]);
    }
);
