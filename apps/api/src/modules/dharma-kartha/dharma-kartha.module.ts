import { Module } from '@nestjs/common';
import { DharmaKarthaController } from './dharma-kartha.controller';
import { DharmaKarthaService } from './dharma-kartha.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DharmaKarthaController],
  providers: [DharmaKarthaService],
  exports: [DharmaKarthaService],
})
export class DharmaKarthaModule {}
