import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";

import { build } from "../index";
import { prisma } from "../plugins/prisma";
import { redis } from "../plugins/redis";
import Redis from "ioredis";

declare global {
    var fastify: FastifyInstance;
    var prisma: PrismaClient;
    var redis: Redis;
}

export const setup = async () => {
    global.fastify = await build();
    global.prisma = prisma;
    global.redis = redis;
};
