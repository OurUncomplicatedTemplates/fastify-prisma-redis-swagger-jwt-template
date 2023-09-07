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
                    Body: { _csrf: string | null | undefined } | undefined;
                }>
            ) => {
                return (request.body ? request.body._csrf ?? "" : "") as string;
            },
            getUserInfo: (request: FastifyRequest) => {
                return request.user.tokenFamily;
            },
            cookieOpts: {
                signed: true,
                secure: true,
                httpOnly: false,
            },
            csrfOpts: {
                userInfo: true,
                hmacKey: fastify.config.SECRET,
            },
        } as FastifyCsrfProtectionOptions);
    },
    { dependencies: ["config", "cookie"] }
);
