import { build } from '../src';

export default async (req: unknown, res: unknown) => {
	const app = await build();

	await app.ready();
	app.server.emit('request', req, res);
};
