# Build stage
FROM price-tracker-shared-lib AS build

WORKDIR /app

COPY services/ui ./services/ui

RUN npm install

WORKDIR /app/services/ui
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/services/ui/build /usr/share/nginx/html

COPY services/ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
