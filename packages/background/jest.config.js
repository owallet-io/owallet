module.exports = {
  setupFilesAfterEnv: ["./src/jest.setup.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
};
