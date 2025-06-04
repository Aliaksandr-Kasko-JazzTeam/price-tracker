# Shared Library

This library contains shared code used across all microservices in the price tracker application.

## Prisma Client

The shared library includes a Prisma client that is used by all services to interact with the database. To use it:

1. Import the `PrismaModule` in your service's module:
```typescript
import { PrismaModule } from '@price-tracker/shared';

@Module({
  imports: [PrismaModule],
  // ...
})
export class YourModule {}
```

2. Inject the `PrismaService` in your service:
```typescript
import { PrismaService } from '@price-tracker/shared';

@Injectable()
export class YourService {
  constructor(private readonly prisma: PrismaService) {}
}
```

## Database Setup

1. Create a `.env` file in your service's root directory with the following content:
```
DATABASE_URL="mysql://user:password@localhost:3306/price_tracker"
```

2. Run the following commands to set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

## Available Models

- `Product`: Represents a product being tracked
- `PriceHistory`: Represents the price history of a product
