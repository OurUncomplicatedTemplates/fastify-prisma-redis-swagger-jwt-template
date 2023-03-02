import { hashSync } from "bcrypt";
import { prisma } from "../../../plugins/prisma";

describe("POST /api/auth/refresh", () => {
    const fastify = global.fastify;

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it("should return status 200, set a refreshToken and return a new accessToken", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Joe Biden the 1st",
                email: "joe@biden.com",
                password: hashSync("1234", 10),
            },
        });

        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: fastify.jwt.sign(
                    {
                        sub: user.id,
                        iat: Number(Date()),
                    },
                    { expiresIn: "1d" }
                ),
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

    it("should return status 401, user does not exist", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: fastify.jwt.sign(
                    {
                        sub: 123,
                        iat: Number(Date()),
                    },
                    { expiresIn: "1d" }
                ),
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
            error: "Unauthorized",
            message: "Unauthorized",
            statusCode: 401,
        });
    });

    it("should return status 401, refreshToken cookie invalid", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: "invalid refresh token!!!",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({
            error: "Unauthorized",
            message: "Unauthorized",
            statusCode: 401,
        });
    });
});
