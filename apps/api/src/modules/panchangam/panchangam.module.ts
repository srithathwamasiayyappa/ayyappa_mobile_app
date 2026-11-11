import { Module } from '@nestjs/common';
import { PanchangamController } from './panchangam.controller';

@Module({
  controllers: [PanchangamController],
})
export class PanchangamModule {}

