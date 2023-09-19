import { FastifyInstance } from 'fastify';

import fastifyCors from '@fastify/cors';
import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		await fastify.register(fastifyCors, {
			origin: fastify.config.ALLOWED_ORIGINS,
			allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
			credentials: true,
		});
	},
	{ name: 'cors', dependencies: ['config'] },
);
