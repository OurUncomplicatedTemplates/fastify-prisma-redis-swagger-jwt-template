import path from "path";
import fastifyAutoload from "@fastify/autoload";

import Fastify from "fastify";
import { authSchemas } from "./modules/auth/auth.schema";

export async function build() {
    const fastify = Fastify({
        logger: {
            level: "error",
        },
    });

    try {
        // Register health route
        fastify.get("/api/health", async (request, response) => {
            return { status: "OK" };
        });

        // Register plugins
        await fastify.register(fastifyAutoload, {
            dir: path.join(__dirname, "./plugins"),
        });

        // This has to be done manually as fastify autoload does not support adding schemas somehow?!
        for (const schema of [...authSchemas]) {
            fastify.addSchema(schema);
        }

        // Register routes
        await fastify.register(fastifyAutoload, {
            dir: path.join(__dirname, "./modules/"),
            options: { prefix: "/api" },
            matchFilter: (path) => path.endsWith(".route.ts"),
        });
    } catch (e) {
        console.error(e);
    }

    return fastify;
}
