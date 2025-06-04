import {NestFactory} from '@nestjs/core';
import {Logger} from "@nestjs/common";
import {MicroserviceOptions, Transport} from '@nestjs/microservices';
import {NotificationModule} from './notification/notification.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting Notification Service...');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL!],
        queue: 'price-change-notifications',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  logger.log('Notification service is listening');
}

bootstrap();
