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
    interface FastifyInstance {
        authenticate(
            request: FastifyRequest,
            reply: FastifyReply
        ): Promise<void>;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { sub: number; iat: number };
        user: { sub: number; iat: number; exp: number };
    }
}

export default fastifyPlugin(
    async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
        fastify.register(fastifyJwt, {
            secret: fastify.config.SECRET,
            cookie: {
                cookieName: "refreshToken",
                signed: false,
            },
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
                    reply.unauthorized();
                }
            }
        );
    },
    { dependencies: ["config", "cookie"] }
);
