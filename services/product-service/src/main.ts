import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import {MicroserviceOptions, Transport} from '@nestjs/microservices';
import {AppModule} from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'product-service-queue',
      queueOptions: {
        durable: true,
        messageTtl: 30 * 60 * 1000,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Product service is running on port ${port}`);
}

bootstrap();
