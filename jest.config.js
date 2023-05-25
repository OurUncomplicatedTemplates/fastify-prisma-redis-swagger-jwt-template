/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
    preset: "ts-jest",
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
    },
    setupFilesAfterEnv: ["./src/test/setupTest.ts"],
    collectCoverageFrom: [
        "./src/**",
        "!./src/plugins/prisma.ts",
        "!./src/server.ts",
    ],
    coverageReporters: ["json-summary", "text", "html"],
    coveragePathIgnorePatterns: ["node_modules"],
};
