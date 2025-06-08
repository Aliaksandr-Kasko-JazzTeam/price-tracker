#build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY libs/shared ./libs/shared

WORKDIR /app/libs/shared
RUN npm install
RUN npm run build

WORKDIR /app
COPY services/notification-service ./services/notification-service
COPY tsconfig.json ./

WORKDIR /app/services/notification-service
RUN npm install
RUN npm run build


# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/libs/shared/dist /app/libs/shared/dist
COPY --from=builder /app/libs/shared/package.json /app/libs/shared/
COPY --from=builder /app/libs/shared/node_modules /app/libs/shared/node_modules

COPY --from=builder /app/services/notification-service/dist /app/services/notification-service/dist
COPY --from=builder /app/services/notification-service/package.json /app/services/notification-service/
COPY --from=builder /app/services/notification-service/node_modules /app/services/notification-service/node_modules

WORKDIR /app/services/notification-service

CMD ["npm", "run", "start:prod"]
