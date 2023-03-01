/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.(t|j)sx?$": "@swc/jest",
    },
    globalSetup: "./src/test/globalSetupHook.js",
    globalTeardown: "./src/test/globalTestTeardown.ts",
};
