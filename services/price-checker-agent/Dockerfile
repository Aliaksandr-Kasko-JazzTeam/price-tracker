#build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY libs/shared ./libs/shared

WORKDIR /app/libs/shared
RUN npm install
RUN npm run prisma:generate
RUN npm run build

WORKDIR /app
COPY services/price-checker-agent ./services/price-checker-agent
COPY tsconfig.json ./

WORKDIR /app/services/price-checker-agent
RUN npm install
RUN npm run build


# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/libs/shared/dist /app/libs/shared/dist
COPY --from=builder /app/libs/shared/package.json /app/libs/shared/
COPY --from=builder /app/libs/shared/node_modules /app/libs/shared/node_modules

COPY --from=builder /app/services/price-checker-agent/dist /app/services/price-checker-agent/dist
COPY --from=builder /app/services/price-checker-agent/package.json /app/services/price-checker-agent/
COPY --from=builder /app/services/price-checker-agent/node_modules /app/services/price-checker-agent/node_modules

WORKDIR /app/services/price-checker-agent

CMD ["npm", "run", "start:prod"]
