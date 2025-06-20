FROM node:20-alpine

ARG MYSQL_HOST
ENV MYSQL_HOST=${MYSQL_HOST}

WORKDIR /app

COPY package*.json ./

COPY libs/shared ./libs/shared

RUN npm install

WORKDIR /app/libs/shared
RUN npm install

RUN npm run prisma:generate

COPY libs/shared/wait-for-db.sh /app/libs/shared/
RUN chmod +x /app/libs/shared/wait-for-db.sh

CMD sh -c "/app/libs/shared/wait-for-db.sh \
    && npm run prisma:migrate \
    && if [ \"$LOAD_TEST_WARMUP\" = \"true\" ]; then \
        npm run warmup:db; \
    fi"
