import { User } from "@prisma/client";
import UserService from "../user.service";
import AuthService from "../auth.service";

describe("POST /api/auth/csrf", () => {
    let userService: UserService;
    let authService: AuthService;

    let user: User;
    const userPassword = "1234";

    beforeAll(async () => {
        userService = new UserService();
        authService = new AuthService();

        user = await userService.createUser({
            name: "Joe Biden the 1st",
            email: "joe@biden.com",
            password: userPassword,
        });
    });

    it("should return status 200, set a csrf token cookie and return a csrf token", async () => {
        const { accessToken, refreshTokenPayload } =
            await authService.createTokens(user.id);

        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/csrf",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        const csrfToken: { value: string } = response.cookies[0];

        expect(response.statusCode).toBe(200);
        expect(csrfToken).toEqual({
            expires: expect.toBeWithinOneMinuteOf(
                new Date(refreshTokenPayload.aex * 1000)
            ),
            name: "_csrf",
            sameSite: "None",
            secure: true,
            value: expect.any(String),
        });
        expect(response.body).toEqual(expect.any(String));
    });

    it("should return status 401, accessToken invalid", async () => {
        const response = await global.fastify.inject({
            method: "POST",
            url: "/api/auth/csrf",
            headers: {
                authorization: `invalid_access_token!!!`,
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
