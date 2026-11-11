import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getLanguages() {
    return this.prisma.language.findMany({
      orderBy: { id: 'asc' },
    });
  }
}

