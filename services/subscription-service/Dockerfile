#build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY libs/shared ./libs/shared

WORKDIR /app/libs/shared
RUN npm install
RUN npm run prisma:generate
RUN npm run build

WORKDIR /app
COPY services/subscription-service ./services/subscription-service
COPY tsconfig.json ./

WORKDIR /app/services/subscription-service
RUN npm install
RUN npm run build


# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/libs/shared/dist /app/libs/shared/dist
COPY --from=builder /app/libs/shared/package.json /app/libs/shared/
COPY --from=builder /app/libs/shared/node_modules /app/libs/shared/node_modules

COPY --from=builder /app/services/subscription-service/dist /app/services/subscription-service/dist
COPY --from=builder /app/services/subscription-service/package.json /app/services/subscription-service/
COPY --from=builder /app/services/subscription-service/node_modules /app/services/subscription-service/node_modules

WORKDIR /app/services/subscription-service

CMD ["npm", "run", "start:prod"]
