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

    try {
        await fastify.register(plugins);

        // This has to be done manually as fastify autoload does not support adding schemas somehow?!
        for (const schema of [...authSchemas]) {
            fastify.addSchema(schema);
        }

        await fastify.register(routes, { prefix: "/api" });
    } catch (e) {
        console.error(e);
    }

    return fastify;
}
