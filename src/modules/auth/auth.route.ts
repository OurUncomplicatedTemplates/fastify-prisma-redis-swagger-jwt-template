import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { loginHandler, registerUserHandler } from "./auth.controller";
import { $ref } from "./auth.schema";

export default async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
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
};
