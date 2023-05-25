import { FastifyReply, FastifyRequest } from "fastify";
import AuthService from "./auth.service";
import { CreateUserInput, LoginInput } from "./auth.schema";
import { compareSync } from "bcrypt";
import { FastifyJWT } from "@fastify/jwt";

export default class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    async registerUserHandler(
        request: FastifyRequest<{
            Body: CreateUserInput;
        }>,
        reply: FastifyReply
    ) {
        try {
            const user = await this.authService.createUser(request.body);

            return reply.code(201).send(user);
        } catch (e) {
            if (e instanceof Error) {
                return reply.badRequest(e.message);
            }

            /* istanbul ignore next */
            throw e;
        }
    }

    async loginHandler(
        request: FastifyRequest<{
            Body: LoginInput;
        }>,
        reply: FastifyReply
    ) {
        const user = await this.authService.getUserByEmail(request.body.email);

        if (!user || !compareSync(request.body.password, user.password)) {
            return reply.unauthorized("email and/or password incorrect");
        }

        const { refreshToken, accessToken } = this.authService.createTokens(
            user,
            request.jwt
        );

        return reply
            .code(200)
            .setCookie("refreshToken", refreshToken, {
                path: "/api/auth/refresh",
                secure: true,
                httpOnly: true,
                sameSite: true,
            })
            .send({
                accessToken: accessToken,
            });
    }

    async refreshHandler(request: FastifyRequest, reply: FastifyReply) {
        try {
            const refreshTokenPayload = await request.jwtVerify<
                FastifyJWT["user"]
            >({ onlyCookie: true });

            const user = await this.authService.getUserById(
                refreshTokenPayload.sub
            );

            if (!user) {
                return reply.unauthorized();
            }

            const { refreshToken, accessToken } = this.authService.createTokens(
                user,
                request.jwt,
                refreshTokenPayload.aex
            );

            return reply
                .code(200)
                .setCookie("refreshToken", refreshToken, {
                    path: "/api/auth/refresh",
                    secure: true,
                    httpOnly: true,
                    sameSite: true,
                })
                .send({
                    accessToken: accessToken,
                });
        } catch (err) {
            return reply.unauthorized();
        }
    }

    async logoutHandler(request: FastifyRequest, reply: FastifyReply) {
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

    async userHandler(request: FastifyRequest, reply: FastifyReply) {
        const user = await this.authService.getUserById(request.user.sub);
        if (!user) {
            return reply.unauthorized();
        }

        return reply.code(200).send(user);
    }
}
