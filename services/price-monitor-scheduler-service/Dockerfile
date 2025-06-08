#build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY libs/shared ./libs/shared

WORKDIR /app/libs/shared
RUN npm install
RUN npm run prisma:generate
RUN npm run build

WORKDIR /app
COPY services/price-monitor-scheduler-service ./services/price-monitor-scheduler-service
COPY tsconfig.json ./

WORKDIR /app/services/price-monitor-scheduler-service
RUN npm install
RUN npm run build


# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/libs/shared/dist /app/libs/shared/dist
COPY --from=builder /app/libs/shared/package.json /app/libs/shared/
COPY --from=builder /app/libs/shared/node_modules /app/libs/shared/node_modules

COPY --from=builder /app/services/price-monitor-scheduler-service/dist /app/services/price-monitor-scheduler-service/dist
COPY --from=builder /app/services/price-monitor-scheduler-service/package.json /app/services/price-monitor-scheduler-service/
COPY --from=builder /app/services/price-monitor-scheduler-service/node_modules /app/services/price-monitor-scheduler-service/node_modules

WORKDIR /app/services/price-monitor-scheduler-service

CMD ["npm", "run", "start:prod"]
