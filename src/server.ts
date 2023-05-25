import { build } from "./index";

const start = async () => {
    try {
        const fastify = await build();

        await fastify.listen({
            host: fastify.config.HOST,
            port: fastify.config.PORT,
        });
    } catch (e) {
        console.error(
            "start() - Unknown exception occured during startup of fastify",
            e
        );
        process.exit(1);
    }
};

start();
