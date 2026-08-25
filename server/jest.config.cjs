module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": "babel-jest",
  },
  // Source imports use explicit ".js" extensions (NodeNext-style resolution
  // for the real ESM runtime) — strip that back off so Jest's CJS resolver
  // finds the actual .ts files instead.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/*.test.ts"],
};
