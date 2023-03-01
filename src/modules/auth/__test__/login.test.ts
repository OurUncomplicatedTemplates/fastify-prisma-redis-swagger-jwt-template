import { FastifyInstance } from "fastify";
import { hashSync } from "bcrypt";
import { PrismaClient } from "@prisma/client";

describe("POST /api/auth/login", () => {
    let fastify: FastifyInstance;
    let prisma: PrismaClient;

    beforeAll(async () => {
        fastify = global.fastify;
        prisma = global.prisma;

        await prisma.user.deleteMany();
        await prisma.user.create({
            data: {
                name: "Joe Biden the 1st",
                email: "joe@biden.com",
                password: hashSync("1234", 10),
            },
        });
    });

    it("should return status 200, set a refreshToken and return a new accessToken", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: {
                email: "joe@biden.com",
                password: "1234",
            },
        });

        const refreshToken: any = response.cookies[0];

        expect(response.statusCode).toBe(200);
        expect(fastify.jwt.verify(refreshToken.value)).toBeTruthy();
        expect(refreshToken).toEqual({
            httpOnly: true,
            name: "refreshToken",
            path: "/api/auth/refresh",
            sameSite: "Strict",
            secure: true,
            value: expect.any(String),
        });
        expect(fastify.jwt.verify(response.json().accessToken)).toBeTruthy();
    });

    it("should return status 401, when password is incorrect", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: {
                email: "joe@biden.com",
                password: "wrong password",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
            error: "Unauthorized",
            message: "email and/or password incorrect",
            statusCode: 401,
        });
    });

    it("should return status 401, when no user has email", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: {
                email: "hunter@biden.com",
                password: "1234",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
            error: "Unauthorized",
            message: "email and/or password incorrect",
            statusCode: 401,
        });
    });

    it("should return status 400, when no email or password has been provided", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: {},
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body must have required property 'email'",
            statusCode: 400,
        });
    });

    it("should return status 400, when no email has been provided", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: {
                password: "1234",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body must have required property 'email'",
            statusCode: 400,
        });
    });

    it("should return status 400, when no password has been provided", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: {
                email: "joe@biden.com",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body must have required property 'password'",
            statusCode: 400,
        });
    });
});
