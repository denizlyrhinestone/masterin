// jest.setup.js
import '@testing-library/jest-dom';

// Optional: Mock Next.js router if needed globally for many tests
// If you find many components need router mocks, uncommenting and customizing this can be useful.
// For now, specific tests can mock it if they directly use router features not provided by JSDOM.
// jest.mock('next/navigation', () => ({
//   useRouter: jest.fn(() => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     prefetch: jest.fn(),
//     back: jest.fn(),
//     pathname: '/',
//     query: {},
//     asPath: '/',
//     route: '/',
//   })),
//   usePathname: jest.fn(() => '/'),
//   useSearchParams: jest.fn(() => ({
//     get: jest.fn((param) => {
//       // Provide mock search params if needed for specific tests, e.g.
//       // if (param === 'someParam') return 'value';
//       return null;
//     }),
//     // Add other URLSearchParams methods if used by components under test
//   })),
//   useParams: jest.fn(() => ({
//     // Provide mock params if needed
//     // exampleParam: 'exampleValue',
//   }))
// }));

// Mock next/image to prevent errors in tests due to Next.js specific image optimization.
// It renders a simple <img> tag instead.
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    // All props are passed through, including src, alt, width, height, etc.
    // If 'priority' prop is passed, it's ignored here but doesn't cause an error.
    // If 'fill' prop is used, you might need to add some basic styling mocks if layout is critical for the test,
    // but usually, testing the presence and alt text is sufficient for unit tests.
    const { priority, fill, ...rest } = props; // Destructure out Next.js specific props not valid on <img>
    return <img {...rest} />;
  },
}));

// You can add other global mocks or setup here if needed.
// For example, mocking localStorage or sessionStorage if components use them directly:
// const localStorageMock = (() => {
//   let store = {};
//   return {
//     getItem: (key) => store[key] || null,
//     setItem: (key, value) => { store[key] = value.toString(); },
//     removeItem: (key) => { delete store[key]; },
//     clear: () => { store = {}; },
//   };
// })();
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Global fetch mock (if many components use fetch directly and you want a default mock)
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve({ mockData: true }),
//     ok: true,
//   })
// );
// However, for apiClient, it's better to mock apiClient itself in tests that use it.
