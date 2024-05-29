const config = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  moduleDirectories: ["<rootDir>/node_modules", "<rootDir>/src"],
  roots: ["<rootDir>"],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  // Runs special logic, such as cleaning up components
  // when using React Testing Library and adds special
  // extended assertions to Jest
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  // Module file extensions for importing
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Added by Paul
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "src/**/*.{ts,tsx}",
    "!**/index.ts",
    "!**/interface.ts",
    "!**/main.ts",
  ],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/__dummy__/styleMock.ts",
  },

  // Plugin for watch patterns
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
};

export default config;
