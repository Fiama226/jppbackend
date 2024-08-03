FROM ghcr.io/puppeteer/puppeteer:22.13.1
FROM node:22.5.1-alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm ci
COPY . .
USER app
CMD [ "node", "server.js" ]