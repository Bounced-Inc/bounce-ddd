module.exports = {
    // The test environment to use
    testEnvironment: 'node',
    // The file extensions to use for tests
    testMatch: ['**/*.test.ts'],
    // The TypeScript compiler options to use
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
    // The Jest transform configuration options
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};
