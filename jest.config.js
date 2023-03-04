/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
    },
    setupFilesAfterEnv: ["./src/test/setupTest.ts"],
    collectCoverageFrom: [
        "./src/**",
        "!./src/plugins/swagger.ts",
        "!./src/plugins/prisma.ts",
        "!./src/plugins/redis.ts",
        "!./src/server.ts",
    ],
    coveragePathIgnorePatterns: ["node_modules"],
};
