import { FastifyReply, FastifyRequest } from "fastify";
import {
    createAccessToken,
    createRefreshToken,
    createUser,
    findUserByEmail,
    findUserById,
} from "./auth.service";
import { CreateUserInput, LoginInput } from "./auth.schema";
import { compareSync } from "bcrypt";

export async function registerUserHandler(
    request: FastifyRequest<{
        Body: CreateUserInput;
    }>,
    reply: FastifyReply
) {
    try {
        const user = await createUser(request.body);

        reply.code(201).send(user);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message;
        }

        return reply.badRequest(message);
    }
}

export async function loginHandler(
    request: FastifyRequest<{
        Body: LoginInput;
    }>,
    reply: FastifyReply
) {
    const user = await findUserByEmail(request.body.email);

    if (!user || !compareSync(request.body.password, user.password)) {
        return reply.unauthorized("email and/or password incorrect");
    }

    reply
        .code(200)
        .setCookie("refreshToken", createRefreshToken(user, request.jwt), {
            path: "/api/auth/refresh",
            secure: true,
            httpOnly: true,
            sameSite: true,
        })
        .send({
            accessToken: createAccessToken(user, request.jwt),
        });
}

export async function refreshHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const refrestTokenPayload = await request.jwtVerify<{
            sub: number;
            iat: number;
            exp: number;
        }>({ onlyCookie: true });

        const user = await findUserById(refrestTokenPayload.sub);

        if (!user) {
            return reply.unauthorized();
        }

        reply
            .code(200)
            .setCookie("refreshToken", createRefreshToken(user, request.jwt), {
                path: "/api/auth/refresh",
                secure: true,
                httpOnly: true,
                sameSite: true,
            })
            .send({
                accessToken: createAccessToken(user, request.jwt),
            });
    } catch (err) {
        reply.unauthorized();
    }
}

export async function logoutHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    reply
        .code(200)
        .clearCookie("refreshToken", {
            path: "/api/auth/refresh",
            secure: true,
            httpOnly: true,
            sameSite: true,
        })
        .send();
}

export async function userHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const user = await findUserById(request.user.sub);
    if (!user) {
        return reply.unauthorized();
    }

    reply.code(200).send(user);
}
