FROM ghcr.io/puppeteer/puppeteer:22.13.1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g npm@10.8.2
RUN npm ci
COPY . .
CMD [ "node", "server.js" ]