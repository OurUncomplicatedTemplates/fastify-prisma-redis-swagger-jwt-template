import fastifyPlugin from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";
import fastifyCSRFProtection, {
    FastifyCsrfProtectionOptions,
} from "@fastify/csrf-protection";
import { CookieSerializeOptions } from "@fastify/cookie";

declare module "fastify" {
    interface FastifyReply {
        generateCsrf(
            options?: CookieSerializeOptions & { userInfo?: string }
        ): string;
    }
}

export default fastifyPlugin(
    async (fastify: FastifyInstance) => {
        await fastify.register(fastifyCSRFProtection, {
            getToken: (
                request: FastifyRequest<{
                    Headers: { "x-csrf-token": string | undefined } | undefined;
                }>
            ) => {
                return request.headers["x-csrf-token"] as string;
            },
            getUserInfo: (request: FastifyRequest) => {
                return request.user.tokenFamily;
            },
            cookieOpts: {
                signed: true,
                secure: true,
                httpOnly: false,
                sameSite: "none",
            },
            csrfOpts: {
                userInfo: true,
                hmacKey: fastify.config.SECRET,
            },
        } as FastifyCsrfProtectionOptions);
    },
    { dependencies: ["config", "cookie"] }
);
