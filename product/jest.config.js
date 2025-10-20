/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: [ '**/__test__/**/*.test.js' ],
    setupFilesAfterEnv: [ '<rootDir>/test/setup.js' ],
    collectCoverageFrom: [ 'src/**/*.js', '!src/**/sever.js' ],
    verbose: true,
};