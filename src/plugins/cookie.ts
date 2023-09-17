import { FastifyInstance } from 'fastify';

import fastifyCookie from '@fastify/cookie';
import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		await fastify.register(fastifyCookie, {
			secret: fastify.config.SECRET,
			parseOptions: {},
		});
	},
	{ name: 'cookie', dependencies: ['config'] },
);
