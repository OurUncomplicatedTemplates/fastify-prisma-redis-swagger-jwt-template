import { build } from './index';

const start = async () => {
	let fastify;

	const start = performance.now();
	try {
		fastify = await build();
	} catch (e) {
		console.error('Error occured while building fastify');
		console.error(e);
		return;
	}

	fastify.log.info(`Successfully built fastify instance in ${performance.now() - start} ms`);

	await fastify.listen({
		host: fastify.config.HOST,
		port: fastify.config.PORT,
	});
};

start();
