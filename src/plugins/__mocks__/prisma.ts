import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { join } from "path";
import { v4 } from "uuid";

import { fastifyPlugin } from "fastify-plugin";
import { FastifyInstance } from "fastify";

if (!process.env.DATABASE_URL_WITHOUT_SCHEMA) {
    throw new Error("env variable DATABASE_URL_WITHOUT_SCHEMA is not set");
}

const schemaId = `test-${v4()}`;

process.env.DATABASE_URL =
    process.env.DATABASE_URL_WITHOUT_SCHEMA + "/" + schemaId;

beforeAll(() => {
    const prismaBinary = join(
        __dirname,
        "..",
        "..",
        "..",
        "node_modules",
        ".bin",
        "prisma"
    );

    execSync(`${prismaBinary} db push`, {
        env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL,
        },
    });
});

afterAll(async () => {
    await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${schemaId}\`;`);
    await prisma.$disconnect();
});

export const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
});

export default fastifyPlugin(
    async (fastify: FastifyInstance) => {
        fastify.addHook("onClose", async () => {
            await prisma.$disconnect();
        });
    },
    { dependencies: ["config"] }
);
