# Use the Puppeteer image as the base image to include Chromium
FROM ghcr.io/puppeteer/puppeteer:22.13.1

# Set working directory
WORKDIR /usr/src/app

# Install Node.js (if not included in the base image, otherwise remove this line)
# Uncomment the following lines if Node.js needs to be installed manually:
# RUN apk add --no-cache nodejs npm

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Switch to a non-root user if necessary
USER app

# Command to run the application
CMD [ "node", "server.js" ]
