import { Module } from '@nestjs/common';
import { SplashController } from './splash.controller';
import { SplashService } from './splash.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SplashController],
  providers: [SplashService],
  exports: [SplashService],
})
export class SplashModule {}

