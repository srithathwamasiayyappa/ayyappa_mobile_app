import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4005;
  await app.listen(port, '0.0.0.0');
  console.log(`Saranam Ayyappa API running on http://0.0.0.0:${port}/api/v1`);
}

bootstrap();
