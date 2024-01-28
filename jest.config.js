/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 20000,
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};