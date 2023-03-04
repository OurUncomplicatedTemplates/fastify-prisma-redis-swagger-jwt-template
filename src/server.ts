import { build } from "./index";

const start = async () => {
    try {
        const fastify = await build();

        await fastify.listen({
            host: fastify.config.HOST,
            port: fastify.config.PORT,
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

start();
