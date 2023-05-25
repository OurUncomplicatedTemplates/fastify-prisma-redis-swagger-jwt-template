import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyJwt, { FastifyJWT, JWT } from "@fastify/jwt";
import TimeUtil from "../utils/time";

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
        payload: { sub: number; iat: number; aex: number };
        user: { sub: number; iat: number; exp: number; aex: number };
    }
}

export default fastifyPlugin(
    async (fastify: FastifyInstance) => {
        await fastify.register(fastifyJwt, {
            secret: fastify.config.SECRET,
            cookie: {
                cookieName: "refreshToken",
                signed: false,
            },
            trusted: (
                request: FastifyRequest,
                decodedToken: { [k: string]: unknown }
            ) => {
                const token = decodedToken as FastifyJWT["user"];

                return token.aex > TimeUtil.getNowUnixTimeStamp();
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
