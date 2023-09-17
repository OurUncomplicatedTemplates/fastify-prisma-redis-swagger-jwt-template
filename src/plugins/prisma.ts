import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		fastify.addHook('onClose', async () => {
			await prisma.$disconnect();
		});
	},
	{ dependencies: ['config'] },
);
