export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/backend/', '<rootDir>/dist/'],
  collectCoverageFrom: [
    'tests/**/*.js',
    '!node_modules/**',
    '!dist/**',
    '!**/*.config.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/backend/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/tests/$1'
  },
  transform: {},
  testTimeout: 10000
};
