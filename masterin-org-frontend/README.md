This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Available Scripts

In the project directory, you can run:

-   `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`):
    Runs the app in development mode with hot reloading.
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

-   `npm run build` (or `yarn build`, `pnpm build`, `bun build`):
    Builds the app for production to the `.next` folder.
    It correctly bundles React in production mode and optimizes the build for the best performance.

-   `npm start` (or `yarn start`, `pnpm start`, `bun start`):
    Starts the application in production mode. This command should be used after you have built the application with `npm run build`.
    It serves the optimized production build from the `.next` folder. The Next.js server will respect the `PORT` environment variable if set, otherwise it defaults to port 3000.

-   `npm run lint` (or `yarn lint`, `pnpm lint`, `bun lint`):
    Runs ESLint to find and fix problems in your JavaScript/TypeScript code.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Before running the application locally, you need to set up environment variables.
Copy the example environment file `.env.local.example` to a new file named `.env.local`:

```bash
cp .env.local.example .env.local
```

Open the `.env.local` file and update the variables as needed:

-   `NEXT_PUBLIC_API_BASE_URL`: This variable defines the base URL for the backend API.
    -   For local development, if your Next.js app (frontend) is on port 3000 and your backend API (e.g., `masterin-org-backend`) is on port 3001, you would typically set this to `http://localhost:3001/api`.
    -   If your backend API is hosted elsewhere (e.g., a staging or production environment), update this URL accordingly (e.g., `https://api.yourdomain.com/api`).
    -   The application has a fallback to `/api` if this variable is not set, which assumes the API is served from the same domain and port (e.g., via Next.js rewrites or if the Next.js app also serves as the backend).

Refer to `.env.local.example` for the structure and any other client-side variables that might be added. Remember that only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
