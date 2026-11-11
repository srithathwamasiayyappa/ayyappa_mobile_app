import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('home')
export class HomeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('ticker')
  async getTicker(@Query('lang') lang = 'te') {
    // 1. Try unified devotional_ticker from Admin Console
    const mainTicker = await this.prisma.appSetting.findUnique({
      where: { key: 'devotional_ticker' },
    });

    if (mainTicker && mainTicker.value) {
      return { text: mainTicker.value };
    }

    // 2. Try language-specific setting
    const langTicker = await this.prisma.appSetting.findUnique({
      where: { key: `ticker_mantra_${lang}` },
    });

    if (langTicker && langTicker.value) {
      return { text: langTicker.value };
    }

    return { text: '🕉️ స్వామియే శరణం అయ్యప్ప — శ్రీ అయ్యప్ప స్వామి నిత్య పూజా విధానం, అష్టోత్తరం, హరివరాసనం మరియు సమగ్ర శబరిమల యాత్రా దర్శిని 🕉️' };
  }

  // Public CMS endpoints for mobile app
  @Get('cms')
  async getAllCms() {
    return this.prisma.appSetting.findMany({
      where: {
        key: { in: ['about_us', 'terms_conditions', 'privacy_policy', 'sabarimala_guidelines'] }
      }
    });
  }

  @Get('cms/:key')
  async getCmsByKey(@Param('key') key: string) {
    return this.prisma.appSetting.findUnique({
      where: { key }
    });
  }
}
