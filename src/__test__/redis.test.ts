import { redis } from "../plugins/redis";

describe("remember()", () => {
    it("should return callback value, if not cached", async () => {
        await redis.del("key");

        const value = await redis.remember("key", 10, () => {
            return "Callback value";
        });

        expect(value).toEqual("Callback value");
    });

    it("should return cached value", async () => {
        await redis.set("key", "Cached value");

        const value = await redis.remember("key", 10, () => {
            return "Callback value";
        });

        expect(value).toEqual("Cached value");
    });

    it("should return callback JSON value, if not cached", async () => {
        await redis.del("key");

        const value = await redis.rememberJSON("key", 10, () => {
            return [
                {
                    id: "1000",
                    name: "Christian",
                    address: "Christian Ave. 108",
                },
            ];
        });

        expect(value).toEqual([
            {
                id: "1000",
                name: "Christian",
                address: "Christian Ave. 108",
            },
        ]);
    });

    it("should return cached JSON value", async () => {
        await redis.set(
            "key",
            JSON.stringify({
                id: "1000",
                name: "Christian",
                address: "Christian Ave. 108",
            })
        );

        const value = await redis.rememberJSON("key", 10, () => {
            return {
                id: "1001",
                name: "Frederik",
                address: "Frederik Ave. 109",
            };
        });

        expect(value).toEqual({
            id: "1000",
            name: "Christian",
            address: "Christian Ave. 108",
        });
    });

    it("should return callback generic value, if not cached", async () => {
        await redis.del("key");

        const value = await redis.rememberJSON<{
            id: number;
            name: string;
            address: string;
        }>("key", 10, () => {
            return {
                id: 1000,
                name: "Christian",
                address: "Christian Ave. 108",
            };
        });

        expect(value.id).toEqual(1000);
        expect(value.name).toEqual("Christian");
        expect(value.address).toEqual("Christian Ave. 108");
    });

    it("should return cached value, when setting new generic value", async () => {
        await redis.set(
            "key",
            JSON.stringify({
                id: 1000,
                name: "Christian",
                address: "Christian Ave. 108",
            })
        );

        const value = await redis.rememberJSON<{
            id: number;
            name: string;
            address: string;
        }>("key", 10, () => {
            return {
                id: 1001,
                name: "Frederik",
                address: "Frederik Ave. 109",
            };
        });

        expect(value.id).toEqual(1000);
        expect(value.name).toEqual("Christian");
        expect(value.address).toEqual("Christian Ave. 108");
    });

    it("should invalidate all caches set new", async () => {
        await redis.set("key", "Cached Value");
        await redis.set(
            "key2",
            JSON.stringify({
                id: "1000",
                name: "Christian",
                address: "Christian Ave. 108",
            })
        );

        await redis.invalidateCaches("key", "key2");

        const value = await redis.remember("key", 10, () => {
            return "Newest Value";
        });

        const value2 = await redis.rememberJSON<{
            id: number;
            name: string;
            address: string;
        }>("key2", 10, () => {
            return {
                id: 1001,
                name: "Frederik",
                address: "Frederik Ave. 109",
            };
        });

        expect(value).toEqual("Newest Value");

        expect(value2.id).toEqual(1001);
        expect(value2.name).toEqual("Frederik");
        expect(value2.address).toEqual("Frederik Ave. 109");
    });
});
