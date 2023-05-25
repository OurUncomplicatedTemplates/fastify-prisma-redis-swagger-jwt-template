import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyJwt, { JWT } from "@fastify/jwt";

export type token = {
    sub: number;
    iat: number;
    aex: number;
    tokenFamily: string;
};

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
        payload: token;
    }
}

export let jwt: JWT;

export default fastifyPlugin(
    async (fastify: FastifyInstance) => {
        await fastify.register(fastifyJwt, {
            secret: fastify.config.SECRET,
            cookie: {
                cookieName: "refreshToken",
                signed: false,
            },
        });

        jwt = fastify.jwt;

        fastify.decorate(
            "authenticate",
            async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    await request.jwtVerify();
                } catch (e) {
                    reply.unauthorized();
                }
            }
        );
    },
    { dependencies: ["config", "cookie"] }
);
