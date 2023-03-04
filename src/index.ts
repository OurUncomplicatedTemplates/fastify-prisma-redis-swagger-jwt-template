import Fastify from "fastify";
import { authSchemas } from "./modules/auth/auth.schema";
import plugins from "./plugins";
import routes from "./routes";

export async function build() {
    const fastify = Fastify({
        logger: {
            level: "error",
        },
    });

    await fastify.register(plugins);

    for (const schema of [...authSchemas]) {
        fastify.addSchema(schema);
    }

    await fastify.register(routes, { prefix: "/api" });

    return fastify;
}
