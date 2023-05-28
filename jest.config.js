/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {

  roots:[
    "<rootDir>/src"
  ],
  transform:{
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],

  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ["./.jest/setEnvVars.ts"],
  verbose:true,
  collectCoverage:true,
};