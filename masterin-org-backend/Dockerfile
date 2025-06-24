# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# Use --omit=dev if you have devDependencies that are not needed in production
# For this project, nodemon is a devDependency, so --omit=dev is appropriate.
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Make port available to the world outside this container
# Use the PORT environment variable, defaulting to 3001 if not set
ENV PORT 3001
EXPOSE ${PORT}

# Define environment variable for node environment
ENV NODE_ENV production

# Define the command to run your app
# This will use the "start" script from package.json: "NODE_ENV=production node index.js"
CMD ["npm", "start"]
