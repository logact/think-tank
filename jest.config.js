module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node', // Use "jsdom" if testing UI or DOM interactions
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    verbose: true,
};
