const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  // rootDir resolves <rootDir> tokens; __dirname avoids the \.claude glob bug
  rootDir: __dirname,
  // testRegex is a plain regex applied to the full path string — it does NOT
  // use glob expansion, so the \.claude segment in the absolute path causes
  // no issues here.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  // Exclude App.test.js (pre-existing CRA placeholder that imports axios ESM)
  testPathIgnorePatterns: ['/node_modules/', '/src/App\\.test\\.js$'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    }],
  },
  // Transform ESM-only packages so they can be required by CommonJS tests
  transformIgnorePatterns: [
    '/node_modules/(?!(sockjs-client|@stomp/stompjs|react-hot-toast|axios|react-router|react-router-dom|@remix-run)/)' ,
  ],
  moduleNameMapper: {
    // Jest 27 doesn't support package.json "exports". Map react-router packages
    // to their CJS dist files explicitly.
    '^react-router-dom$': path.join(__dirname, 'node_modules/react-router-dom/dist/index.js'),
    '^react-router$': path.join(__dirname, 'node_modules/react-router/dist/development/index.js'),
    '^react-router/dom$': path.join(__dirname, 'node_modules/react-router/dist/development/dom-export.js'),
    '\\.(css|less|scss|sass|png|jpg|svg|gif|ico|ttf|woff|woff2|jpeg)$':
      path.join(__dirname, 'src/__mocks__/fileMock.js'),
  },
  // Explicit node_modules path so Jest finds packages regardless of CWD
  modulePaths: [path.join(__dirname, 'node_modules')],
  // Polyfills that must run before any module is imported (TextEncoder needed by react-router)
  setupFiles: [path.join(__dirname, 'jest.setup.js')],
  // jest-dom matchers — runs after the test framework is installed
  setupFilesAfterEnv: [path.join(__dirname, 'src/setupTests.js')],
  testEnvironment: 'jsdom',
};
