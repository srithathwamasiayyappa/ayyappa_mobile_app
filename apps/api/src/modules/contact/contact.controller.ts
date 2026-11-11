import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getContactInfo() {
    return {
      appName: 'Saranam Ayyappa Devotional Portal',
      email: 'support@ayyappa.org',
      helpline: '+91 4735 202028',
      whatsapp: '+91 94477 95577',
      address: 'Travancore Devaswom Board, Sabarimala Sannidhanam, Pathanamthitta, Kerala - 689662',
      templeTimings: 'Morning: 3:00 AM – 1:00 PM | Evening: 3:00 PM – 11:00 PM (Harivarasanam)',
    };
  }

  @Post('inquiry')
  async submitInquiry(@Body() body: { name: string; phone: string; email?: string; message: string }) {
    const { name, phone, email, message } = body;

    if (!name || !phone || !message) {
      throw new BadRequestException('Name, phone number, and message are required.');
    }

    const created = await this.prisma.contactInquiry.create({
      data: {
        name,
        phone,
        email: email || null,
        message,
      },
    });

    return {
      success: true,
      message: 'Your inquiry has been received. Swamiye Saranam Ayyappa!',
      data: created,
    };
  }
}

