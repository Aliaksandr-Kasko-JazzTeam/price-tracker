FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY libs/shared ./libs/shared

RUN npm install

WORKDIR /app/libs/shared
RUN npm install

RUN npm run prisma:generate

ENV DATABASE_URL=mysql://pricetracker:pricetracker@mysql:3306/price_tracker

CMD ["npm", "run", "prisma:migrate"]
