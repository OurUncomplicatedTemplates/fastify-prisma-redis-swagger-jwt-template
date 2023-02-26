import { JWT } from "@fastify/jwt";
import { User } from "@prisma/client";
import { hashSync } from "bcrypt";
import { prisma } from "../../plugins/prisma";
import { CreateUserInput } from "./auth.schema";

export async function createUser(input: CreateUserInput) {
    if (await findUserByEmail(input.email)) {
        throw Error("Email is already in use");
    }

    const user = await prisma.user.create({
        data: {
            email: input.email,
            password: hashSync(input.password, 10),
            name: input.name,
        },
    });

    return user;
}

export async function findUserByEmail(email: string) {
    return await prisma.user.findFirst({
        where: { email: email },
    });
}

export async function findUserById(id: number) {
    return await prisma.user.findFirst({
        where: { id: id },
    });
}

export function createRefreshToken(user: User, jwt: JWT) {
    return jwt.sign(
        {
            sub: user.id,
            iat: Number(Date()),
        },
        { expiresIn: "14d" }
    );
}

export function createAccessToken(user: User, jwt: JWT) {
    return jwt.sign(
        {
            sub: user.id,
            iat: Number(Date()),
        },
        { expiresIn: "10m" }
    );
}
