FROM node:20-alpine

WORKDIR /app
COPY package*.json ./

RUN npm install --only=dev

COPY jest-e2e.config.js ./
COPY tests/ ./tests/

CMD ["npx", "jest", "--config", "jest-e2e.config.js"]
