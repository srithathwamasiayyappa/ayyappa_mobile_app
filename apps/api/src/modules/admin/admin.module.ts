import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AdminController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AdminModule {}
