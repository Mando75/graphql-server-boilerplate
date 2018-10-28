module.exports = {
  verbose: false,
  transform: {
    "^^.+\\.tsx?$": "ts-jest"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  testRegex: "/__tests__/.*.test.(js|ts|tsx)?$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "json",
    "node"
  ]
};
