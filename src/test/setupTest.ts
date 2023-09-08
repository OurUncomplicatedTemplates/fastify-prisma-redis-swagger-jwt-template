import { FastifyInstance } from "fastify";
import { build } from "../index";

declare global {
    // eslint-disable-next-line no-var
    var fastify: FastifyInstance;
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Expect {
            toBeWithinOneMinuteOf(expected: Date): unknown;
        }
        interface Matchers<R> {
            toBeWithinOneMinuteOf(expected: Date): R;
        }
    }
}

jest.mock("../plugins/prisma");

beforeAll(async () => {
    expect.extend({
        toBeWithinOneMinuteOf(got, expected: Date) {
            if (!(got instanceof Date)) {
                return {
                    pass: false,
                    message: () => {
                        return (
                            `${got} should be a Date object,` +
                            `actual type: ${typeof got}`
                        );
                    },
                };
            }

            const oneMinute = 60 * 1000; // a minute in milliseconds

            const timeDiff = Math.abs(expected.getTime() - got.getTime());
            const timeDiffInSeconds = timeDiff / 1000;

            const pass = timeDiff < oneMinute;
            const message = () => {
                const exp = expected.toLocaleTimeString();
                const gt = got.toLocaleTimeString();

                if (pass) {
                    return (
                        `${gt} should not be within a minute of ${exp}, ` +
                        `difference: ${timeDiffInSeconds.toFixed(1)}s`
                    );
                }

                return (
                    `${gt} should be within a minute of ${exp}, ` +
                    `actual difference: ${timeDiffInSeconds.toFixed(1)}s`
                );
            };

            return { pass, message };
        },
    });

    try {
        global.fastify = await build();
    } catch (e) {
        console.error(
            "beforeAll() - Building fastify caused an unknown exception",
            e
        );
    }
});

afterAll(async () => {
    await global.fastify.close();
});
