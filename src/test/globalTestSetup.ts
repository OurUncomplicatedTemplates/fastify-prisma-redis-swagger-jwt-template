import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";

import { build } from "../index";
import { prisma } from "../plugins/prisma";

declare global {
    var fastify: FastifyInstance;
    var prisma: PrismaClient;
}

export const setup = async () => {
    global.fastify = await build();
    global.prisma = prisma;
};
