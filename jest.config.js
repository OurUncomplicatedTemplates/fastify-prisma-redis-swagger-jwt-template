/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
    },
    setupFilesAfterEnv: ["./src/test/setupTest.ts"],
    collectCoverageFrom: [
        "./src/modules/**",
        "./src/plugins/**",
        "!./src/plugins/swagger.ts",
    ],
    coveragePathIgnorePatterns: ["node_modules"],
};
