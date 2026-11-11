import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContactController],
})
export class ContactModule {}

