import { FastifyInstance } from "fastify";
import AuthController from "./auth.controller";
import { $ref } from "./auth.schema";
import AuthService from "./auth.service";
import UserService from "./user.service";

export default async (fastify: FastifyInstance) => {
    const authController = new AuthController(
        new AuthService(),
        new UserService()
    );

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
        authController.registerUserHandler.bind(authController)
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
        authController.loginHandler.bind(authController)
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
            preHandler: [fastify.authenticate, fastify.csrfProtection],
        },
        authController.refreshHandler.bind(authController)
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
            preHandler: [fastify.authenticate, fastify.csrfProtection],
        },
        authController.logoutHandler.bind(authController)
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
            preHandler: [fastify.authenticate],
        },
        authController.userHandler.bind(authController)
    );

    fastify.post(
        "/csrf",
        {
            schema: {
                headers: {
                    Authorization: true,
                },
                tags: ["Auth"],
                response: {
                    //200: $ref("userResponseSchema"),
                },
            },
            onRequest: [fastify.authenticate],
        },
        authController.csrfHandler.bind(authController)
    );
};
