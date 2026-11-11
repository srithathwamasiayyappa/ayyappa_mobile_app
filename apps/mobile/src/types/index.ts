export type SupportedLanguage = 'te' | 'kn' | 'en' | 'ta' | 'hi';

export interface LanguageItem {
  id: SupportedLanguage;
  code: string;
  name: string;
}

export interface PanchangamSection {
  title: string;
  items: string[];
}

export interface PanchangamDetails {
  date: string;
  dayName: string;
  samvatsara: string;
  ayanaRitu: string;
  maasaPaksha: string;
  tithi: PanchangamSection;
  star: PanchangamSection;
  yoga: PanchangamSection;
  karana: PanchangamSection;
  auspiciousTime: PanchangamSection;
  inauspiciousTime: PanchangamSection;
  sunTimes: string;
}

export interface PanchangamData {
  dayNumber: string;
  monthText: string;
  year?: number;
  city?: string;
  cityNameLocalized?: string;
  samvatsaram: string;
  maasa?: string;
  paksham: string;
  tithi: string;
  tithiEndTime?: string;
  nextTithi?: string;
  nakshatram: string;
  nakshatraEndTime?: string;
  nextNakshatram?: string;
  vaaram: string;
  sunrise?: string;
  sunset?: string;
  rahuKalam?: string;
  yamagandam?: string;
  ayanaRitu?: string;
  details?: PanchangamDetails;
}

export interface DevotionalCategoryItem {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  isAudio?: boolean;
  audioDurationSec?: number;
  totalTime?: string;
  chantLyric?: string;
  subcategories?: DevotionalCategoryItem[];
}

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
