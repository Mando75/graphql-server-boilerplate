module.exports = {
  verbose: true,
  globals: {
    port: 4001,
    host: 'http://localhost:4001/graphql'
  },
  transform: {
    "^^.+\\.tsx?$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testRegex: "/__tests__/.*.test.(js|ts|tsx)?$",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
  globalSetup: './jest/globalSetup.js'
};
