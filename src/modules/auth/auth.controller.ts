import { FastifyReply, FastifyRequest } from "fastify";
import {
    createAccessToken,
    createRefreshToken,
    createUser,
    getUserByEmail,
    getUserById,
} from "./auth.service";
import { CreateUserInput, LoginInput } from "./auth.schema";
import { compareSync } from "bcrypt";
import { errorMessage } from "../../utils/string";

export async function registerUserHandler(
    request: FastifyRequest<{
        Body: CreateUserInput;
    }>,
    reply: FastifyReply
) {
    try {
        const user = await createUser(request.body);

        return reply.code(201).send(user);
    } catch (e) {
        return reply.badRequest(errorMessage(e));
    }
}

export async function loginHandler(
    request: FastifyRequest<{
        Body: LoginInput;
    }>,
    reply: FastifyReply
) {
    const user = await getUserByEmail(request.body.email);

    if (!user || !compareSync(request.body.password, user.password)) {
        return reply.unauthorized("email and/or password incorrect");
    }

    return reply
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

        const user = await getUserById(refrestTokenPayload.sub);

        if (!user) {
            return reply.unauthorized();
        }

        return reply
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
        return reply.unauthorized();
    }
}

export async function logoutHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    return reply
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
    const user = await getUserById(request.user.sub);
    if (!user) {
        return reply.unauthorized();
    }

    return reply.code(200).send(user);
}
