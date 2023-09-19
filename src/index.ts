import Fastify from 'fastify';
import plugins from './plugins';
import modules from './modules';

export async function build() {
	const fastify = Fastify({
		logger: {
			level: 'error',
		},
	});

	await fastify.register(plugins);

	await fastify.register(modules, { prefix: '/api' });

	return fastify;
}
