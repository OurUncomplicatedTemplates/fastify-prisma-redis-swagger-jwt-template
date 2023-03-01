export = async function globalTeardown() {
    await global.fastify.close();
};
