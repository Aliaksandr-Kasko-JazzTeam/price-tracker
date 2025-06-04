import {NestFactory} from '@nestjs/core';
import {Logger} from '@nestjs/common';
import {MicroserviceOptions, Transport} from '@nestjs/microservices';
import {AppModule} from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting price-checker-agent microservice...');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'price-check-queue',
        queueOptions: {
          durable: true,
          messageTtl: 30 * 60 * 1000,
        },
        noAck: false,
        prefetchCount: 1,
      },
    },
  );

  await app.listen();
  logger.log('Price checker agent microservice is listening');
}

bootstrap();
