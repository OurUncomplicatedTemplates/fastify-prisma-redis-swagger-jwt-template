import { User } from '@prisma/client';
import { jwt } from '../../../plugins/jwt';
import TimeUtil from '../../../utils/time';
import UserService from '../user.service';
import AuthService from '../auth.service';

describe('GET /api/auth/user', () => {
	let userService: UserService;
	let authService: AuthService;

	let user: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();

		user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});
	});

	it('should return status 200 and return user', async () => {
		const { accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/auth/user',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			name: user.name,
			email: user.email,
		});
	});

	it('should return status 401, user does not exist', async () => {
		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/auth/user',
			headers: {
				authorization:
					'Bearer ' +
					jwt.signAccessToken({
						sub: 542,
						iat: TimeUtil.getNowUnixTimeStamp(),
					}),
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});

	it('should return status 401, accessToken invalid', async () => {
		const response = await global.fastify.inject({
			method: 'GET',
			url: '/api/auth/user',
			headers: {
				authorization: 'invalid_access_token!!!',
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});
});
