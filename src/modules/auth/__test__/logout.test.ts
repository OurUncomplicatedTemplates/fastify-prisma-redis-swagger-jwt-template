import { FastifyInstance } from "fastify";
import { hashSync } from "bcrypt";
import { PrismaClient } from "@prisma/client";

describe("POST /api/auth/logout", () => {
    let fastify: FastifyInstance;
    let prisma: PrismaClient;

    beforeAll(async () => {
        fastify = global.fastify;
        prisma = global.prisma;
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it("should return status 200 and clear the refreshToken", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Joe Biden the 1st",
                email: "joe@biden.com",
                password: hashSync("1234", 10),
            },
        });

        const response = await fastify.inject({
            method: "POST",
            url: "/api/auth/logout",
            payload: {},
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
        expect(refreshToken).toEqual({
            expires: new Date(0),
            httpOnly: true,
            name: "refreshToken",
            path: "/api/auth/refresh",
            sameSite: "Strict",
            secure: true,
            value: "",
        });
    });
});
