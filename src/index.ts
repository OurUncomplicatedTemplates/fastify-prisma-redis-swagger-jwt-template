import Fastify from 'fastify';
import plugins from './plugins';
import modules from './modules';

export async function build() {
	const fastify = Fastify({
		logger:
			process.env.NODE_ENV === 'test'
				? /* istanbul ignore next */ false
				: /* istanbul ignore next */ {
						transport: {
							target: 'pino-pretty',
							options: {
								translateTime: 'HH:MM:ss Z',
								ignore: 'pid,hostname',
							},
						},
				  },
	});

	const startPlugins = performance.now();
	await fastify.register(plugins);
	fastify.log.info(`Plugins ${performance.now() - startPlugins} ms`);

	const startModules = performance.now();
	await fastify.register(modules, { prefix: '/api' });
	fastify.log.info(`Modules ${performance.now() - startModules} ms`);

	return fastify;
}
