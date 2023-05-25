import { JWT } from "@fastify/jwt";
import { User } from "@prisma/client";
import { hashSync } from "bcrypt";
import { prisma } from "../../plugins/prisma";
import { CreateUserInput } from "./auth.schema";

export default class AuthService {
    async createUser(input: CreateUserInput) {
        if (await this.getUserByEmail(input.email)) {
            throw Error("Email is already in use");
        }

        return await prisma.user.create({
            data: {
                email: input.email,
                password: hashSync(input.password, 10),
                name: input.name,
            },
        });
    }

    async getUserByEmail(email: string) {
        return await prisma.user.findFirst({
            where: { email: email },
        });
    }

    async getUserById(id: number) {
        return await prisma.user.findFirst({
            where: { id: id },
        });
    }

    createTokens(user: User, jwt: JWT, aex: number | null = null) {
        if (!aex) {
            aex = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 365;
        }

        return {
            refreshToken: jwt.sign(
                {
                    sub: user.id,
                    iat: Math.floor(new Date().getTime() / 1000),
                    aex: aex,
                },
                { expiresIn: "14d" }
            ),
            accessToken: jwt.sign(
                {
                    sub: user.id,
                    iat: Math.floor(new Date().getTime() / 1000),
                    aex: aex,
                },
                { expiresIn: "10m" }
            ),
        };
    }
}
