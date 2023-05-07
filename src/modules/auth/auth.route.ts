import { FastifyInstance } from "fastify";
import {
    loginHandler,
    registerUserHandler,
    refreshHandler,
    logoutHandler,
    userHandler,
} from "./auth.controller";
import { $ref } from "./auth.schema";

export default async (fastify: FastifyInstance) => {
    fastify.post(
        "/register",
        {
            schema: {
                tags: ["Auth"],
                body: $ref("createUserSchema"),
                response: {
                    201: $ref("createUserResponseSchema"),
                },
            },
        },
        registerUserHandler
    );

    fastify.post(
        "/login",
        {
            schema: {
                tags: ["Auth"],
                body: $ref("loginSchema"),
                response: {
                    200: $ref("loginResponseSchema"),
                },
            },
        },
        loginHandler
    );

    fastify.post(
        "/refresh",
        {
            schema: {
                tags: ["Auth"],
                response: {
                    200: $ref("refreshResponseSchema"),
                },
                description: "The `refreshToken` cookie is required",
            },
        },
        refreshHandler
    );

    fastify.post(
        "/logout",
        {
            schema: {
                tags: ["Auth"],
                response: {
                    200: $ref("logoutResponseSchema"),
                },
            },
        },
        logoutHandler
    );

    fastify.get(
        "/user",
        {
            schema: {
                headers: {
                    Authorization: true,
                },
                tags: ["Auth"],
                response: {
                    200: $ref("userResponseSchema"),
                },
            },
            onRequest: [fastify.authenticate],
        },
        userHandler
    );
};
