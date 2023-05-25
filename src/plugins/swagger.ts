/* istanbul ignore file */

import fastifyPlugin from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-swagger
 */
export default fastifyPlugin(
    async (fastify: FastifyInstance) => {
        await fastify.register(fastifySwagger, {
            mode: "dynamic",
            openapi: {
                info: {
                    title: "API",
                    version: "1.0.0",
                },
            },
        });

        await fastify.register(fastifySwaggerUI, {
            routePrefix: "/api/docs",
            initOAuth: {},
            uiConfig: {
                docExpansion: "full",
                deepLinking: false,
            },
            staticCSP: true,
        });
    },
    { dependencies: ["config"] }
);
