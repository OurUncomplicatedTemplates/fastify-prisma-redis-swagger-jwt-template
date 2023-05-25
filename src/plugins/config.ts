import { FastifyInstance, FastifyPluginOptions } from "fastify";

import fastifyEnv from "@fastify/env";
import fastifyPlugin from "fastify-plugin";

const NODE_ENVS = ["prod", "test", "local"] as const;
type NODE_ENV = (typeof NODE_ENVS)[number];

declare module "fastify" {
    interface FastifyInstance {
        config: {
            SECRET: string;
            HOST: string;
            PORT: number;
            DATABASE_URL: string;
            REDIS_HOST: string | undefined;
            REDIS_PORT: number | undefined;
            REDIS_USER: string | undefined;
            REDIS_PASSWORD: string | undefined;
            NODE_ENV: NODE_ENV;
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
            required: ["SECRET", "DATABASE_URL", "REDIS_HOST"],
            properties: {
                SECRET: {
                    type: "string",
                },
                HOST: {
                    type: "string",
                    default: "0.0.0.0",
                },
                PORT: {
                    type: "number",
                    default: 3000,
                },
                DATABASE_URL: {
                    type: "string",
                },
                REDIS_HOST: {
                    type: "string",
                },
                REDIS_PORT: {
                    type: "string",
                    default: undefined,
                },
                REDIS_USER: {
                    type: "string",
                    default: undefined,
                },
                REDIS_PASSWORD: {
                    type: "string",
                    default: undefined,
                },
                NODE_ENV: {
                    type: "string",
                    default: "prod",
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

        /* istanbul ignore next */
        if (
            NODE_ENVS.find(
                (validName) => validName === process.env.NODE_ENV ?? "prod"
            ) === undefined
        ) {
            throw new Error(
                "NODE_ENV is not valid, it must be one of 'prod', 'test' or 'local'"
            );
        }

        fastifyEnv(fastify, configOptions, done);
    },
    { name: "config" }
);
