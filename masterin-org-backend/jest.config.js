// jest.config.js
module.exports = {
  testEnvironment: 'node',
  verbose: true, // Output individual test results
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/", // Jest's own coverage output folder
    "/tests/jest.setup.js", // Example setup file, if any
    "/lib/s3Client.js", // If this was the old S3 client, now unused
    "/lib/s3Service.js", // External service wrapper, might test via integration tests
    "/lib/emailService.js", // External service wrapper
    "/db/database.js", // Database connection module, usually tested via integration tests
    "/index.js", // Main entry point, tested via integration tests
    // Add other paths to ignore if needed, e.g., config files, specific lib files not tested directly
  ],
  // Optional: Setup file to run before each test suite (e.g., for global mocks or DB setup)
  // setupFilesAfterEnv: ['./tests/jest.setup.js'], // Keep this commented unless the file is created with actual setup

  // Optional: Collect coverage from specific directories
  // This helps in focusing coverage reports on your actual source code.
  // Adjust the paths if your source code is structured differently (e.g., not in a 'src' folder).
  collectCoverageFrom: [
    "**/*.js", // Collect from all JS files in the project root and subdirectories
    "!**/node_modules/**",
    "!**/vendor/**", // Example: ignore vendor libraries if any
    "!**/coverage/**",
    "!jest.config.js", // Exclude Jest config itself
    "!**/tests/**", // Exclude test files themselves from coverage report
    // Add more specific ignores as needed, e.g.,
    // "!index.js", // if index.js is just bootstrapping
    // "!db/database.js", // if it's just connection setup
    // "!lib/s3Service.js", // if it's primarily AWS SDK wrappers
    // "!lib/emailService.js", // if it's primarily AWS SDK wrappers
  ],
  // You might want to set a coverage threshold
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: -10, // Example: allow 10 uncovered statements
  //   },
  // },
};
