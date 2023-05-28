import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import fastifyJwt, { JWT } from "@fastify/jwt";

type tokenPayload = {
    sub: number;
    iat: number;
};

type refreshTokenPayload = {
    aex: number;
    tokenFamily: string;
} & tokenPayload;

type accessTokenPayload = object & tokenPayload;

type user = {
    exp: number;
} & tokenPayload;

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
        payload: refreshTokenPayload | accessTokenPayload;
        user: user;
    }

    interface JWT {
        signRefreshToken: (refreshTokenPayload: refreshTokenPayload) => string;
        decodeRefreshToken: (refreshToken: string) => refreshTokenPayload;

        signAccessToken: (accessTokenPayload: accessTokenPayload) => string;
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

        jwt.signRefreshToken = (refreshTokenPayload: refreshTokenPayload) => {
            return jwt.sign(refreshTokenPayload, { expiresIn: "14d" });
        };

        jwt.decodeRefreshToken = (refreshToken: string) => {
            const refreshTokenObject = jwt.decode<refreshTokenPayload>(
                refreshToken
            ) as refreshTokenPayload;

            return refreshTokenObject;
        };

        jwt.signAccessToken = (accessTokenPayload: accessTokenPayload) => {
            return jwt.sign(accessTokenPayload, { expiresIn: "10m" });
        };

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
