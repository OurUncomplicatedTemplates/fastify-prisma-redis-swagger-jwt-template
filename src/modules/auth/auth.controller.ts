import { FastifyReply, FastifyRequest } from "fastify";
import AuthService from "./auth.service";
import UserService from "./user.service";
import { CreateUserInput, LoginInput } from "./auth.schema";

export default class AuthController {
    private authService: AuthService;
    private userService: UserService;

    constructor(authService: AuthService, userService: UserService) {
        this.authService = authService;
        this.userService = userService;
    }

    public async registerUserHandler(
        request: FastifyRequest<{
            Body: CreateUserInput;
        }>,
        reply: FastifyReply
    ) {
        try {
            const user = await this.userService.createUser(request.body);

            return reply.code(201).send(user);
        } catch (e) {
            if (e instanceof Error) {
                return reply.badRequest(e.message);
            }

            /* istanbul ignore next */
            throw e;
        }
    }

    public async loginHandler(
        request: FastifyRequest<{
            Body: LoginInput;
        }>,
        reply: FastifyReply
    ) {
        try {
            const user = await this.userService.getUserByEmail(
                request.body.email
            );

            if (
                !this.authService.verifyPassword(
                    user.password,
                    request.body.password
                )
            ) {
                throw new Error("password incorrect");
            }

            const { refreshToken, accessToken } =
                await this.authService.createTokens(user.id);

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
        } catch (e) {
            return reply.unauthorized("email and/or password incorrect");
        }
    }

    public async refreshHandler(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { refreshToken, accessToken } =
                await this.authService.refreshByToken(
                    request.cookies.refreshToken as string
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
        } catch (e) {
            return reply.unauthorized();
        }
    }

    public async logoutHandler(request: FastifyRequest, reply: FastifyReply) {
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

    public async userHandler(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = await this.userService.getUserById(request.user.sub);

            return reply.code(200).send(user);
        } catch (e) {
            return reply.unauthorized();
        }
    }
}
