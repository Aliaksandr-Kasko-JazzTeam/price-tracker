#build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY libs/shared ./libs/shared

WORKDIR /app/libs/shared
RUN npm install
RUN npm run build

WORKDIR /app
COPY services/api-gateway ./services/api-gateway
COPY tsconfig.json ./

WORKDIR /app/services/api-gateway
RUN npm install
RUN npm run build


# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/libs/shared/dist /app/libs/shared/dist
COPY --from=builder /app/libs/shared/package.json /app/libs/shared/
COPY --from=builder /app/libs/shared/node_modules /app/libs/shared/node_modules

COPY --from=builder /app/services/api-gateway/dist /app/services/api-gateway/dist
COPY --from=builder /app/services/api-gateway/package.json /app/services/api-gateway/
COPY --from=builder /app/services/api-gateway/node_modules /app/services/api-gateway/node_modules

WORKDIR /app/services/api-gateway

CMD ["npm", "run", "start:prod"]
