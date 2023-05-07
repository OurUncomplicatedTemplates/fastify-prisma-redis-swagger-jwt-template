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
        "!./src/server.ts",
    ],
    coverageReporters: ["json-summary", "text", "lcov"],
    coveragePathIgnorePatterns: ["node_modules"],
};
