import { User } from "@prisma/client";
import { hashSync } from "bcrypt";
import { prisma } from "../../../plugins/prisma";

describe("GET /api/auth/user", () => {
    let user: User;

    beforeAll(async () => {
        await prisma.user.deleteMany();
        user = await prisma.user.create({
            data: {
                name: "Joe Biden the 1st",
                email: "joe@biden.com",
                password: hashSync("1234", 10),
            },
        });
    });

    it("should return status 200 and return user", async () => {
        const response = await global.fastify.inject({
            method: "GET",
            url: "/api/auth/user",
            headers: {
                authorization:
                    "Bearer " +
                    fastify.jwt.sign(
                        {
                            sub: user.id,
                            iat: Number(Date()),
                        },
                        { expiresIn: "10m" }
                    ),
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            name: "Joe Biden the 1st",
            email: "joe@biden.com",
        });
    });

    it("should return status 401, user does not exist", async () => {
        const response = await global.fastify.inject({
            method: "GET",
            url: "/api/auth/user",
            headers: {
                authorization:
                    "Bearer " +
                    fastify.jwt.sign(
                        {
                            sub: 542,
                            iat: Number(Date()),
                        },
                        { expiresIn: "10m" }
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

    it("should return status 401, accessToken invalid", async () => {
        const response = await global.fastify.inject({
            method: "GET",
            url: "/api/auth/user",
            headers: {
                authorization: "invalid_access_token!!!",
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
