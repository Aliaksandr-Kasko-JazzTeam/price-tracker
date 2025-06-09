module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/main.ts',
    '/src/app.module.ts',
    '/src/cache/cache.module.ts',
    '/src/product/product.module.ts',
    '/src/queue/queue.module.ts',
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@price-tracker/shared(.*)$': '<rootDir>/../../libs/shared/src$1',
  },
};
