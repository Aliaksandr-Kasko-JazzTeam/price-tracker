#build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY libs/shared ./libs/shared

WORKDIR /app/libs/shared
RUN npm install
RUN npx prisma generate
RUN npm run build

WORKDIR /app
COPY services/auth-service ./services/auth-service
COPY tsconfig.json ./

WORKDIR /app/services/auth-service
RUN npm install
RUN npm run build


# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/libs/shared/dist /app/libs/shared/dist
COPY --from=builder /app/libs/shared/package.json /app/libs/shared/
COPY --from=builder /app/libs/shared/node_modules /app/libs/shared/node_modules

COPY --from=builder /app/services/auth-service/dist /app/services/auth-service/dist
COPY --from=builder /app/services/auth-service/package.json /app/services/auth-service/
COPY --from=builder /app/services/auth-service/node_modules /app/services/auth-service/node_modules

WORKDIR /app/services/auth-service

CMD ["npm", "run", "start:prod"]
