import {Logger} from "@nestjs/common";
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  await NestFactory.createApplicationContext(AppModule);
  logger.log('Price monitor scheduler service is running');
}

bootstrap();
