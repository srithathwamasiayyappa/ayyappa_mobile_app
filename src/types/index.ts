export type SupportedLanguage = 'te' | 'kn' | 'en' | 'ta' | 'hi';

export interface LanguageItem {
  id: SupportedLanguage | number;
  code: SupportedLanguage;
  name: string;
  nativeName?: string;
  englishName?: string;
  displayName?: string;
  continueText?: string;
}

export interface DeityItem {
  id: string;
  name: string;
  teluguName?: string;
  kannadaName?: string;
  tamilName?: string;
  hindiName?: string;
  description?: string;
  category?: 'popular' | 'shiva' | 'vishnu' | 'devi' | 'others';
  imageUrl?: string;
  imageName?: string;
  aliases?: string[];
  isFeatured?: boolean;
  orderIndex?: number;
  isActive?: boolean;
  isComingSoon?: boolean;
  isAvailable?: boolean;
  status?: string;
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
  gulikaKalam?: string;
  abhijitMuhurtam?: string;
  yoga?: string;
  karana?: string;
  special?: string;
  ayanaRitu?: string;
  details?: PanchangamDetails;
}

export interface TempleTimings {
  morning?: string;
  evening?: string;
  special?: string;
  notes?: string;
}

export interface TempleContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface TempleItem {
  id: string;
  name: string;
  localNames?: Record<string, string>;
  deityId: string;
  deityName?: string;
  city: string;
  district?: string;
  state: string;
  country?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  heroImageUrl?: string;
  about: string;
  history?: string;
  speciality?: string[];
  timings?: TempleTimings;
  contact?: TempleContact;
  liveStreamId?: string;
  hasLiveDarshan?: boolean;
  cropIndex?: number;
  festivals?: any[];
  gallery?: any[];
  media?: any[];
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

export type MainTab = 'home' | 'services' | 'categories' | 'temples' | 'panchangam' | 'profile';

export interface RashiItem {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
}

export interface NakshatraItem {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
}

export interface DevoteeProfile {
  id: number;
  phoneNumber?: string | null;
  email?: string | null;
  fullName?: string | null;
  preferredLang: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  rashiId?: number | null;
  rashiName?: string | null;
  nakshatraId?: number | null;
  nakshatraName?: string | null;
  profileImageUrl?: string | null;
  addressLine?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  pincode?: string | null;
  devotionalUpdatesEnabled: boolean;
  profileOnboardingStatus: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  profileCompletedAt?: string | null;
  completionPercentage: number;
  devoteeSince: string;
  isVerifiedPhone: boolean;
}

export type AnnadanamStatus = 'open' | 'upcoming' | 'completed' | 'unconfirmed';

export interface AnnadanamLocation {
  id: string;
  name: string;
  localNames?: Record<string, string>;
  templeName: string;
  city: string;
  state: string;
  locationLabel: string;
  servingTime: string;
  status: AnnadanamStatus;
  statusLabel?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  organizer: string;
  contactPhone?: string;
  notes?: string;
}

export interface AnnadanamCampaign {
  id: string;
  title: string;
  subtitle: string;
  organizer: string;
  templeName: string;
  description: string;
  recommendedAmounts: number[];
  officialAccountInfo?: string;
}

export interface DonationCategoryItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'general' | 'seva' | 'annadanam' | 'festival' | 'pooja' | 'history';
  screenRoute?: string;
}

export type NotificationType = 'live' | 'festival' | 'annadanam' | 'seva' | 'panchangam' | 'general';

export interface DevotionalNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  relativeTime: string;
  isRead: boolean;
  destinationType: 'live_streams' | 'temple_detail' | 'food_donation' | 'donations' | 'panchangam' | 'category_listing';
  destinationId?: string;
  destinationTitle?: string;
}

export interface NotificationPreferences {
  liveStreams: boolean;
  templeFestivals: boolean;
  annadanam: boolean;
  panchangam: boolean;
  sevaReminders: boolean;
}

export interface BookmarkItem {
  id: string;
  title: string;
  category: 'pooja' | 'sloka' | 'bhajan' | 'temple';
  subtitle?: string;
  savedAt: string;
}

export interface FestivalItem {
  slug: string;
  name: string;
  date: string;
  weekday?: string;
  category: string;
  city?: string;
  description?: string;
  year?: number;
}

export interface DharmaKarthaDashboardStats {
  managedTemples: number;
  pendingUpdates: number;
  activeFestivals: number;
}

export interface DharmaKarthaProfile {
  id: number;
  fullName: string;
  city: string;
  state: string;
  role: string;
  designation?: string;
  avatarUrl?: string;
}

export interface DharmaKarthaTemple {
  id: number;
  slug: string;
  name: string;
  alternateName?: string;
  primaryDeity: string;
  shortDescription?: string;
  about?: string;
  history?: string;
  speciality?: string;
  country?: string;
  state?: string;
  district?: string;
  city: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
  officePhone?: string;
  officialEmail?: string;
  officialWebsite?: string;
  heroImageUrl?: string;
  gopuramImageUrl?: string;
  status: 'PUBLISHED' | 'PENDING_APPROVAL' | 'DRAFT';
  isVerified: boolean;
  membershipRole: 'OWNER' | 'ADMIN';
  membershipStatus: 'APPROVED' | 'PENDING';
}

export interface RegisterMandirPayload {
  classification: string;
  name: string;
  alternateName?: string;
  primaryDeity: string;
  state: string;
  city: string;
  district?: string;
  address: string;
  shortDescription?: string;
  about?: string;
  history?: string;
  speciality?: string;
  officePhone?: string;
  officialEmail?: string;
  officialWebsite?: string;
}



