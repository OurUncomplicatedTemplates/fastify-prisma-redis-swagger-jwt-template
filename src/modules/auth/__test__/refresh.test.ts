import { User } from "@prisma/client";
import { v4 } from "uuid";
import { prisma } from "../../../plugins/prisma";
import { jwt } from "../../../plugins/jwt";
import TimeUtil from "../../../utils/time";
import AuthService from "../auth.service";
import UserService from "../user.service";

describe("POST /api/auth/refresh", () => {
    let authService: AuthService;
    let userService: UserService;

    let user: User;

    beforeAll(async () => {
        authService = new AuthService();
        userService = new UserService();

        user = await userService.createUser({
            name: "Joe Biden the 1st",
            email: "joe@biden.com",
            password: "1234",
        });
    });

    beforeEach(async () => {
        await prisma.userSession.deleteMany();
    });

    it("should return status 200, set a valid refreshToken and return a new valid accessToken", async () => {
        const { refreshToken, accessToken } = await authService.createTokens(
            user.id
        );

        const csrfResponse = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/csrf",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: refreshToken,
                _csrf: csrfResponse.cookies[0].value,
            },
            payload: {
                _csrf: csrfResponse.body,
            },
        });

        const oldRefreshTokenPayload = jwt.decodeRefreshToken(refreshToken);
        const newRefreshToken = response.cookies[0];

        // Refresh token
        expect(response.statusCode).toBe(200);
        expect(jwt.verify(newRefreshToken.value)).toBeTruthy();
        expect(jwt.decodeRefreshToken(newRefreshToken.value).aex).toBe(
            oldRefreshTokenPayload.aex
        );
        expect(newRefreshToken).toEqual({
            httpOnly: true,
            name: "refreshToken",
            path: "/api/auth/refresh",
            sameSite: "Strict",
            secure: true,
            value: expect.any(String),
        });

        // Access token
        expect(jwt.verify(response.json().accessToken)).toBeTruthy();
    });

    it("should return status 401, when using refreshToken that has already been used", async () => {
        jest.useFakeTimers({ now: Date.now() - 1000 });
        const { refreshToken, accessToken } = await authService.createTokens(
            user.id
        );
        jest.useRealTimers();

        const csrfResponse = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/csrf",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: refreshToken,
                _csrf: csrfResponse.cookies[0].value,
            },
            payload: {
                _csrf: csrfResponse.body,
            },
        });

        expect(await prisma.userSession.count()).toBe(1);

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: refreshToken,
                _csrf: csrfResponse.cookies[0].value,
            },
            payload: {
                _csrf: csrfResponse.body,
            },
        });

        expect(await prisma.userSession.count()).toBe(0);

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchObject({
            error: "Unauthorized",
            message: "Unauthorized",
            statusCode: 401,
        });
    });

    it("should return status 401, refreshToken is verifiable, but not valid", async () => {
        const { refreshToken, accessToken } = await authService.createTokens(
            user.id
        );

        await prisma.userSession.deleteMany({
            where: {
                refreshToken: refreshToken,
            },
        });

        const csrfResponse = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/csrf",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: refreshToken,
                _csrf: csrfResponse.cookies[0].value,
            },
            payload: {
                _csrf: csrfResponse.body,
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
        const tokenFamily = v4();

        const refreshToken = jwt.signRefreshToken({
            sub: user.id,
            iat: TimeUtil.getNowUnixTimeStamp() - 60,
            aex: TimeUtil.getNowUnixTimeStamp() - 30,
            tokenFamily: tokenFamily,
        });

        const accessToken = jwt.signAccessToken({
            sub: user.id,
            iat: TimeUtil.getNowUnixTimeStamp() - 60,
            tokenFamily: tokenFamily,
        });

        await prisma.userSession.create({
            data: {
                refreshToken: refreshToken,
                userId: user.id,
                tokenFamily: tokenFamily,
            },
        });

        const csrfResponse = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/csrf",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: refreshToken,
                _csrf: csrfResponse.cookies[0].value,
            },
            payload: {
                _csrf: csrfResponse.body,
            },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchObject({
            error: "Unauthorized",
            message: "Unauthorized",
            statusCode: 401,
        });
    });

    it("should return status 401, refreshToken expired", async () => {
        jest.useFakeTimers({
            now: Date.now() - 1000 * 60 * 60 * 24 * 14 - 1000,
        });
        const { refreshToken } = await authService.createTokens(user.id);
        jest.useRealTimers();

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: refreshToken,
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

    it("should return status 401, user does not exist", async () => {
        const tokenFamily = v4();

        const refreshToken = jwt.signRefreshToken({
            sub: user.id,
            iat: TimeUtil.getNowUnixTimeStamp() - 60,
            aex: TimeUtil.getNowUnixTimeStamp() - 30,
            tokenFamily: tokenFamily,
        });

        const accessToken = jwt.signAccessToken({
            sub: user.id,
            iat: TimeUtil.getNowUnixTimeStamp() - 60,
            tokenFamily: tokenFamily,
        });

        const csrfResponse = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/csrf",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/refresh",
            cookies: {
                refreshToken: refreshToken,
                _csrf: csrfResponse.cookies[0].value,
            },
            payload: {
                _csrf: csrfResponse.body,
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
