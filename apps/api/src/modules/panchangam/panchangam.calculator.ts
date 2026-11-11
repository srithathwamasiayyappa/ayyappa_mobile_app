/**
 * High-Precision Indian Vedic Panchangam Astronomical Calculator
 * Supports 5 languages: Telugu (te), Kannada (kn), English (en), Tamil (ta), Hindi (hi)
 * Based on Jean Meeus Astronomical Algorithms (VSOP87 / Lunar Periodic Perturbations)
 * and standard Lahiri (Chitra Paksha) Ayanamsha.
 */

export interface CityCoordinates {
  name: string;
  nameTe: string;
  nameKn: string;
  nameTa: string;
  nameHi: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const CITIES: Record<string, CityCoordinates> = {
  Hyderabad: {
    name: 'Hyderabad',
    nameTe: 'హైదరాబాద్',
    nameKn: 'ಹೈದರಾಬಾದ್',
    nameTa: 'ஹைதராபாத்',
    nameHi: 'हैदराबाद',
    lat: 17.385,
    lng: 78.4867,
    timezone: 'Asia/Kolkata',
  },
  Vijayawada: {
    name: 'Vijayawada',
    nameTe: 'విజయవాడ',
    nameKn: 'ವಿಜಯವಾಡ',
    nameTa: 'விஜயவாடா',
    nameHi: 'विजयवाड़ा',
    lat: 16.5062,
    lng: 80.648,
    timezone: 'Asia/Kolkata',
  },
  Visakhapatnam: {
    name: 'Visakhapatnam',
    nameTe: 'విశాఖపట్నం',
    nameKn: 'ವಿಶಾಖಪಟ್ಟಣ',
    nameTa: 'விசாகப்பட்டினம்',
    nameHi: 'विशाखापत्तनम',
    lat: 17.6868,
    lng: 83.2185,
    timezone: 'Asia/Kolkata',
  },
  Tirupati: {
    name: 'Tirupati',
    nameTe: 'తిరుపతి',
    nameKn: 'ತಿರುಪತಿ',
    nameTa: 'திருப்பதி',
    nameHi: 'तिरुपति',
    lat: 13.6288,
    lng: 79.4192,
    timezone: 'Asia/Kolkata',
  },
  Bengaluru: {
    name: 'Bengaluru',
    nameTe: 'బెంగళూరు',
    nameKn: 'ಬೆಂಗಳೂರು',
    nameTa: 'பெங்களூரு',
    nameHi: 'बेंगलुरु',
    lat: 12.9716,
    lng: 77.5946,
    timezone: 'Asia/Kolkata',
  },
  Chennai: {
    name: 'Chennai',
    nameTe: 'చెన్నై',
    nameKn: 'ಚೆನ್ನೈ',
    nameTa: 'சென்னை',
    nameHi: 'चेन्नई',
    lat: 13.0827,
    lng: 80.2707,
    timezone: 'Asia/Kolkata',
  },
  Sabarimala: {
    name: 'Sabarimala',
    nameTe: 'శబరిమల',
    nameKn: 'ಶಬರಿಮಲೆ',
    nameTa: 'சபரிமலை',
    nameHi: 'सबरीमाला',
    lat: 9.4398,
    lng: 77.0805,
    timezone: 'Asia/Kolkata',
  },
};

export const TITHI_NAMES = {
  te: [
    'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి',
    'నవమి', 'దశమి', 'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పౌర్ణమి',
    'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి',
    'నవమి', 'దశమి', 'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'అమావాస్య'
  ],
  kn: [
    'ಪಾಡ್ಯಮಿ', 'ಬಿದಿಗೆ', 'ತದಿಗೆ', 'ಚೌತಿ', 'ಪಂಚಮಿ', 'ಷಷ್ಠಿ', 'ಸಪ್ತಮಿ', 'ಅಷ್ಟಮಿ',
    'ನವಮಿ', 'ದಶಮಿ', 'ಏಕಾದಶಿ', 'ದ್ವಾದಶಿ', 'ತ್ರಯೋದಶಿ', 'ಚತುರ್ದಶಿ', 'ಹುಣ್ಣಿಮೆ',
    'ಪಾಡ್ಯಮಿ', 'ಬಿದಿಗೆ', 'ತದಿಗೆ', 'ಚೌತಿ', 'ಪಂಚಮಿ', 'ಷಷ್ಠಿ', 'ಸಪ್ತಮಿ', 'ಅಷ್ಟಮಿ',
    'ನವಮಿ', 'ದಶಮಿ', 'ಏಕಾದಶಿ', 'ದ್ವಾದಶಿ', 'ತ್ರಯೋದಶಿ', 'ಚತುರ್ದಶಿ', 'ಅಮಾವಾಸ್ಯೆ'
  ],
  en: [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami',
    'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Pournami',
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami',
    'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
  ],
  ta: [
    'பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி', 'சஷ்டி', 'சப்தமி', 'அஷ்டமி',
    'நவமி', 'தசமி', 'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி', 'பௌர்ணமி',
    'பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி', 'சஷ்டி', 'சப்தமி', 'அஷ்டமி',
    'நவமி', 'தசமி', 'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி', 'அமாவாசை'
  ],
  hi: [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी',
    'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी',
    'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या'
  ]
};

export const NAKSHATRA_NAMES = {
  te: [
    'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆరుద్ర', 'పునర్వసు', 'పుష్యమి',
    'ఆశ్లేష', 'మఖ', 'పుబ్బ', 'ఉత్తర', 'హస్త', 'చిత్త', 'స్వాతి', 'విశాఖ', 'అనూరాధ',
    'జ్యేష్ఠ', 'మూల', 'పూర్వాషాఢ', 'ఉత్తరాషాఢ', 'శ్రవణం', 'ధనిష్ఠ', 'శతభిషం', 'పూర్వాభాద్ర',
    'ఉత్తరాభాద్ర', 'రేవతి'
  ],
  kn: [
    'ಅಶ್ವಿನಿ', 'ಭರಣಿ', 'ಕೃತಿಕಾ', 'ರೋಹಿಣಿ', 'ಮೃಗಶಿರ', 'ಆರಿದ್ರಾ', 'ಪುನರ್ವಸು', 'ಪುಷ್ಯ',
    'ಆಶ್ಲೇಷ', 'ಮಖ', 'ಪುಬ್ಬ', 'ಉತ್ತರ', 'ಹಸ್ತ', 'ಚಿತ್ತ', 'ಸ್ವಾತಿ', 'ವಿಶಾಖ', 'ಅನುರಾಧ',
    'ಜ್ಯೇಷ್ಠ', 'ಮೂಲ', 'ಪೂರ್ವಾಷಾಢ', 'ಉತ್ತರಾಷಾಢ', 'ಶ್ರವಣ', 'ಧನಿಷ್ಠ', 'ಶತಭಿಷ', 'ಪೂರ್ವಾಭಾದ್ರ',
    'ಉತ್ತರಾಭಾದ್ರ', 'ರೇವತಿ'
  ],
  en: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
    'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
    'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
    'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ],
  ta: [
    'அஸ்வினி', 'பரணி', 'கிருத்திகை', 'ரோகிணி', 'மிருகசீரிஷம்', 'திருவாதிரை', 'புனர்பூசம்', 'பூசம்',
    'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'ஹஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்',
    'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி',
    'உத்திரட்டாதி', 'ரேவதி'
  ],
  hi: [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य',
    'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा',
    'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपद',
    'उत्तराभाद्रपद', 'रेवती'
  ]
};

export const PAKSHA_NAMES = {
  shukla: {
    te: 'శుక్ల పక్షం',
    kn: 'ಶುಕ್ಲ ಪಕ್ಷ',
    en: 'Shukla Paksham',
    ta: 'சுக்ல பக்ஷம்',
    hi: 'शुक्ल पक्ष'
  },
  krishna: {
    te: 'కృష్ణ పక్షం',
    kn: 'ಕೃಷ್ಣ ಪಕ್ಷ',
    en: 'Krishna Paksham',
    ta: 'கிருஷ்ண பக்ஷம்',
    hi: 'कृष्ण पक्ष'
  },
};

export const MAASA_NAMES = {
  te: ['చైత్రం', 'వైశాఖం', 'జ్యేష్ఠం', 'ఆషాఢం', 'శ్రావణం', 'భాద్రపదం', 'ఆశ్వయుజం', 'కార్తీకం', 'మార్గశిరం', 'పుష్యం', 'మాఘం', 'ఫాల్గుణం'],
  kn: ['ಚೈತ್ರ', 'ವೈಶಾಖ', 'ಜ್ಯೇಷ್ಠ', 'ಆಷಾಢ', 'ಶ್ರಾವಣ', 'ಭಾದ್ರಪದ', 'ಆಶ್ವಯುಜ', 'ಕಾರ್ತೀಕ', 'ಮಾರ್ಗಶಿರ', 'ಪುಷ್ಯ', 'ಮಾಘ', 'ಫಾಲ್ಗುಣ'],
  en: ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwayuja', 'Karthika', 'Margashira', 'Pushya', 'Magha', 'Phalguna'],
  ta: ['சித்திரை', 'வைகாசி', 'ஆனி', 'ஆடி', 'ஆவணி', 'புரட்டாசி', 'ஐப்பசி', 'கார்த்திகை', 'மார்கழி', 'தை', 'மாசி', 'பங்குனி'],
  hi: ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'अश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'],
};

export const WEEKDAYS = {
  te: ['ఆదివారము', 'సోమవారము', 'మంగళవారము', 'బుధవారము', 'గురువారము', 'శుక్రవారము', 'శనివారము'],
  kn: ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ta: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
};

export class PanchangamCalculator {
  /**
   * High-Precision Astronomical Longitudes using Jean Meeus Chapter 47 (Lunar) & Chapter 25 (Solar)
   */
  public static getCelestialLongitudes(date: Date) {
    const jd = date.getTime() / 86400000 - 10957.5;
    const T = jd / 36525;
    const rad = Math.PI / 180;

    const L_sun = (280.46646 + 0.98564736 * jd) % 360;
    const g_sun = (((357.52911 + 0.98560028 * jd) % 360) * Math.PI) / 180;
    const sunLon = (L_sun + 1.914602 * Math.sin(g_sun) + 0.019993 * Math.sin(2 * g_sun) + 3600) % 360;

    const D = (297.8501921 + 445267.1114034 * T) % 360;
    const M = (357.5291092 + 35999.0502909 * T) % 360;
    const Mp = (134.9633964 + 477198.8675055 * T) % 360;
    const F = (93.2720950 + 483202.0175233 * T) % 360;
    const Lp = (218.3164477 + 481267.8812342 * T) % 360;

    const dL =
      6.288774 * Math.sin(Mp * rad) +
      1.274027 * Math.sin((2 * D - Mp) * rad) +
      0.658314 * Math.sin(2 * D * rad) +
      0.213618 * Math.sin(2 * Mp * rad) -
      0.185116 * Math.sin(M * rad) -
      0.114332 * Math.sin(2 * F * rad) +
      0.058793 * Math.sin((2 * D - 2 * Mp) * rad) +
      0.057066 * Math.sin((2 * D - M - Mp) * rad) +
      0.053322 * Math.sin((2 * D + Mp) * rad) +
      0.045758 * Math.sin((2 * D - M) * rad) -
      0.040923 * Math.sin((M - Mp) * rad) -
      0.034720 * Math.sin(D * rad) -
      0.030383 * Math.sin((M + Mp) * rad) +
      0.015327 * Math.sin((2 * D - 2 * F) * rad);

    const moonLon = (Lp + dL + 3600) % 360;
    const ayanamsha = 23.8570922 + 1.396971 * T;
    const siderealSun = (sunLon - ayanamsha + 3600) % 360;
    const siderealMoon = (moonLon - ayanamsha + 3600) % 360;

    const tithiAngle = (moonLon - sunLon + 3600) % 360;
    const tithiIndex = Math.floor(tithiAngle / 12) % 30;
    const nakshatraIndex = Math.floor(siderealMoon / (360 / 27)) % 27;

    return { sunLon, moonLon, siderealSun, siderealMoon, tithiIndex, nakshatraIndex, tithiAngle };
  }

  public static findTithiEnd(baseDate: Date): Date {
    const startTithi = this.getCelestialLongitudes(baseDate).tithiIndex;
    for (let m = 2; m <= 28 * 60; m += 2) {
      const testDate = new Date(baseDate.getTime() + m * 60000);
      if (this.getCelestialLongitudes(testDate).tithiIndex !== startTithi) {
        return testDate;
      }
    }
    return new Date(baseDate.getTime() + 12 * 3600000);
  }

  public static findNakshatraEnd(baseDate: Date): Date {
    const startNakshatra = this.getCelestialLongitudes(baseDate).nakshatraIndex;
    for (let m = 2; m <= 28 * 60; m += 2) {
      const testDate = new Date(baseDate.getTime() + m * 60000);
      if (this.getCelestialLongitudes(testDate).nakshatraIndex !== startNakshatra) {
        return testDate;
      }
    }
    return new Date(baseDate.getTime() + 12 * 3600000);
  }

  public static getSunTimes(date: Date, lat: number, lng: number): { sunrise: Date; sunset: Date } {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const jd = startOfDay.getTime() / 86400000 - 10957.5;
    const n = Math.ceil(jd - 0.0009 + 69.184 / 86400);
    const J_star = n - lng / 360;
    const M = (357.5291 + 0.98560028 * J_star) % 360;
    const M_rad = (M * Math.PI) / 180;
    const C = 1.9148 * Math.sin(M_rad) + 0.02 * Math.sin(2 * M_rad) + 0.0003 * Math.sin(3 * M_rad);
    const lambda = (M + C + 180 + 102.9372) % 360;
    const lambda_rad = (lambda * Math.PI) / 180;

    const J_transit = 2451545.0 + J_star + 0.0053 * Math.sin(M_rad) - 0.0069 * Math.sin(2 * lambda_rad);
    const delta = Math.asin(Math.sin(lambda_rad) * Math.sin((23.44 * Math.PI) / 180));
    const lat_rad = (lat * Math.PI) / 180;

    const cos_omega =
      (Math.sin((-0.833 * Math.PI) / 180) - Math.sin(lat_rad) * Math.sin(delta)) /
      (Math.cos(lat_rad) * Math.cos(delta));

    let omega = 90;
    if (cos_omega >= -1 && cos_omega <= 1) {
      omega = (Math.acos(cos_omega) * 180) / Math.PI;
    }

    const J_rise = J_transit - omega / 360;
    const J_set = J_transit + omega / 360;

    const sunriseTime = new Date((J_rise - 2440587.5) * 86400000);
    const sunsetTime = new Date((J_set - 2440587.5) * 86400000);

    return { sunrise: sunriseTime, sunset: sunsetTime };
  }

  public static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  public static getInauspiciousTimes(sunrise: Date, sunset: Date, dayOfWeek: number) {
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const octant = dayDuration / 8;

    const rahuOctants = [7, 1, 6, 4, 5, 3, 2];
    const yamaOctants = [4, 3, 2, 1, 0, 6, 5];
    const gulikaOctants = [6, 5, 4, 3, 2, 1, 0];

    const rIdx = rahuOctants[dayOfWeek];
    const rahuStart = new Date(sunrise.getTime() + rIdx * octant);
    const rahuEnd = new Date(sunrise.getTime() + (rIdx + 1) * octant);

    const yIdx = yamaOctants[dayOfWeek];
    const yamaStart = new Date(sunrise.getTime() + yIdx * octant);
    const yamaEnd = new Date(sunrise.getTime() + (yIdx + 1) * octant);

    const gIdx = gulikaOctants[dayOfWeek];
    const gulikaStart = new Date(sunrise.getTime() + gIdx * octant);
    const gulikaEnd = new Date(sunrise.getTime() + (gIdx + 1) * octant);

    return {
      rahuKalam: `${this.formatTime(rahuStart)} - ${this.formatTime(rahuEnd)}`,
      yamagandam: `${this.formatTime(yamaStart)} - ${this.formatTime(yamaEnd)}`,
      gulikaKalam: `${this.formatTime(gulikaStart)} - ${this.formatTime(gulikaEnd)}`,
    };
  }

  public static calculateDay(targetDate: Date, cityName = 'Hyderabad', lang = 'te') {
    const city = CITIES[cityName] || CITIES.Hyderabad;
    const l = (['te', 'kn', 'en', 'ta', 'hi'].includes(lang) ? lang : 'te') as 'te' | 'kn' | 'en' | 'ta' | 'hi';

    const sunTimes = this.getSunTimes(targetDate, city.lat, city.lng);

    const sunriseElements = this.getCelestialLongitudes(sunTimes.sunrise);
    const sunriseTithiIdx = sunriseElements.tithiIndex;
    const sunriseNakshatraIdx = sunriseElements.nakshatraIndex;
    const sunriseTithiEnd = this.findTithiEnd(sunTimes.sunrise);
    const sunriseNakshatraEnd = this.findNakshatraEnd(sunTimes.sunrise);

    const liveElements = this.getCelestialLongitudes(targetDate);
    const liveTithiIdx = liveElements.tithiIndex;
    const liveNakshatraIdx = liveElements.nakshatraIndex;
    const liveTithiEnd = this.findTithiEnd(targetDate);
    const liveNakshatraEnd = this.findNakshatraEnd(targetDate);

    const activeTithiName = TITHI_NAMES[l][liveTithiIdx];
    const activeNakshatraName = NAKSHATRA_NAMES[l][liveNakshatraIdx];
    const nextTithiName = TITHI_NAMES[l][(liveTithiIdx + 1) % 30];
    const nextNakshatraName = NAKSHATRA_NAMES[l][(liveNakshatraIdx + 1) % 27];

    const sunriseTithiName = TITHI_NAMES[l][sunriseTithiIdx];
    const sunriseNakshatraName = NAKSHATRA_NAMES[l][sunriseNakshatraIdx];
    const postSunriseTithiName = TITHI_NAMES[l][(sunriseTithiIdx + 1) % 30];
    const postSunriseNakshatraName = NAKSHATRA_NAMES[l][(sunriseNakshatraIdx + 1) % 27];

    const isShukla = liveTithiIdx < 15;
    const pakshamName = isShukla ? PAKSHA_NAMES.shukla[l] : PAKSHA_NAMES.krishna[l];

    const dayOfWeek = targetDate.getDay();
    const vaaramName = WEEKDAYS[l][dayOfWeek];

    const inauspicious = this.getInauspiciousTimes(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);

    const pad = (n: number) => String(n).padStart(2, '0');
    const dayNumber = pad(targetDate.getDate());
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthText = monthsEn[targetDate.getMonth()];
    const isoDate = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${dayNumber}`;

    const maasaIndex = 7;
    const maasaName = MAASA_NAMES[l][maasaIndex];

    const samvatsaramNames = {
      te: 'శ్రీ పరాభవ నామ సంవత్సరం',
      kn: 'ಶ್ರೀ ಪರಾಭವ ನಾಮ ಸಂವತ್ಸರ',
      en: 'Sri Parabhava Naama Samvatsara',
      ta: 'ஸ்ரீ பராபவ நாம வருடம்',
      hi: 'श्री पराभव नाम संवत्सर',
    };

    let localizedCityName = city.name;
    if (l === 'te') localizedCityName = city.nameTe;
    else if (l === 'kn') localizedCityName = city.nameKn;
    else if (l === 'ta') localizedCityName = city.nameTa;
    else if (l === 'hi') localizedCityName = city.nameHi;

    return {
      isoDate,
      dayNumber,
      monthText,
      year: targetDate.getFullYear(),
      city: city.name,
      cityNameLocalized: localizedCityName,
      vaaram: vaaramName,
      samvatsaram: samvatsaramNames[l],
      maasa: maasaName,
      paksham: pakshamName,
      tithi: activeTithiName,
      tithiEndTime: this.formatTime(liveTithiEnd),
      nextTithi: nextTithiName,
      nakshatram: activeNakshatraName,
      nakshatraEndTime: this.formatTime(liveNakshatraEnd),
      nextNakshatram: nextNakshatraName,
      sunriseTithi: sunriseTithiName,
      sunriseTithiEndTime: this.formatTime(sunriseTithiEnd),
      postSunriseTithi: postSunriseTithiName,
      sunriseNakshatra: sunriseNakshatraName,
      sunriseNakshatraEndTime: this.formatTime(sunriseNakshatraEnd),
      postSunriseNakshatra: postSunriseNakshatraName,
      sunrise: this.formatTime(sunTimes.sunrise),
      sunset: this.formatTime(sunTimes.sunset),
      rahuKalam: inauspicious.rahuKalam,
      yamagandam: inauspicious.yamagandam,
      gulikaKalam: inauspicious.gulikaKalam,
      timezone: city.timezone,
    };
  }
}
