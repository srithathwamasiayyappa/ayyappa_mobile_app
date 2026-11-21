import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const LANGUAGE_METADATA: Record<string, { native: string; english: string; continueText: string }> = {
  te: { native: 'తెలుగు', english: 'Telugu', continueText: 'కొనసాగించండి' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada', continueText: 'ముందువರಿಸಿ' },
  en: { native: 'English', english: 'English', continueText: 'Continue' },
  ta: { native: 'தமிழ்', english: 'Tamil', continueText: 'தொடరவும்' },
  hi: { native: 'हिन्दी', english: 'Hindi', continueText: 'जारी रखें' },
};

@Controller('languages')
export class LanguagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getLanguages() {
    try {
      const langs = await this.prisma.language.findMany({
        orderBy: { id: 'asc' },
      });

      if (langs && langs.length > 0) {
        return langs.map((l) => {
          const meta = LANGUAGE_METADATA[l.code] || {
            native: l.name,
            english: l.name,
            continueText: 'Continue',
          };

          return {
            id: l.id,
            code: l.code,
            name: l.name,
            nativeName: meta.native,
            englishName: meta.english,
            displayName: `${meta.native} — ${meta.english}`,
            continueText: meta.continueText,
          };
        });
      }
    } catch (e) {
      console.warn('[Languages] Database offline, serving default languages catalog:', e);
    }

    // Default authentic languages catalog so app NEVER fails with 500
    return [
      { id: 1, code: 'te', name: 'Telugu', nativeName: 'తెలుగు', englishName: 'Telugu', displayName: 'తెలుగు — Telugu', continueText: 'కొనసాగించండి' },
      { id: 2, code: 'en', name: 'English', nativeName: 'English', englishName: 'English', displayName: 'English — English', continueText: 'Continue' },
      { id: 3, code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', englishName: 'Tamil', displayName: 'தமிழ் — Tamil', continueText: 'தொடరவும்' },
      { id: 4, code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', displayName: 'ಕನ್ನಡ — Kannada', continueText: 'ముందువರಿಸಿ' },
      { id: 5, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', englishName: 'Hindi', displayName: 'हिन्दी — Hindi', continueText: 'जारी रखें' },
    ];
  }
}

