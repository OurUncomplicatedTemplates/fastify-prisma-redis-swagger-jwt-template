import { FastifyInstance, FastifyPluginOptions } from "fastify";

import fastifyEnv from "@fastify/env";
import fastifyPlugin from "fastify-plugin";

declare module "fastify" {
    interface FastifyInstance {
        config: {
            NODE_ENV: string;
            SECRET: string;
            HOST: string;
            PORT: number;
            DATABASE_URL: string;
            REDIS_URL: string;
        };
    }
}

export default fastifyPlugin(
    async (
        fastify: FastifyInstance,
        options: FastifyPluginOptions,
        done: (err?: Error | undefined) => void
    ) => {
        const schema = {
            type: "object",
            required: ["HOST", "PORT", "DATABASE_URL", "SECRET", "REDIS_URL"],
            properties: {
                NODE_ENV: {
                    type: "string",
                    default: "prod",
                },
                HOST: {
                    type: "string",
                    default: "0.0.0.0",
                },
                PORT: {
                    type: "number",
                    default: 3000,
                },
                SECRET: {
                    type: "string",
                },
                DATABASE_URL: {
                    type: "string",
                },
                REDIS_URL: {
                    type: "string",
                },
            },
        };

        const configOptions = {
            // decorate the Fastify server instance with `config` key
            // such as `fastify.config('PORT')
            confKey: "config",
            // schema to validate
            schema: schema,
            // source for the configuration data
            data: process.env,
            // will read .env in root folder
            dotenv: true,
            // will remove the additional properties
            // from the data object which creates an
            // explicit schema
            removeAdditional: true,
        };

        fastifyEnv(fastify, configOptions, done);
    },
    { name: "config" }
);
