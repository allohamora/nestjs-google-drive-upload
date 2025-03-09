/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: 'e2e',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '__tests__/e2e/.*.spec.ts$',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-e2e-context.ts'],
  moduleDirectories: ['<rootDir>', 'node_modules'],
  collectCoverageFrom: ['src/**/*.ts'],
  testTimeout: 15_000,
  logHeapUsage: true,
};
