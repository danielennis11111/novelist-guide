# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock if you use yarn)
COPY package*.json ./

# Install production dependencies
# Using npm ci for reproducible builds if package-lock.json is present
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose the port the app runs on
# This should match the port your Express app listens on (e.g., 8080)
EXPOSE 8080

# Define the command to run your app using CMD which defines your runtime
# Ensure server.js is your entry point or change it accordingly
CMD [ "node", "server.js" ] 