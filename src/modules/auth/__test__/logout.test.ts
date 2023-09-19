import { prisma } from '../../../plugins/prisma';
import UserService from '../user.service';
import AuthService from '../auth.service';

describe('POST /api/auth/logout', () => {
	let userService: UserService;
	let authService: AuthService;

	beforeAll(async () => {
		userService = new UserService();
		authService = new AuthService();
	});

	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	it('should return status 200 and clear the refreshToken', async () => {
		const user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});

		const { refreshTokenPayload, accessToken } = await authService.createTokens(user.id);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/logout',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		const refreshTokenCookie: { value: string } = response.cookies[0];

		expect(response.statusCode).toBe(200);
		expect(refreshTokenCookie).toEqual({
			expires: new Date(0),
			httpOnly: true,
			name: 'refreshToken',
			path: '/api/auth/refresh',
			sameSite: 'None',
			secure: true,
			value: '',
		});

		// Check that the refreshToken is actually deleted from the database
		const userSession = await prisma.userSession.findUnique({
			where: {
				tokenFamily: refreshTokenPayload.tokenFamily,
			},
		});

		expect(userSession).toBeNull();
	});

	it('should return status 200 even if the refresh token is already deleted from the database', async () => {
		const user = await userService.createUser({
			name: 'Joe Biden the 1st',
			email: 'joe@biden.com',
			password: '1234',
		});

		const { refreshTokenPayload, accessToken } = await authService.createTokens(user.id);

		await prisma.userSession.delete({
			where: {
				tokenFamily: refreshTokenPayload.tokenFamily,
			},
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/logout',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		const refreshTokenCookie: { value: string } = response.cookies[0];

		expect(response.statusCode).toBe(200);
		expect(refreshTokenCookie).toEqual({
			expires: new Date(0),
			httpOnly: true,
			name: 'refreshToken',
			path: '/api/auth/refresh',
			sameSite: 'None',
			secure: true,
			value: '',
		});
	});

	it('should return status 401 if no accessToken is given', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/logout',
		});

		expect(response.statusCode).toBe(401);
	});
});
