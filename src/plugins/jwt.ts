import {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyJwt, { JWT } from "@fastify/jwt";

declare module "fastify" {
    interface FastifyRequest {
        jwt: JWT;
    }
}

export default fastifyPlugin(
    async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
        fastify.register(fastifyJwt, {
            secret: fastify.config.SECRET,
        });

        fastify.addHook("preHandler", (req, reply, next) => {
            req.jwt = fastify.jwt;
            return next();
        });

        fastify.decorate(
            "authenticate",
            async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    await request.jwtVerify();
                } catch (err) {
                    reply.send(err);
                }
            }
        );
    },
    { dependencies: ["config"] }
);
