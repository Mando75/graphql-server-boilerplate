module.exports = {
  verbose: false,
  globals: {
    port: 4001,
    host: 'http://localhost:4001'
  },
  transform: {
    "^^.+\\.tsx?$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testRegex: "/__tests__/.*.test.(js|ts|tsx)?$",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
};
