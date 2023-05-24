import { build } from "../src";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async (req: any, res: any) => {
    const app = await build();

    await app.ready();
    app.server.emit("request", req, res);
};
