import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface TempleDto {
  id: string;
  dbId: number;
  name: string;
  originalName: string;
  localNames?: Record<string, string>;
  deityId: string;
  deityName?: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  heroImageUrl?: string;
  about: string;
  history?: string;
  speciality?: string[];
  timings?: any;
  contact?: any;
  liveStreamId?: string;
  hasLiveDarshan: boolean;
  cropIndex: number;
  isActive: boolean;
}

const INITIAL_TEMPLES = [
  {
    slug: 'sabarimala',
    name: 'Sabarimala Temple',
    localNamesJson: JSON.stringify({
      te: 'శబరిమల శ్రీ ధర్మశాస్త దేవాలయం',
      kn: 'ಶಬರಿಮಲೆ ಶ್ರೀ ಧರ್ಮಶಾಸ್ತಾ ದೇವಾಲಯ',
      ta: 'சபரிமலை ஸ்ரீ தர்மசாஸ்தா திருக்கோயில்',
      hi: 'सबरीमाला श्री धर्मशास्ता मंदिर',
      ml: 'ശബരിമല ശ്രീ ധർമ്മശാസ്താ ക്ഷേത്രം',
      en: 'Sabarimala Temple',
    }),
    deityId: 'ayyappa',
    deityName: 'Lord Ayyappa',
    city: 'Pathanamthitta',
    district: 'Pathanamthitta',
    state: 'Kerala',
    country: 'India',
    address: 'Sannidhanam, Sabarimala, Periyar Tiger Reserve, Pathanamthitta District, Kerala',
    pincode: '689662',
    latitude: 9.4398,
    longitude: 77.0805,
    cropIndex: 0,
    about: 'One of the most revered and ancient hill shrines in India dedicated to Lord Ayyappa, located atop 18 sacred hills amidst the lush forests of the Western Ghats in Kerala.',
    history: 'According to temple tradition, Lord Ayyappa vanquished the demoness Mahishi and entered perpetual meditative penance at Sabarimala.',
    specialityJson: JSON.stringify([
      'Mandala - Makaravilakku season pilgrimage of 41 days of austerities (Vratam)',
      'Pathinettampadi — The 18 sacred gold-plated steps climbed only with Irumudi Kettu',
      'Neyyabhishekam — Sacred ghee abhishekam offered directly to Lord Ayyappa',
    ]),
    timingsJson: JSON.stringify({
      morning: '03:00 AM – 01:00 PM',
      evening: '03:00 PM – 11:00 PM',
    }),
    contactJson: JSON.stringify({
      phone: '+91 4735 202048',
      email: 'sabarimalatdb@gmail.com',
      website: 'https://sabarimala.kerala.gov.in',
    }),
    liveStreamId: 'sabarimala-live',
    hasLiveDarshan: true,
  },
  {
    slug: 'tirumala',
    name: 'Tirumala Tirupati',
    localNamesJson: JSON.stringify({
      te: 'తిరుమల శ్రీ వేంకటేశ్వర స్వామి దేవాలయం',
      kn: 'ತಿರುಮಲ ಶ್ರೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಾಲಯ',
      ta: 'திருமலை திருப்பதி ஸ்ரீ வெங்கடேஸ்வரா திருக்கோயில்',
      hi: 'तिरुपति बालाजी श्री वेंकटेश्वर मंदिर',
      ml: 'തിരുമല ശ്രീ വെങ്കിടേശ്വര സ്വാമി ക്ഷേത്രം',
      en: 'Tirumala Tirupati',
    }),
    deityId: 'venkateswara',
    deityName: 'Lord Venkateswara',
    city: 'Tirupati',
    district: 'Tirupati',
    state: 'Andhra Pradesh',
    country: 'India',
    address: 'S Mada St, Tirumala, Tirupati, Andhra Pradesh',
    pincode: '517504',
    latitude: 13.6833,
    longitude: 79.3472,
    cropIndex: 1,
    about: 'Situated in the sacred Seshachalam hill ranges, Tirumala Tirupati Devasthanams is among the most visited pilgrimage destinations on earth.',
    history: 'Known as the Kaliyuga Vaikuntham, Lord Sri Srinivasa manifested here to redeem mankind during the Kali Yuga.',
    specialityJson: JSON.stringify([
      'Kaliyuga Pratyaksha Daivam Lord Venkateswara',
      'World-famous Tirupati Laddu Prasadam',
    ]),
    timingsJson: JSON.stringify({
      morning: '02:30 AM – 11:30 PM',
    }),
    contactJson: JSON.stringify({
      phone: '+91 877 2277777',
      website: 'https://ttdevasthanams.ap.gov.in',
    }),
    liveStreamId: 'tirumala-live',
    hasLiveDarshan: true,
  },
  {
    slug: 'srisailam',
    name: 'Srisailam Mallikarjuna Swamy',
    localNamesJson: JSON.stringify({
      te: 'శ్రీశైలం భ్రమరాంబ మల్లికార్జున స్వామి దేవస్థానం',
      kn: 'ಶ್ರೀಶೈಲ ಮಲ್ಲಿಕಾರ್ಜುನ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನ',
      ta: 'ஸ்ரீசைலம் மல்லிகார்ஜுன சுவாமி திருக்கோயில்',
      hi: 'श्रीशैलम मल्लिकार्जुन स्वामी ज्योतिर्लिंग',
      ml: 'ശ്രീശൈലം മല്ലികാർജ്ജുന സ്വാമി ക്ഷേത്രം',
      en: 'Srisailam Mallikarjuna Swamy',
    }),
    deityId: 'shiva',
    deityName: 'Lord Shiva',
    city: 'Srisailam',
    district: 'Nandyal',
    state: 'Andhra Pradesh',
    country: 'India',
    address: 'Srisailam Devasthanam, Srisailam, Andhra Pradesh',
    pincode: '518101',
    latitude: 16.0743,
    longitude: 78.8682,
    cropIndex: 2,
    about: 'One of the holiest shrines in Hinduism, revered uniquely as both one of the 12 Jyotirlingas and one of the 18 Maha Shakti Peethas.',
    history: 'Ancient historical texts and epics describe Srisailam atop the Nallamala hills as Sriparvata.',
    specialityJson: JSON.stringify([
      'Unique confluence of Jyotirlinga & Shakti Peetham',
      'Sparsha Darshanam allowing devotees to touch the sacred Shiva Lingam',
    ]),
    timingsJson: JSON.stringify({
      morning: '04:30 AM – 03:30 PM',
      evening: '06:00 PM – 10:00 PM',
    }),
    contactJson: JSON.stringify({
      phone: '+91 8524 288888',
      website: 'https://srisailamonline.com',
    }),
    liveStreamId: 'srisailam-live',
    hasLiveDarshan: true,
  },
  {
    slug: 'kashi-vishwanath',
    name: 'Kashi Vishwanath Temple',
    localNamesJson: JSON.stringify({
      te: 'కాశీ విశ్వనాథ మందిరం',
      kn: 'ಕಾಶಿ ವಿಶ್ವನಾಥ ದೇವಸ್ಥಾನ',
      ta: 'காசி விஸ்வநாதர் திருக்கோயில்',
      hi: 'काशी विश्वनाथ मंदिर, वाराणसी',
      ml: 'കാശി വിശ്വനാഥ ക്ഷേത്രം',
      en: 'Kashi Vishwanath Temple',
    }),
    deityId: 'shiva',
    deityName: 'Lord Shiva',
    city: 'Varanasi',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    address: 'Lahori Tola, Varanasi, Uttar Pradesh',
    pincode: '221001',
    latitude: 25.3109,
    longitude: 83.0107,
    cropIndex: 3,
    about: 'Situated on the western bank of the holy river Ganga in Varanasi, one of the oldest living cities in the world.',
    history: 'Referred to in the Skanda Purana, the sacred Lingam of Vishweshwara stands as the spiritual center of the universe.',
    specialityJson: JSON.stringify([
      'Pivotal Jyotirlinga along the sacred river Ganges',
      'Mangala Aarti before sunrise',
    ]),
    timingsJson: JSON.stringify({
      morning: '03:00 AM – 11:00 PM',
    }),
    contactJson: JSON.stringify({
      phone: '+91 542 2392629',
      website: 'https://shrikashivishwanath.org',
    }),
    liveStreamId: 'kashi-live',
    hasLiveDarshan: true,
  },
  {
    slug: 'rameswaram',
    name: 'Ramanathaswamy Temple',
    localNamesJson: JSON.stringify({
      te: 'రామేశ్వరం శ్రీ రామనాథస్వామి దేవాలయం',
      kn: 'ರಾಮೇಶ್ವರಂ ರಾಮನಾಥಸ್ವಾಮಿ ದೇವಾಲಯ',
      ta: 'ராமேஸ்வரம் ஸ்ரீ ராமநாதசுவாமி திருக்கோயில்',
      hi: 'रामेश्वरम श्री रामनाथस्वामी ज्योतिर्लिंग',
      ml: 'രാമേശ്വരം രാമനാഥസ്വാമി ക്ഷേത്രം',
      en: 'Ramanathaswamy Temple',
    }),
    deityId: 'shiva',
    deityName: 'Lord Shiva',
    city: 'Rameswaram',
    district: 'Ramanathapuram',
    state: 'Tamil Nadu',
    country: 'India',
    address: 'Rameswaram, Tamil Nadu',
    pincode: '623526',
    latitude: 9.2881,
    longitude: 79.3174,
    cropIndex: 4,
    about: 'Located on Rameswaram island, Tamil Nadu, renowned for its magnificent sculptured pillars and sacred 22 theerthams.',
    history: 'According to the Ramayana, Lord Rama worshipped Lord Shiva here to absolve sins after defeating Ravana.',
    specialityJson: JSON.stringify([
      'The Southernmost Jyotirlinga of Bharat',
      'World-famous outer corridor with 1212 intricately carved granite pillars',
    ]),
    timingsJson: JSON.stringify({
      morning: '05:00 AM – 01:00 PM',
      evening: '03:00 PM – 09:00 PM',
    }),
    contactJson: JSON.stringify({
      phone: '+91 4573 221223',
      website: 'https://rameswaramtemple.tnhrce.in',
    }),
    hasLiveDarshan: false,
  },
];

@Injectable()
export class TemplesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureTablesExist();
  }

  private async ensureTablesExist() {
    try {
      await this.prisma.$queryRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`temples\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`slug\` VARCHAR(100) NOT NULL UNIQUE,
          \`name\` VARCHAR(255) NOT NULL,
          \`local_names_json\` TEXT NULL,
          \`deity_id\` VARCHAR(50) NOT NULL,
          \`deity_name\` VARCHAR(100) NULL,
          \`city\` VARCHAR(100) NOT NULL,
          \`district\` VARCHAR(100) NULL,
          \`state\` VARCHAR(100) NOT NULL,
          \`country\` VARCHAR(100) NOT NULL DEFAULT 'India',
          \`address\` VARCHAR(500) NULL,
          \`pincode\` VARCHAR(20) NULL,
          \`latitude\` DOUBLE NULL,
          \`longitude\` DOUBLE NULL,
          \`thumbnail_url\` VARCHAR(500) NULL,
          \`hero_image_url\` VARCHAR(500) NULL,
          \`about\` TEXT NOT NULL,
          \`history\` TEXT NULL,
          \`speciality_json\` TEXT NULL,
          \`timings_json\` TEXT NULL,
          \`contact_json\` TEXT NULL,
          \`live_stream_id\` VARCHAR(100) NULL,
          \`has_live_darshan\` TINYINT(1) NOT NULL DEFAULT 0,
          \`crop_index\` INT NOT NULL DEFAULT 0,
          \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
          \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          INDEX (\`deity_id\`),
          INDEX (\`state\`),
          INDEX (\`is_active\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Seed if empty
      const rows: any = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM \`temples\``);
      const count = Number(rows?.[0]?.count ?? 0);
      if (count === 0) {
        for (const t of INITIAL_TEMPLES) {
          await this.prisma.$queryRawUnsafe(`
            INSERT IGNORE INTO \`temples\` 
            (\`slug\`, \`name\`, \`local_names_json\`, \`deity_id\`, \`deity_name\`, \`city\`, \`district\`, \`state\`, \`country\`, \`address\`, \`pincode\`, \`latitude\`, \`longitude\`, \`about\`, \`history\`, \`speciality_json\`, \`timings_json\`, \`contact_json\`, \`live_stream_id\`, \`has_live_darshan\`, \`crop_index\`, \`is_active\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
          `,
            t.slug,
            t.name,
            t.localNamesJson,
            t.deityId,
            t.deityName,
            t.city,
            t.district,
            t.state,
            t.country,
            t.address,
            t.pincode,
            t.latitude,
            t.longitude,
            t.about,
            t.history,
            t.specialityJson,
            t.timingsJson,
            t.contactJson,
            t.liveStreamId || null,
            t.hasLiveDarshan ? 1 : 0,
            t.cropIndex
          );
        }
      }
    } catch (e) {
      console.warn('[TemplesService] ensureTablesExist note:', e);
    }
  }

  private transformTemple(t: any, lang = 'en'): TempleDto {
    let localNames: Record<string, string> = {};
    try {
      if (t.local_names_json) localNames = JSON.parse(t.local_names_json);
      else if (t.localNamesJson) localNames = JSON.parse(t.localNamesJson);
    } catch {}

    let speciality: string[] = [];
    try {
      if (t.speciality_json) speciality = JSON.parse(t.speciality_json);
      else if (t.specialityJson) speciality = JSON.parse(t.specialityJson);
    } catch {}

    let timings: any = undefined;
    try {
      if (t.timings_json) timings = JSON.parse(t.timings_json);
      else if (t.timingsJson) timings = JSON.parse(t.timingsJson);
    } catch {}

    let contact: any = undefined;
    try {
      if (t.contact_json) contact = JSON.parse(t.contact_json);
      else if (t.contactJson) contact = JSON.parse(t.contactJson);
    } catch {}

    const localizedName = (localNames && localNames[lang]) || t.name;

    return {
      id: t.slug,
      dbId: t.id,
      name: localizedName,
      originalName: t.name,
      localNames,
      deityId: t.deity_id || t.deityId || t.primary_deity || 'ayyappa',
      deityName: t.deity_name || t.deityName || t.primary_deity || undefined,
      city: t.city,
      district: t.district || undefined,
      state: t.state,
      country: t.country || 'India',
      address: t.address || undefined,
      pincode: t.pincode || undefined,
      latitude: t.latitude != null ? Number(t.latitude) : undefined,
      longitude: t.longitude != null ? Number(t.longitude) : undefined,
      thumbnailUrl: t.thumbnail_url || t.thumbnailUrl || t.gopuram_image_url || t.hero_image_url || undefined,
      heroImageUrl: t.hero_image_url || t.heroImageUrl || t.gopuram_image_url || undefined,
      about: t.about || t.short_description || '',
      history: t.history || undefined,
      speciality: speciality.length > 0 ? speciality : (t.speciality ? [t.speciality] : undefined),
      timings,
      contact: contact || (t.office_phone ? { phone: t.office_phone, email: t.official_email, website: t.official_website } : undefined),
      liveStreamId: t.live_stream_id || t.liveStreamId || undefined,
      hasLiveDarshan: Boolean(t.has_live_darshan || t.hasLiveDarshan),
      cropIndex: t.crop_index ?? t.cropIndex ?? t.display_order ?? 0,
      isActive: Boolean(t.is_active ?? t.isActive ?? (t.status ? t.status === 'PUBLISHED' : true)),
    };
  }

  async getTemples(query: { lang?: string; q?: string; deity?: string; state?: string; includeInactive?: boolean | string }): Promise<TempleDto[]> {
    await this.ensureTablesExist();

    try {
      const rows: any = await this.prisma.$queryRawUnsafe('SELECT * FROM `temples`');
      if (Array.isArray(rows)) {
        let filtered = rows;

        // Status / active filter
        const allowInactive = query.includeInactive === true || query.includeInactive === 'true' || query.includeInactive === '1';
        if (!allowInactive) {
          filtered = filtered.filter((r) => {
            if (r.is_active !== undefined && r.is_active !== null) {
              return Boolean(r.is_active);
            }
            if (r.status !== undefined && r.status !== null) {
              return r.status === 'PUBLISHED';
            }
            return true;
          });
        }

        // Deity filter
        if (query.deity && query.deity !== 'all') {
          const dLower = query.deity.toLowerCase();
          filtered = filtered.filter((r) => {
            const rowDeity = (r.deity_id || r.primary_deity || '').toLowerCase();
            return rowDeity.includes(dLower);
          });
        }

        // State filter
        if (query.state && query.state !== 'all') {
          const sLower = query.state.toLowerCase();
          filtered = filtered.filter((r) => {
            const rowState = (r.state || '').toLowerCase();
            return rowState.includes(sLower);
          });
        }

        // Search query filter
        if (query.q && query.q.trim()) {
          const qLower = query.q.trim().toLowerCase();
          filtered = filtered.filter((r) => {
            const nameStr = (r.name || '').toLowerCase();
            const cityStr = (r.city || '').toLowerCase();
            const districtStr = (r.district || '').toLowerCase();
            const stateStr = (r.state || '').toLowerCase();
            const deityStr = (r.deity_name || r.primary_deity || r.deity_id || '').toLowerCase();
            const localNamesStr = (r.local_names_json || r.alternate_name || '').toLowerCase();
            return (
              nameStr.includes(qLower) ||
              cityStr.includes(qLower) ||
              districtStr.includes(qLower) ||
              stateStr.includes(qLower) ||
              deityStr.includes(qLower) ||
              localNamesStr.includes(qLower)
            );
          });
        }

        // Sort by crop_index / display_order
        filtered.sort((a, b) => {
          const orderA = a.crop_index ?? a.display_order ?? 0;
          const orderB = b.crop_index ?? b.display_order ?? 0;
          return orderA - orderB;
        });

        return filtered.map((r) => this.transformTemple(r, query.lang || 'en'));
      }
    } catch (e) {
      console.warn('[TemplesService] getTemples error:', e);
    }

    return [];
  }

  async createTemple(data: any): Promise<TempleDto> {
    await this.ensureTablesExist();

    const name = data.name || 'Sacred Temple';
    let slug = (data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'temple';
    
    // Check if slug already exists, append short hash if needed
    try {
      const existing: any = await this.prisma.$queryRawUnsafe('SELECT id FROM `temples` WHERE `slug` = ?', slug);
      if (Array.isArray(existing) && existing.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    } catch {}

    const localNamesJson = typeof data.localNames === 'object' ? JSON.stringify(data.localNames) : (data.localNamesJson || '{}');
    const specialityJson = Array.isArray(data.speciality) ? JSON.stringify(data.speciality) : (typeof data.speciality === 'string' ? JSON.stringify(data.speciality.split('\n').filter(Boolean)) : (data.specialityJson || '[]'));
    const timingsJson = typeof data.timings === 'object' ? JSON.stringify(data.timings) : (data.timingsJson || '{}');
    
    const contactObj = typeof data.contact === 'object' && data.contact ? { ...data.contact } : {};
    if (data.officePhone) contactObj.phone = data.officePhone;
    if (data.officialEmail) contactObj.email = data.officialEmail;
    if (data.officialWebsite) contactObj.website = data.officialWebsite;
    const contactJson = JSON.stringify(contactObj);

    const deityId = data.deityId || data.deity_id || 'ayyappa';
    const deityName = data.deityName || data.deity_name || data.primaryDeity || 'Lord Ayyappa';
    const city = data.city || 'Sannidhanam';
    const district = data.district || null;
    const state = data.state || 'Andhra Pradesh';
    const country = data.country || 'India';
    const address = data.address || null;
    const pincode = data.pincode || null;
    const latitude = data.latitude != null ? Number(data.latitude) : null;
    const longitude = data.longitude != null ? Number(data.longitude) : null;
    const thumbnailUrl = data.thumbnailUrl || data.heroImageUrl || null;
    const heroImageUrl = data.heroImageUrl || data.thumbnailUrl || null;
    const about = data.about || data.shortDescription || '';
    const history = data.history || null;
    const liveStreamId = data.liveStreamId || null;
    const hasLiveDarshan = data.hasLiveDarshan ? 1 : 0;
    const cropIndex = data.cropIndex ?? 0;
    const isActive = data.isActive !== false ? 1 : 0;

    try {
      await this.prisma.$queryRawUnsafe(`
        INSERT INTO \`temples\`
        (\`slug\`, \`name\`, \`local_names_json\`, \`deity_id\`, \`deity_name\`, \`city\`, \`district\`, \`state\`, \`country\`, \`address\`, \`pincode\`, \`latitude\`, \`longitude\`, \`thumbnail_url\`, \`hero_image_url\`, \`about\`, \`history\`, \`speciality_json\`, \`timings_json\`, \`contact_json\`, \`live_stream_id\`, \`has_live_darshan\`, \`crop_index\`, \`is_active\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        slug, name, localNamesJson, deityId, deityName, city, district, state, country, address, pincode,
        latitude, longitude, thumbnailUrl, heroImageUrl, about, history, specialityJson, timingsJson, contactJson,
        liveStreamId, hasLiveDarshan, cropIndex, isActive
      );
    } catch (e) {
      console.warn('[TemplesService] createTemple raw query error, trying Prisma:', e);
      try {
        await (this.prisma as any).temple.create({
          data: {
            slug,
            name,
            alternateName: data.alternateName || null,
            primaryDeity: deityName,
            city,
            district,
            state,
            country,
            address,
            pincode,
            shortDescription: data.shortDescription || null,
            about,
            history,
            speciality: typeof data.speciality === 'string' ? data.speciality : (Array.isArray(data.speciality) ? data.speciality.join('\n') : null),
            officePhone: data.officePhone || contactObj.phone || null,
            officialEmail: data.officialEmail || contactObj.email || null,
            officialWebsite: data.officialWebsite || contactObj.website || null,
            heroImageUrl,
            status: isActive ? 'PUBLISHED' : 'DRAFT',
          }
        });
      } catch (prismaErr) {
        console.error('[TemplesService] createTemple failed:', prismaErr);
        throw prismaErr;
      }
    }

    return this.getTempleById(slug);
  }

  async updateTemple(idOrSlug: string, data: any): Promise<TempleDto> {
    await this.ensureTablesExist();

    const numericId = parseInt(idOrSlug, 10);
    const isStrictNumeric = !isNaN(numericId) && String(numericId) === idOrSlug.trim();

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('`name` = ?');
      values.push(data.name);
    }
    if (data.slug !== undefined) {
      updates.push('`slug` = ?');
      values.push(data.slug);
    }
    if (data.localNames !== undefined) {
      updates.push('`local_names_json` = ?');
      values.push(typeof data.localNames === 'object' ? JSON.stringify(data.localNames) : data.localNames);
    }
    if (data.deityId !== undefined) {
      updates.push('`deity_id` = ?');
      values.push(data.deityId);
    }
    if (data.deityName !== undefined) {
      updates.push('`deity_name` = ?');
      values.push(data.deityName);
    }
    if (data.city !== undefined) {
      updates.push('`city` = ?');
      values.push(data.city);
    }
    if (data.district !== undefined) {
      updates.push('`district` = ?');
      values.push(data.district);
    }
    if (data.state !== undefined) {
      updates.push('`state` = ?');
      values.push(data.state);
    }
    if (data.country !== undefined) {
      updates.push('`country` = ?');
      values.push(data.country);
    }
    if (data.address !== undefined) {
      updates.push('`address` = ?');
      values.push(data.address);
    }
    if (data.pincode !== undefined) {
      updates.push('`pincode` = ?');
      values.push(data.pincode);
    }
    if (data.latitude !== undefined) {
      updates.push('`latitude` = ?');
      values.push(data.latitude != null ? Number(data.latitude) : null);
    }
    if (data.longitude !== undefined) {
      updates.push('`longitude` = ?');
      values.push(data.longitude != null ? Number(data.longitude) : null);
    }
    if (data.thumbnailUrl !== undefined) {
      updates.push('`thumbnail_url` = ?');
      values.push(data.thumbnailUrl);
    }
    if (data.heroImageUrl !== undefined) {
      updates.push('`hero_image_url` = ?');
      values.push(data.heroImageUrl);
    }
    if (data.about !== undefined) {
      updates.push('`about` = ?');
      values.push(data.about);
    }
    if (data.history !== undefined) {
      updates.push('`history` = ?');
      values.push(data.history);
    }
    if (data.speciality !== undefined) {
      updates.push('`speciality_json` = ?');
      const spec = Array.isArray(data.speciality) ? JSON.stringify(data.speciality) : (typeof data.speciality === 'string' ? JSON.stringify(data.speciality.split('\n').filter(Boolean)) : '[]');
      values.push(spec);
    }
    if (data.timings !== undefined) {
      updates.push('`timings_json` = ?');
      values.push(typeof data.timings === 'object' ? JSON.stringify(data.timings) : data.timings);
    }
    if (data.contact !== undefined) {
      updates.push('`contact_json` = ?');
      values.push(typeof data.contact === 'object' ? JSON.stringify(data.contact) : data.contact);
    }
    if (data.liveStreamId !== undefined) {
      updates.push('`live_stream_id` = ?');
      values.push(data.liveStreamId);
    }
    if (data.hasLiveDarshan !== undefined) {
      updates.push('`has_live_darshan` = ?');
      values.push(data.hasLiveDarshan ? 1 : 0);
    }
    if (data.cropIndex !== undefined) {
      updates.push('`crop_index` = ?');
      values.push(Number(data.cropIndex));
    }
    if (data.isActive !== undefined) {
      updates.push('`is_active` = ?');
      values.push(data.isActive ? 1 : 0);
    }

    if (updates.length > 0) {
      const sql = isStrictNumeric
        ? `UPDATE \`temples\` SET ${updates.join(', ')} WHERE \`id\` = ?`
        : `UPDATE \`temples\` SET ${updates.join(', ')} WHERE \`slug\` = ? OR \`id\` = ?`;
      
      const params = isStrictNumeric ? [...values, numericId] : [...values, idOrSlug, numericId || 0];

      try {
        await this.prisma.$queryRawUnsafe(sql, ...params);
      } catch (e) {
        console.warn('[TemplesService] updateTemple raw query warning:', e);
      }
    }

    return this.getTempleById(data.slug || idOrSlug);
  }

  async deleteTemple(idOrSlug: string): Promise<boolean> {
    await this.ensureTablesExist();

    const numericId = parseInt(idOrSlug, 10);
    const isStrictNumeric = !isNaN(numericId) && String(numericId) === idOrSlug.trim();

    try {
      if (isStrictNumeric) {
        await this.prisma.$queryRawUnsafe('DELETE FROM `temples` WHERE `id` = ?', numericId);
      } else {
        await this.prisma.$queryRawUnsafe('DELETE FROM `temples` WHERE `slug` = ? OR `id` = ?', idOrSlug, numericId || 0);
      }
      return true;
    } catch (e) {
      console.warn('[TemplesService] deleteTemple raw warning, trying Prisma:', e);
      try {
        await (this.prisma as any).temple.deleteMany({
          where: {
            OR: [
              { slug: idOrSlug },
              ...(isStrictNumeric ? [{ id: numericId }] : [])
            ]
          }
        });
        return true;
      } catch (err) {
        console.error('[TemplesService] deleteTemple failed:', err);
        return false;
      }
    }
  }

  async getTempleById(idOrSlug: string, lang = 'en'): Promise<TempleDto> {
    await this.ensureTablesExist();

    const numericId = parseInt(idOrSlug, 10);
    const isStrictNumeric = !isNaN(numericId) && String(numericId) === idOrSlug.trim();
    try {
      const rows: any = await this.prisma.$queryRawUnsafe('SELECT * FROM `temples`');
      if (Array.isArray(rows)) {
        const found = rows.find((r) => {
          if (r.slug === idOrSlug) return true;
          if (isStrictNumeric && r.id === numericId) return true;
          if (r.name && r.name.toLowerCase() === idOrSlug.trim().toLowerCase()) return true;
          return false;
        });
        if (found) {
          return this.transformTemple(found, lang);
        }
      }
    } catch (e) {
      console.warn('[TemplesService] getTempleById error:', e);
    }

    try {
      const dkTemple: any = await (this.prisma as any).temple.findFirst({
        where: {
          OR: [
            { slug: idOrSlug },
            { name: idOrSlug },
            ...(isStrictNumeric ? [{ id: numericId }] : []),
          ],
        },
        include: {
          timings: true,
          festivals: true,
          events: true,
          gallery: true,
        },
      });

      if (dkTemple) {
        return this.transformTemple(
          {
            ...dkTemple,
            timings_json: dkTemple.timings ? JSON.stringify(dkTemple.timings) : undefined,
          },
          lang
        );
      }
    } catch (e) {
      console.warn('[TemplesService] getTempleById fallback note:', e);
    }

    throw new NotFoundException(`Temple not found for identifier: ${idOrSlug}`);
  }
}
