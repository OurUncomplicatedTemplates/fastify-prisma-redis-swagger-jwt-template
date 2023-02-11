import { FastifyInstance, FastifyPluginOptions } from "fastify";

import fastifyEnv from "@fastify/env";
import fastifyPlugin from "fastify-plugin";

async function configPlugin(
    server: FastifyInstance,
    options: FastifyPluginOptions,
    done: (err?: Error | undefined) => void
) {
    const schema = {
        type: "object",
        required: [
            "HOST",
            "PORT",
            "DATABASE_URL",
            "SECRET",
            "REDIS_HOST",
            "REDIS_PASSWORD",
        ],
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
            DATABASE_URL_TEST: {
                type: "string",
            },
            REDIS_HOST: {
                type: "string",
            },
            REDIS_PASSWORD: {
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

    return fastifyEnv(server, configOptions, done);
}

export default fastifyPlugin(configPlugin, { name: "config" });

declare module "fastify" {
    interface FastifyInstance {
        config: {
            NODE_ENV: string;
            SECRET: string;
            HOST: string;
            PORT: number;
            DATABASE_URL: string;
            DATABASE_URL_TEST: string;
            REDIS_HOST: string;
            REDIS_PASSWORD: string;
        };
    }
}
