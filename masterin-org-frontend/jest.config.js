// jest.config.js
const nextJest = require('next/jest');

// Providing the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Runs after Jest environment is set up
  testEnvironment: 'jest-environment-jsdom', // Use JSDOM for testing React components
  moduleNameMapper: {
    // Handle CSS imports (e.g., CSS Modules)
    // https://jestjs.io/docs/webpack#handling-static-assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle image imports
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/__mocks__/fileMock.js',

    // Handle module aliases (this will be automatically configured by next/jest)
    // However, if you have custom aliases in tsconfig.json not automatically handled, add them here.
    // Example: '^@/lib/(.*)$': '<rootDir>/src/lib/$1', (next/jest usually handles this)
    // The `paths` option in tsconfig.json is automatically mapped by next/jest.
    // So, if `baseUrl` and `paths` are set in tsconfig, these manual mappings might be redundant for those.
    // For safety or if tsconfig aliases are complex, explicit mapping can be useful.
    // Let's assume next/jest handles common ones like @/components/* based on tsconfig.
    // If specific aliases are NOT picked up by next/jest based on tsconfig, add them here:
    // '^@/components/(.*)$': '<rootDir>/src/components/$1',
    // '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    // '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    // '^@/app/(.*)$': '<rootDir>/src/app/$1', // Be careful with app dir due to server components
    // '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts", // Exclude type definition files
    "!src/**/_app.{js,jsx,ts,tsx}",
    "!src/**/_document.{js,jsx,ts,tsx}",
    "!src/app/**/layout.{js,jsx,ts,tsx}", // Exclude layout files from app router
    "!src/app/**/page.{js,jsx,ts,tsx}",   // Often pages are better tested with E2E, exclude if desired
    "!src/types/**", // Exclude type definitions folder
    "!src/lib/apiClient.ts", // Example: Exclude if it's just a wrapper and tested via integration
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!jest.setup.js",
    "!**/__mocks__/**",
    // Add other files/folders to exclude from coverage
  ],
  // Optional: Set coverage thresholds
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
  // Important: transformIgnorePatterns is usually handled by next/jest for SWC
  // If you encounter issues with node_modules not being transformed, you might need to adjust this,
  // but typically next/jest handles it.
  // transformIgnorePatterns: [
  //   '/node_modules/',
  //   '^.+\\.module\\.(css|sass|scss)$',
  // ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
