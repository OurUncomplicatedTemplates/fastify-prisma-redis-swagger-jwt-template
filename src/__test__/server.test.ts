describe('GET /api/health', () => {
	it('should return status 200', async () => {
		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/health',
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({ status: 'OK' });
	});
});
