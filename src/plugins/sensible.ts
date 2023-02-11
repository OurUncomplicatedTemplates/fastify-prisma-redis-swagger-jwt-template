import fastifyPlugin from "fastify-plugin";
import fastifySensible from "@fastify/sensible";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fastifyPlugin(
    async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
        await fastify.register(fastifySensible);
    }
);
