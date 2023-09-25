import Fastify from 'fastify';
import plugins from './plugins';
import modules from './modules';

const getLoggerConfig = () => {
	switch (process.env.NODE_ENV) {
		case 'test':
			return false;
		case 'local':
			return {
				transport: {
					target: 'pino-pretty',
					options: {
						translateTime: 'HH:MM:ss Z',
						ignore: 'pid,hostname',
					},
				},
			};
		default:
			return true;
	}
};

export async function build() {
	const fastify = Fastify({
		logger: getLoggerConfig(),
	});

	const startPlugins = performance.now();
	await fastify.register(plugins);
	fastify.log.info(`Plugins ${(performance.now() - startPlugins).toFixed(2)} ms`);

	const startModules = performance.now();
	await fastify.register(modules, { prefix: '/api' });
	fastify.log.info(`Modules ${(performance.now() - startModules).toFixed(2)} ms`);

	return fastify;
}
