module.exports = {
  verbose: true,
  transform: {
    "^^.+\\.tsx?$": "ts-jest"
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testRegex: "/__tests__/.*.test.(js|ts|tsx)?$",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
  globalSetup: "./jest/globalSetup.js",
  coverageReporters: ["lcov", "html"],
  testEnvironment: "node",
  testURL: "http://localhost:4001"
};
