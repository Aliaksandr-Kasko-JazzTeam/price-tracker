import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
  console.log('Price monitor scheduler service is running');
}

bootstrap();
