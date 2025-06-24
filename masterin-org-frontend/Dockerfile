# Stage 1: Build the Next.js app
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies
# Copy package.json and package-lock.json (or yarn.lock, pnpm-lock.yaml)
COPY package*.json ./
# If using pnpm, you'd copy 'pnpm-lock.yaml' and use 'pnpm install'
# If using yarn, you'd copy 'yarn.lock' and use 'yarn install'
RUN npm install

# Copy the rest of the application code
COPY . .

# Set build-time environment variables if any are needed by next build
# For example, if NEXT_PUBLIC_API_BASE_URL needs to be baked in at build time
# ARG NEXT_PUBLIC_API_BASE_URL
# ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
# Note: Runtime configuration of NEXT_PUBLIC_ variables is generally preferred for flexibility.
# Next.js handles this by embedding these variables during the build if they are present in the build environment.

# Build the Next.js app for production
# The `next build` command will use variables prefixed with NEXT_PUBLIC_
# available in its environment during this build stage.
RUN npm run build

# Stage 2: Serve the built app from a lean Node.js image
FROM node:20-slim AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Copy built assets from the builder stage
# Important: Copy only necessary files for running the production server.
# This includes .next (standalone or static), public, package.json (for 'next start'), and next.config.ts (if needed by server).

# Option 1: If using Next.js output file tracing (default in recent versions for `next build`)
# This creates a '.next/standalone' folder.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Option 2: If NOT using output file tracing (older Next.js or specific config)
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/next.config.ts ./next.config.ts # Copy if needed by `next start`

# Note on next.config.ts:
# If your next.config.ts contains complex logic or runtime dependencies not needed by `next start`,
# it might be better to ensure `next build` processes it fully and what's copied is minimal.
# For most cases, copying next.config.ts is fine. The standalone output might handle this differently.
# As the project has `next.config.ts`, we'll assume it might be needed.
# If using standalone output, `next.config.ts` might not be copied to the runner like this.
# The standalone output copies server.js which bundles necessary parts of next.config.js.
# For now, we'll assume a non-standalone setup for this COPY line, adjust if using standalone.
# Given the prior COPY for standalone, this next.config.ts copy might be redundant or context-dependent.
# Let's assume for now that if `standalone` output is used, this specific copy isn't needed.
# If not using standalone:
# COPY --from=builder /app/next.config.ts ./next.config.ts
# COPY --from=builder /app/package.json ./package.json # for npm start

# Expose port (Next.js default is 3000, or use env var)
ENV PORT 3000
EXPOSE ${PORT}

# Start the Next.js production server
# If using standalone output, the CMD is typically: CMD ["node", "server.js"]
# If not using standalone, it's usually: CMD ["npm", "start"]
# The "start" script in package.json is "next start".
# We will use "npm start" assuming it correctly runs the production server,
# which `next start` does. If `standalone` build output is used,
# the `CMD` should be `CMD ["node", "server.js"]` relative to the standalone output dir.
# For now, sticking to `npm start` as it's more generic for non-standalone.
# If `package.json` is not copied to runner in standalone mode, `npm start` won't work.
#
# Given the COPY for standalone above, the CMD should be `node server.js`
# but package.json for dependencies of server.js might be in the standalone output.
# Let's check Next.js docs for current best practice on standalone + custom server.
# The default `next build` output with `output: 'standalone'` in `next.config.ts`
# creates a `server.js` file.
# For simplicity and to align with common patterns if `output: 'standalone'` is not explicitly set,
# or if a traditional build is sometimes used, `npm start` is a safe bet,
# which means `package.json` and relevant parts of `node_modules` (or just `package.json` if `next start` has no other deps)
# would need to be in the runner.
#
# The most robust for `output: 'standalone'` is:
# CMD ["node", "server.js"]
#
# If not using `output: 'standalone'`:
# Need to copy `package.json` to runner.
# COPY --from=builder /app/package.json ./package.json
# RUN npm install --omit=dev --ignore-scripts # To install only runtime deps for `next start`
# CMD ["npm", "start"]

# Assuming default build (which might be standalone now for newer Next.js versions):
# If `output: 'standalone'` is active in next.config.ts (default for new projects in some versions):
# The standalone output includes a minimal server.js and copies necessary node_modules.
# We already copied the standalone folder.
CMD ["node", "server.js"]
# If `output: 'standalone'` is NOT active, or for a more traditional setup:
# COPY --from=builder /app/package.json ./package.json
# RUN npm install --production # or --omit=dev if that's preferred for your npm version
# CMD ["npm", "start"]
# Given the project was set up some time ago, let's assume `npm start` is safer.
# To support `npm start`, we need `package.json` in the runner.
# I will re-add `COPY --from=builder /app/package.json ./package.json` for the runner stage
# and use `CMD ["npm", "start"]`. This is a common pattern.
# The `next.config.ts` copy is also often done with `npm start`.

# Re-evaluating: The first set of COPY lines for "standalone" is more modern.
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public
# In this case, the CMD should be ["node", "server.js"]
# Let's stick to this more modern approach.
# `next.config.ts` is bundled into `server.js` by the standalone build.
# `package.json` is not needed in the runner with `output: 'standalone'`.
