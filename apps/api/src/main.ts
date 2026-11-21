import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');

  // Support payload limit up to 20MB for image data
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // Find authoritative uploads directory
  const candidates = [
    path.join(process.cwd(), 'apps', 'api', 'uploads'),
    path.join(__dirname, '..', '..', 'uploads'),
    path.join(__dirname, '..', 'uploads'),
    path.join(process.cwd(), 'uploads'),
  ];
  const uploadsDir = candidates.find((dir) => fs.existsSync(dir)) || candidates[0];
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.use('/uploads', express.static(uploadsDir));
  app.use('/api/v1/uploads', express.static(uploadsDir));
  app.use('/images', express.static(uploadsDir));
  app.use('/api/v1/images', express.static(uploadsDir));

  const port = Number(process.env.PORT) || 4001;
  await app.listen(port);
  console.log(`Saranam Ayyappa API running on http://localhost:${port} with prefix /api/v1`);
  console.log(`Serving static uploads from: ${uploadsDir}`);
}

bootstrap();
