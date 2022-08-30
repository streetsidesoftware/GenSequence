module.exports = {
    "roots": [
        "./src"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testMatch": [
        "**/*.test.ts"
    ],
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "moduleNameMapper": {
    },
    "coverageReporters": ["json", "lcov", "text", "clover", "html"]
}
