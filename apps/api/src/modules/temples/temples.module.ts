import { Module } from '@nestjs/common';
import { TemplesController } from './temples.controller';
import { TemplesService } from './temples.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TemplesController],
  providers: [TemplesService],
  exports: [TemplesService],
})
export class TemplesModule {}
