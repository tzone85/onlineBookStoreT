module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["cli.js", "!node_modules/**", "!coverage/**"],
  coverageDirectory: "coverage",
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/*.test.js"],
  moduleNameMapper: {
    "^yargs$": "<rootDir>/node_modules/yargs/yargs",
  },
  setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
};
