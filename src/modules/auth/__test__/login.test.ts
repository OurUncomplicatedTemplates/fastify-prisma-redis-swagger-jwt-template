import { User } from '@prisma/client';
import { jwt } from '../../../plugins/jwt';
import UserService from '../user.service';

describe('POST /api/auth/login', () => {
	let userService: UserService;

	let user: User;
	const userPassword = '1234';

	beforeAll(async () => {
		userService = new UserService();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: userPassword,
		});
	});

	it('should return status 200, set a refreshToken and return a new accessToken', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {
				email: user.email,
				password: userPassword,
			},
		});

		const refreshToken: { value: string } = response.cookies[0];

		expect(response.statusCode).toBe(200);
		expect(jwt.verify(refreshToken.value)).toBeTruthy();
		expect(refreshToken).toEqual({
			expires: expect.toBeWithinOneMinuteOf(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
			httpOnly: true,
			name: 'refreshToken',
			path: '/api/auth/refresh',
			sameSite: 'None',
			secure: true,
			value: expect.any(String),
		});
		expect(jwt.verify(response.json().accessToken)).toBeTruthy();
	});

	it('should return status 401, when password is incorrect', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {
				email: user.email,
				password: userPassword + '1',
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'email and/or password incorrect',
			statusCode: 401,
		});
	});

	it('should return status 401, when no user has email', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {
				email: '1' + user.email,
				password: userPassword,
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'email and/or password incorrect',
			statusCode: 401,
		});
	});

	it('should return status 400, when no email or password has been provided', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			message: "body must have required property 'email'",
			statusCode: 400,
		});
	});

	it('should return status 400, when no email has been provided', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {
				password: userPassword,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			message: "body must have required property 'email'",
			statusCode: 400,
		});
	});

	it('should return status 400, when no password has been provided', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/login',
			payload: {
				email: user.email,
			},
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: 'Bad Request',
			message: "body must have required property 'password'",
			statusCode: 400,
		});
	});
});
