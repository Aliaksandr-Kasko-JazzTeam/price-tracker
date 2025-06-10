# Price Tracker

## Environment Setup

1. Create a `.env` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env
```

2. Fill in the required environment variables in the `.env` file:

```env
# SMTP Configuration (Required for email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com

# JWT Configuration
JWT_SECRET=your_jwt_secret
SERVICE_SECRET=your_service_secret
```

3. Start the services:
```bash
chmod +x run.sh
./run.sh
```
or make sure you set all environment variables in .env and run:
```bash
docker compose -p price-tracker up -d
```

## Services

- UI: http://localhost:80
- API Gateway: http://localhost:3000
- RabbitMQ Management: http://localhost:15672
  - Username: pricetracker
  - Password: pricetracker


## Testing

1. To start e2e tests run
```bash
chmod +x run-tests.sh
./run-tests.sh
```
