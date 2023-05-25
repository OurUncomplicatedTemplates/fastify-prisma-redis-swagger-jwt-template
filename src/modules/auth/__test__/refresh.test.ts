import { hashSync } from "bcrypt";
import { prisma } from "../../../plugins/prisma";
import { FastifyJWT } from "@fastify/jwt";
import TimeUtil from "../../../utils/time";

describe("POST /api/auth/refresh", () => {
    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it("should return status 200, set a valid refreshToken and return a new valid accessToken", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Joe Biden the 1st",
                email: "joe@biden.com",
                password: hashSync("1234", 10),
            },
        });

        const aex = TimeUtil.getNowUnixTimeStamp() + 60;

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: fastify.jwt.sign(
                    {
                        sub: user.id,
                        iat: TimeUtil.getNowUnixTimeStamp(),
                        aex: aex,
                    },
                    { expiresIn: "1d" }
                ),
            },
        });

        const refreshToken: { value: string } = response.cookies[0];

        // Refresh token
        expect(response.statusCode).toBe(200);
        expect(fastify.jwt.verify(refreshToken.value)).toBeTruthy();
        expect(
            fastify.jwt.decode<FastifyJWT["user"]>(refreshToken.value)?.aex
        ).toBe(aex);
        expect(refreshToken).toEqual({
            httpOnly: true,
            name: "refreshToken",
            path: "/api/auth/refresh",
            sameSite: "Strict",
            secure: true,
            value: expect.any(String),
        });

        // Access token
        expect(fastify.jwt.verify(response.json().accessToken)).toBeTruthy();
        expect(
            fastify.jwt.decode<FastifyJWT["user"]>(response.json().accessToken)
                ?.aex
        ).toBe(aex);
    });

    it("should return status 401, user does not exist", async () => {
        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: fastify.jwt.sign(
                    {
                        sub: 123,
                        iat: TimeUtil.getNowUnixTimeStamp(),
                        aex: TimeUtil.getNowUnixTimeStamp() + 60,
                    },
                    { expiresIn: "1d" }
                ),
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchObject({
            error: "Unauthorized",
            message: "Unauthorized",
            statusCode: 401,
        });
    });

    it("should return status 401, refreshToken absolute expiry is passed", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Joe Biden the 1st",
                email: "joe@biden.com",
                password: hashSync("1234", 10),
            },
        });

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: fastify.jwt.sign(
                    {
                        sub: user.id,
                        iat: TimeUtil.getNowUnixTimeStamp() - 60,
                        aex: TimeUtil.getNowUnixTimeStamp() - 30,
                    },
                    { expiresIn: "1d" }
                ),
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchObject({
            error: "Unauthorized",
            message: "Unauthorized",
            statusCode: 401,
        });
    });

    it("should return status 401, refreshToken cookie invalid", async () => {
        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: "invalid refresh token!!!",
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchObject({
            error: "Unauthorized",
            message: "Unauthorized",
            statusCode: 401,
        });
    });
});
