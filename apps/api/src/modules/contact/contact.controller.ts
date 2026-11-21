import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getContactInfo(@Query('lang') lang = 'te') {
    const TIMINGS_BY_LANG: Record<string, string> = {
      te: 'ఉదయం: 3:00 AM – 1:00 PM | సాయంత్రం: 3:00 PM – 11:00 PM (హరివరాసనం)',
      kn: 'ಬೆಳಗ್ಗೆ: 3:00 AM – 1:00 PM | ಸಂಜೆ: 3:00 PM – 11:00 PM (ಹರಿವರಾಸನಂ)',
      en: 'Morning: 3:00 AM – 1:00 PM | Evening: 3:00 PM – 11:00 PM (Harivarasanam)',
      ta: 'காலை: 3:00 AM – 1:00 PM | மாலை: 3:00 PM – 11:00 PM (ஹரிவராசனம்)',
      hi: 'प्रातः: 3:00 AM – 1:00 PM | सायं: 3:00 PM – 11:00 PM (हरिवरासनम्)',
    };

    const ADDRESS_BY_LANG: Record<string, string> = {
      te: 'ట్రావెన్‌కోర్ దేవస్వొం బోర్డు, శబరిమల సన్నిధానం, పతనంతిట్ట, కేరళ - 689662',
      kn: 'ಟ್ರಾವಂಕೋರ್ ದೇವಸ್ವಂ ಮಂಡಳಿ, ಶಬರಿಮಲೆ ಸನ್ನಿಧಾನಂ, ಪತ್ತನಂತಿಟ್ಟ, ಕೇರಳ - 689662',
      en: 'Travancore Devaswom Board, Sabarimala Sannidhanam, Pathanamthitta, Kerala - 689662',
      ta: 'திருவிதாங்கூர் தேவஸ்வம் போர்டு, சபரிமலை சன்னிதானம், பத்தனம்திட்டா, கேரளா - 689662',
      hi: 'त्रावणकोर देवस्वोम बोर्ड, सबरीमाला सन्निधानम्, पथानामथिट्टा, केरल - 689662',
    };

    const APP_NAME_BY_LANG: Record<string, string> = {
      te: 'శరణం అయ్యప్ప భక్త సహాయ కేంద్రం',
      kn: 'ಶರಣಂ ಅಯ್ಯಪ್ಪ ಭಕ್ತ ಸಹಾಯ ಕೇಂದ್ರ',
      en: 'Saranam Ayyappa Devotional Portal',
      ta: 'சரணம் ஐயப்பா பக்தர் உதவி மையம்',
      hi: 'शरणम् अय्यप्पा भक्त सहायता केंद्र',
    };

    return {
      appName: APP_NAME_BY_LANG[lang] || APP_NAME_BY_LANG.en,
      email: 'support@ayyappa.org',
      helpline: '+91 4735 202028',
      whatsapp: '+91 94477 95577',
      address: ADDRESS_BY_LANG[lang] || ADDRESS_BY_LANG.en,
      templeTimings: TIMINGS_BY_LANG[lang] || TIMINGS_BY_LANG.en,
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

