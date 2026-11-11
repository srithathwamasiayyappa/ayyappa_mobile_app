import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PanchangamCalculator, CITIES } from './panchangam.calculator';

@Controller('panchangam')
export class PanchangamController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('locations')
  getLocations() {
    return Object.values(CITIES).map((c) => ({
      name: c.name,
      nameTe: c.nameTe,
      nameKn: c.nameKn,
      nameTa: c.nameTa,
      nameHi: c.nameHi,
      timezone: c.timezone,
    }));
  }

  @Get('day')
  getDayPanchangam(
    @Query('date') dateString?: string,
    @Query('city') city = 'Hyderabad',
    @Query('lang') lang = 'te',
  ) {
    const validLang = ['te', 'kn', 'en', 'ta', 'hi'].includes(lang) ? lang : 'te';
    const targetDate = dateString ? new Date(dateString) : new Date();
    return PanchangamCalculator.calculateDay(targetDate, city, validLang);
  }

  @Get('month')
  getMonthPanchangam(
    @Query('year') yearParam?: string,
    @Query('month') monthParam?: string,
    @Query('city') city = 'Hyderabad',
    @Query('lang') lang = 'te',
  ) {
    const validLang = ['te', 'kn', 'en', 'ta', 'hi'].includes(lang) ? lang : 'te';
    const now = new Date();
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1; // 1-indexed

    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const targetDate = new Date(Date.UTC(year, month - 1, d, 0, 48, 0)); // ~06:18 AM IST
      days.push(PanchangamCalculator.calculateDay(targetDate, city, validLang));
    }

    return {
      year,
      month,
      city,
      lang: validLang,
      totalDays: daysInMonth,
      days,
    };
  }

  @Get('festivals')
  getFestivals(
    @Query('year') yearParam?: string,
    @Query('lang') lang = 'te',
  ) {
    const validLang = ['te', 'kn', 'en', 'ta', 'hi'].includes(lang) ? lang : 'te';
    const year = yearParam ? parseInt(yearParam, 10) : 2026;

    const festivals = [
      {
        date: `${year}-01-14`,
        name: {
          te: 'మకర సంక్రాంతి / మకరవిళక్కు',
          kn: 'ಮಕರ ಸಂಕ್ರಾಂತಿ / ಮಕರವಿಳಕ್ಕು',
          en: 'Makara Sankranti / Makaravilakku',
          ta: 'மகர சங்கராந்தி / மகரவிளக்கு',
          hi: 'मकर संक्रांति / मकरविलक्कु',
        },
        type: 'major',
      },
      {
        date: `${year}-04-01`,
        name: {
          te: 'పంబా ఆరాట్టు (అయ్యప్ప స్వామి జయంతి)',
          kn: 'ಪಂಪಾ ಆರಾಟ್ಟು (ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ ಜಯಂತಿ)',
          en: 'Pamba Arattu (Sri Ayyappa Jayanthi)',
          ta: 'பம்பா ஆராட்டு (ஸ்ரீ ஐயப்ப ஜெயந்தி)',
          hi: 'पंपा आराट्टु (श्री अय्यप्पा जयंती)',
        },
        type: 'ayyappa',
      },
      {
        date: `${year}-11-17`,
        name: {
          te: 'మండల పూజ ప్రారంభం (వృశ్చిక మాసం 1)',
          kn: 'ಮಂಡಲ ಪೂಜೆ ಪ್ರಾರಂಭ (ವೃಶ್ಚಿಕ ಮಾಸ 1)',
          en: 'Mandala Pooja Commencement (Vrischika 1)',
          ta: 'மண்டல பூஜை தொடக்கம் (கார்த்திகை 1)',
          hi: 'मंडला पूजा आरंभ (वृश्चिक मास 1)',
        },
        type: 'mandala',
      },
      {
        date: `${year}-12-27`,
        name: {
          te: 'మండల పూజ ముగింపు',
          kn: 'ಮಂಡಲ ಪೂಜೆ ಮುಕ್ತಾಯ',
          en: 'Mandala Pooja Finale',
          ta: 'மண்டல பூஜை நிறைவு',
          hi: 'मंडला पूजा समापन',
        },
        type: 'mandala',
      },
    ];

    return festivals.map((f) => ({
      date: f.date,
      name: f.name[validLang as 'te' | 'kn' | 'en' | 'ta' | 'hi'] || f.name.en,
      type: f.type,
    }));
  }

  @Get('ayyappa-events')
  getAyyappaEvents(
    @Query('year') yearParam?: string,
    @Query('lang') lang = 'te',
  ) {
    return this.getFestivals(yearParam, lang);
  }

  @Get()
  async getTodayPanchangam(
    @Query('lang') lang = 'te',
    @Query('date') dateString?: string,
    @Query('city') city = 'Hyderabad',
  ) {
    const validLang = ['te', 'kn', 'en', 'ta', 'hi'].includes(lang) ? lang : 'te';
    const targetDate = dateString ? new Date(dateString) : new Date();
    const isoDate = targetDate.toISOString().split('T')[0];

    const calculated = PanchangamCalculator.calculateDay(targetDate, city, validLang);

    let dbDetails = null;
    let samvatsaram = calculated.samvatsaram;
    let paksham = calculated.paksham;
    let tithi = calculated.tithi;
    let nakshatram = calculated.nakshatram;
    let vaaram = calculated.vaaram;
    let ayanaRitu = '';

    try {
      const entry = await this.prisma.panchangamEntry.findFirst({
        where: {
          calendarDate: {
            gte: new Date(`${isoDate}T00:00:00.000Z`),
            lte: new Date(`${isoDate}T23:59:59.999Z`),
          },
        },
        include: {
          translations: {
            include: { language: true },
          },
        },
      });

      if (entry && entry.translations.length > 0) {
        const match = entry.translations.find((t) => t.language.code === validLang) || entry.translations[0];
        if (match) {
          if (match.samvatsaram) samvatsaram = match.samvatsaram;
          if (match.paksham) paksham = match.paksham;
          if (match.tithi) tithi = match.tithi;
          if (match.nakshatram) nakshatram = match.nakshatram;
          if (match.vaaram) vaaram = match.vaaram;
          if (match.ayanaRitu) ayanaRitu = match.ayanaRitu;
          if (match.detailsJson) {
            try {
              dbDetails = JSON.parse(match.detailsJson);
            } catch (e) {
              dbDetails = null;
            }
          }
        }
      }
    } catch (e) {
      // Graceful fallback to pure astronomical calculation
    }

    const tithiLabels: Record<string, string> = {
      te: 'తిథి',
      kn: 'ತಿಥಿ',
      en: 'Tithi',
      ta: 'திதி',
      hi: 'तिथि',
    };
    const followedLabels: Record<string, string> = {
      te: 'తదుపరి',
      kn: 'ನಂತರ',
      en: 'Followed by',
      ta: 'அடுத்து',
      hi: 'तत्पश्चात',
    };
    const starLabels: Record<string, string> = {
      te: 'నక్షత్రం',
      kn: 'ನಕ್ಷತ್ರ',
      en: 'Star',
      ta: 'நட்சத்திரம்',
      hi: 'नक्षत्र',
    };
    const yogaLabels: Record<string, string> = {
      te: 'యోగం',
      kn: 'ಯೋಗ',
      en: 'Yoga',
      ta: 'யோகம்',
      hi: 'योग',
    };
    const karanaLabels: Record<string, string> = {
      te: 'కరణం',
      kn: 'ಕರಣ',
      en: 'Karana',
      ta: 'கரணம்',
      hi: 'करण',
    };
    const auspiciousLabels: Record<string, string> = {
      te: 'శుభ ఘడియలు',
      kn: 'ಶುಭ ಘಳಿಗೆಗಳು',
      en: 'Auspicious Time',
      ta: 'சுப நேரம்',
      hi: 'शुभ मुहूर्त',
    };
    const inauspiciousLabels: Record<string, string> = {
      te: 'అశుభ ఘడియలు',
      kn: 'ಅಶುಭ ಘಳಿಗೆಗಳು',
      en: 'Inauspicious Time',
      ta: 'அசுப காலம்',
      hi: 'अशुभ समय',
    };
    const sunriseLabels: Record<string, string> = {
      te: 'సూర్యోదయం',
      kn: 'ಸೂರ್ಯೋದಯ',
      en: 'Sunrise',
      ta: 'சூரிய உதயம்',
      hi: 'सूर्योदय',
    };
    const sunsetLabels: Record<string, string> = {
      te: 'సూర్యాస్తమయం',
      kn: 'ಸೂರ್ಯಾಸ್ತಮಯ',
      en: 'Sunset',
      ta: 'சூரிய அஸ்தமனம்',
      hi: 'सूर्यास्त',
    };
    const rahuLabels: Record<string, string> = {
      te: 'రాహు కాలం',
      kn: 'ರಾಹು ಕಾಲ',
      en: 'Rahu Kalam',
      ta: 'ராகு காலம்',
      hi: 'राहुकाल',
    };

    return {
      dayNumber: calculated.dayNumber,
      monthText: calculated.monthText,
      year: calculated.year,
      city: calculated.city,
      cityNameLocalized: calculated.cityNameLocalized,
      samvatsaram,
      maasa: calculated.maasa,
      paksham,
      tithi,
      tithiEndTime: calculated.tithiEndTime,
      nextTithi: calculated.nextTithi,
      nakshatram,
      nakshatraEndTime: calculated.nakshatraEndTime,
      nextNakshatram: calculated.nextNakshatram,
      vaaram,
      sunrise: calculated.sunrise,
      sunset: calculated.sunset,
      rahuKalam: calculated.rahuKalam,
      yamagandam: calculated.yamagandam,
      gulikaKalam: calculated.gulikaKalam,
      ayanaRitu,
      details: dbDetails || {
        date: calculated.isoDate,
        dayName: calculated.vaaram,
        samvatsara: samvatsaram,
        ayanaRitu: ayanaRitu || 'దక్షిణాయనం - శరద్ ఋతువు',
        maasaPaksha: `${calculated.maasa} - ${paksham}`,
        tithi: {
          title: tithiLabels[validLang] || 'Tithi',
          items: [
            `${tithi}: ${calculated.tithiEndTime}`,
            `${followedLabels[validLang] || 'Followed by'} ${calculated.nextTithi}`
          ],
        },
        star: {
          title: starLabels[validLang] || 'Star',
          items: [
            `${nakshatram}: ${calculated.nakshatraEndTime}`,
            `${followedLabels[validLang] || 'Followed by'} ${calculated.nextNakshatram}`
          ],
        },
        yoga: {
          title: yogaLabels[validLang] || 'Yoga',
          items: ['సౌభాగ్యము: 02:56 am', 'శోభనము: 03:09 am'],
        },
        karana: {
          title: karanaLabels[validLang] || 'Karana',
          items: ['నాగవము: 12:32 pm', 'కింస్తుఘ్నము: 01:13 am'],
        },
        auspiciousTime: {
          title: auspiciousLabels[validLang] || 'Auspicious Time',
          items: [
            'అభిజిత్ ముహూర్తం: 11:37 am - 12:22 pm',
            'అమృతకాలం: 11:48 pm - 01:31 am',
            'బ్రాహ్మీ ముహూర్తం: 4:45 am - 05:33 am',
          ],
        },
        inauspiciousTime: {
          title: inauspiciousLabels[validLang] || 'Inauspicious Time',
          items: [
            `${rahuLabels[validLang] || 'Rahu Kalam'}: ${calculated.rahuKalam}`,
            `యమగండం: ${calculated.yamagandam}`,
            'దుర్ముహూర్తం: 12:22 pm - 01:07 pm',
          ],
        },
        sunTimes: `${sunriseLabels[validLang] || 'Sunrise'}: ${calculated.sunrise} || ${sunsetLabels[validLang] || 'Sunset'}: ${calculated.sunset}`,
      },
    };
  }
}
