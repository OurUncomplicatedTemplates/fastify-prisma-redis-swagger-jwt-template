import { prisma } from "../../../plugins/prisma";

describe("POST /api/auth/register", () => {
    const fastify = global.fastify;

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it("should return status 201 and create a user", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
                email: "joe@biden.com",
                password: "12345678",
            },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toEqual({
            name: "Joe Biden",
            email: "joe@biden.com",
        });
    });

    it("should return status 400, when email is already in use", async () => {
        await prisma.user.create({
            data: {
                name: "Joe Biden the 1st",
                email: "joe@biden.com",
                password: "12345678",
            },
        });

        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
                email: "joe@biden.com",
                password: "12345678",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "Email is already in use",
            statusCode: 400,
        });
    });

    it("should return status 400, when email is invalid", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
                email: "joebiden.com",
                password: "12345678",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: 'body/email must match format "email"',
            statusCode: 400,
        });
    });

    it("should return status 400, when no email has been provided", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
                password: "12345678",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body must have required property 'email'",
            statusCode: 400,
        });
    });

    it("should return status 400, when email is empty", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
                email: "",
                password: "12345678",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body/email must NOT have fewer than 1 characters",
            statusCode: 400,
        });
    });

    it("should return status 400, when no password has been provided", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
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

    it("should return status 400, when password is empty", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
                email: "joe@biden.com",
                password: "",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body/password must NOT have fewer than 8 characters",
            statusCode: 400,
        });
    });

    it("should return status 400, when password is less than 8 characters", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "Joe Biden",
                email: "joe@biden.com",
                password: "1234567",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body/password must NOT have fewer than 8 characters",
            statusCode: 400,
        });
    });

    it("should return status 400, when no name has been provided", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                email: "joe@biden.com",
                password: "12345678",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body must have required property 'name'",
            statusCode: 400,
        });
    });

    it("should return status 400, when name is empty", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/register",
            payload: {
                name: "",
                email: "joe@biden.com",
                password: "12345678",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            error: "Bad Request",
            message: "body/name must NOT have fewer than 1 characters",
            statusCode: 400,
        });
    });
});
