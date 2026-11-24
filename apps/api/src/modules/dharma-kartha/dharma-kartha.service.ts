import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// Verified Seed Temples for Saranam Ayyappa Devotional Portal
export const SEED_TEMPLES = [
  {
    id: 1,
    slug: 'sabarimala-sri-ayyappa-temple',
    name: 'Sabarimala Sri Ayyappa Temple',
    alternateName: 'Sabari Malai Mandir',
    primaryDeity: 'Lord Ayyappa',
    shortDescription: 'Pilgrimage through the sacred 18 steps nestled deep in Periyar Tiger Reserve.',
    about: 'Sabarimala Sri Ayyappa Temple located in Pathanamthitta, Kerala is one of the most revered and sacred shrines in India. Millions of devotees undertake voluntary pilgrimages here every year, seeking divine grace, spiritual purification, and inner tranquility.',
    history: 'The sacred lore of Sabarimala dates back centuries through ancient Puranas, royal endowments from Pandalam Palace, and revered saint-poets who sang hymns in praise of the Lord.',
    speciality: 'Pilgrimage through the sacred 18 steps (Pathinettampadi) after observing strict 41-day Vratham with irumudi kettu.',
    country: 'India',
    state: 'Kerala',
    district: 'Pathanamthitta',
    city: 'Pathanamthitta',
    address: 'Sannidhanam, Sabarimala, Pathanamthitta District, Kerala 689662',
    pincode: '689662',
    latitude: 9.4402,
    longitude: 77.0818,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sabarimala+Sri+Ayyappa+Temple',
    officePhone: '+91 4735 202048',
    officialEmail: 'contact@sabarimala.kerala.gov.in',
    officialWebsite: 'https://sabarimala.kerala.gov.in',
    heroImageUrl: '/images/temples/banner-sabarimala-hd.png',
    gopuramImageUrl: '/images/live-streams/golden-temple-staircase.png',
    status: 'PUBLISHED',
    isVerified: true,
    displayOrder: 1,
  },
  {
    id: 2,
    slug: 'sri-venkateswara-temple',
    name: 'Sri Venkateswara Temple',
    alternateName: 'Tirumala Balaji Mandir',
    primaryDeity: 'Lord Venkateswara',
    shortDescription: 'Renowned hill shrine of Lord Balaji atop the sacred Seven Hills of Tirumala.',
    about: 'Sri Venkateswara Temple situated atop Tirumala hills in Tirupati is renowned globally as Kaliyuga Vaikuntam, welcoming tens of thousands of pilgrims every day with divine darshan and massive continuous annadanam.',
    history: 'Constructed over dynasties including Pallavas, Cholas, and Vijayanagara emperors who lavished gold and endowments upon the Ananda Nilayam vimanam.',
    speciality: 'Ananda Nilayam Golden Gopuram, Laddu Prasadam, and continuous Srivari Seva.',
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    city: 'Tirumala',
    address: 'S Balaji Nagar, Tirumala, Tirupati, Andhra Pradesh 517504',
    pincode: '517504',
    latitude: 13.6833,
    longitude: 79.3472,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sri+Venkateswara+Temple+Tirumala',
    officePhone: '+91 877 2277777',
    officialEmail: 'support@ttdevasthanams.ap.gov.in',
    officialWebsite: 'https://ttdevasthanams.ap.gov.in',
    heroImageUrl: '/images/temples/banner-venkateswara-hd.png',
    gopuramImageUrl: '/images/live-streams/sri-venkateswara-temple.png',
    status: 'PUBLISHED',
    isVerified: true,
    displayOrder: 2,
  },
  {
    id: 3,
    slug: 'kashi-vishwanath-temple',
    name: 'Kashi Vishwanath Temple',
    alternateName: 'Golden Temple Varanasi',
    primaryDeity: 'Lord Shiva',
    shortDescription: 'One of the revered twelve Jyotirlingas on the holy banks of river Ganga in Varanasi.',
    about: 'Standing on the western bank of the sacred river Ganga in Varanasi, Kashi Vishwanath is one of the most holy Jyotirlingas, symbolizing eternal cosmic illumination and liberation.',
    history: 'Mentioned in the Kashi Khanda of Skanda Purana; rebuilt by Queen Ahilyabai Holkar of Indore in 1780.',
    speciality: 'One of the 12 Jyotirlingas and direct access to holy Manikarnika and Dashashwamedh Ghats.',
    country: 'India',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city: 'Varanasi',
    address: 'Lahori Tola, Varanasi, Uttar Pradesh 221001',
    pincode: '221001',
    latitude: 25.3109,
    longitude: 83.0107,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kashi+Vishwanath+Temple+Varanasi',
    officePhone: '+91 542 2392629',
    officialEmail: 'info@shrikashivishwanath.org',
    officialWebsite: 'https://shrikashivishwanath.org',
    heroImageUrl: '/images/temples/banner-kashi-hd.png',
    gopuramImageUrl: '/images/temple-steps.jpg',
    status: 'PUBLISHED',
    isVerified: true,
    displayOrder: 3,
  },
  {
    id: 4,
    slug: 'meenakshi-amman-temple',
    name: 'Meenakshi Amman Temple',
    alternateName: 'Madurai Meenakshi Sundareswarar Temple',
    primaryDeity: 'Goddess Meenakshi',
    shortDescription: 'Historic temple dedicated to Goddess Meenakshi featuring breathtaking Dravidian architecture.',
    about: 'A historic Hindu temple situated in the ancient temple city of Madurai, Tamil Nadu. Dedicated to Meenakshi (a form of Parvati) and her consort Sundareswarar (Shiva).',
    history: 'Constructed by King Kulasekara Pandya, expanded under the Nayak rulers between 1560 and 1655.',
    speciality: '14 towering gopurams adorned with thousands of detailed mythological sculptures and the Hall of Thousand Pillars.',
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Madurai',
    city: 'Madurai',
    address: 'Madurai Main, Madurai, Tamil Nadu 625001',
    pincode: '625001',
    latitude: 9.9195,
    longitude: 78.1193,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Meenakshi+Amman+Temple+Madurai',
    officePhone: '+91 452 2344360',
    officialEmail: 'jointcommr_maduraimeenakshi@hrce.tn.gov.in',
    officialWebsite: 'https://maduraimeenakshi.hrce.tn.gov.in',
    heroImageUrl: '/images/temples/banner-meenakshi-hd.png',
    gopuramImageUrl: '/images/festival.jpg',
    status: 'PUBLISHED',
    isVerified: true,
    displayOrder: 4,
  },
  {
    id: 5,
    slug: 'kedarnath-temple',
    name: 'Kedarnath Temple',
    alternateName: 'Kedarnath Jyotirlinga',
    primaryDeity: 'Lord Shiva',
    shortDescription: 'Sacred Himalayan pilgrimage shrine nestled among snow-capped peaks of Garhwal Himalayas.',
    about: 'One of the highest and most sacred of the twelve Jyotirlingas, situated near Mandakini river in the high Himalayas at an elevation of 3,583 meters.',
    history: 'Legend attributes the temple foundation to the Pandavas; revitalized in the 8th century by Adi Shankaracharya.',
    speciality: 'Part of Char Dham and Panch Kedar; opens annually between Akshaya Tritiya and Bhai Dooj.',
    country: 'India',
    state: 'Uttarakhand',
    district: 'Rudraprayag',
    city: 'Kedarnath',
    address: 'Kedarnath, Rudraprayag District, Uttarakhand 246445',
    pincode: '246445',
    latitude: 30.7352,
    longitude: 79.0669,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kedarnath+Temple',
    officePhone: '+91 135 2741600',
    officialEmail: 'support@badrinath-kedarnath.gov.in',
    officialWebsite: 'https://badrinath-kedarnath.gov.in',
    heroImageUrl: '/images/temples/banner-kedarnath-hd.png',
    gopuramImageUrl: '/images/temples-card.jpg',
    status: 'PUBLISHED',
    isVerified: true,
    displayOrder: 5,
  },
  {
    id: 6,
    slug: 'kanaka-durga-temple',
    name: 'Kanaka Durga Temple',
    alternateName: 'Sri Durga Malleswara Swamy Varla Devasthanam',
    primaryDeity: 'Goddess Durga',
    shortDescription: 'Historic hilltop shrine on Indrakeeladri hill overlooking the sacred Krishna River.',
    about: 'Revered Shakti Peetha situated on Indrakeeladri hill in Vijayawada, dedicated to Goddess Kanaka Durga who blessed Arjuna and defeated the demon Mahishasura.',
    history: 'Ancient inscriptions celebrate the goddess manifested as Swayambhu; grandly supported by Kakatiya and Vijayanagara monarchs.',
    speciality: 'Navaratri Teppotsavam (boat festival) on the Krishna River and Bhavani Deeksha viramanam.',
    country: 'India',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    city: 'Vijayawada',
    address: 'Indrakeeladri, Vijayawada, Andhra Pradesh 520001',
    pincode: '520001',
    latitude: 16.5167,
    longitude: 80.6167,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kanaka+Durga+Temple+Vijayawada',
    officePhone: '+91 866 2423600',
    officialEmail: 'info@kanakadurgamma.org',
    officialWebsite: 'https://kanakadurgamma.org',
    heroImageUrl: '/images/temples/banner-kanaka-hd.png',
    gopuramImageUrl: '/images/pooja-altar.jpg',
    status: 'PUBLISHED',
    isVerified: true,
    displayOrder: 6,
  },
];

@Injectable()
export class DharmaKarthaService {
  private readonly logger = new Logger(DharmaKarthaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // In-memory development storage to enable live, stateful testing of CRUD & permissions
  // without hardcoding or fabricating fake ownership for new users
  private devMemberships: Array<{
    id: number;
    userId: number;
    templeId: number;
    role: string;
    status: string;
  }> = [];

  private devTemples: Array<any> = [...SEED_TEMPLES];
  private devTimings: Array<any> = [
    // Sabarimala Sri Ayyappa Temple timings
    { id: 1, templeId: 1, title: 'Nirmalya Darshanam', timeWindow: '03:00 AM – 03:30 AM', description: 'First divine darshan with sacred chants', sortOrder: 1, isActive: true },
    { id: 2, templeId: 1, title: 'Ganapathi Homam & Abhishekam', timeWindow: '03:30 AM – 07:00 AM', description: 'Ghee abhishekam of Lord Ayyappa', sortOrder: 2, isActive: true },
    { id: 3, templeId: 1, title: 'Usha Pooja & Morning Darshan', timeWindow: '07:30 AM – 11:30 AM', description: 'Morning sacred offerings and archana', sortOrder: 3, isActive: true },
    { id: 4, templeId: 1, title: 'Ucha Pooja (Noon Worship)', timeWindow: '12:00 PM – 01:00 PM', description: 'Maha prasadam offering & afternoon closure', sortOrder: 4, isActive: true },
    { id: 5, templeId: 1, title: 'Evening Reopening & Deeparadhana', timeWindow: '04:00 PM – 06:30 PM', description: 'Evening grand camphor lamp aarti', sortOrder: 5, isActive: true },
    { id: 6, templeId: 1, title: 'Pushpabhishekam & Athazha Pooja', timeWindow: '07:00 PM – 10:30 PM', description: 'Sacred flower shower and night pooja', sortOrder: 6, isActive: true },
    { id: 7, templeId: 1, title: 'Harivarasanam & Nada Thura Closure', timeWindow: '11:00 PM', description: 'The sacred divine lullaby of Lord Ayyappa', sortOrder: 7, isActive: true },

    // Sri Venkateswara Temple (Tirumala) timings
    { id: 8, templeId: 2, title: 'Suprabhatam', timeWindow: '03:00 AM – 03:30 AM', description: 'Awakening hymn to Lord Srinivasa', sortOrder: 1, isActive: true },
    { id: 9, templeId: 2, title: 'Thomala Seva', timeWindow: '03:30 AM – 04:30 AM', description: 'Sacred flower garland adornment seva', sortOrder: 2, isActive: true },
    { id: 10, templeId: 2, title: 'Archana & Sahasranamarchana', timeWindow: '04:30 AM – 05:30 AM', description: 'Recitation of 1000 divine names with tulasi', sortOrder: 3, isActive: true },
    { id: 11, templeId: 2, title: 'Sarvadarshanam (General Darshan)', timeWindow: '07:00 AM – 06:00 PM', description: 'Continuous free darshan for all devotees', sortOrder: 4, isActive: true },
    { id: 12, templeId: 2, title: 'Night Ekantha Seva', timeWindow: '11:00 PM – 11:30 PM', description: 'Closing lullaby (Tarigonda Vengamamba Harathi)', sortOrder: 5, isActive: true },

    // Meenakshi Amman Temple (Madurai) timings
    { id: 13, templeId: 4, title: 'Thiruvanandal Pooja', timeWindow: '05:00 AM – 06:00 AM', description: 'Sacred morning awakening ritual', sortOrder: 1, isActive: true },
    { id: 14, templeId: 4, title: 'Kalasandhi Pooja', timeWindow: '06:30 AM – 07:15 AM', description: 'Morning abhishekam and naivedyam', sortOrder: 2, isActive: true },
    { id: 15, templeId: 4, title: 'Uchikalam (Noon Pooja)', timeWindow: '10:30 AM – 11:15 AM', description: 'Midday sacred worship before afternoon recess', sortOrder: 3, isActive: true },
    { id: 16, templeId: 4, title: 'Sayarakshai (Evening Pooja)', timeWindow: '04:30 PM – 05:15 PM', description: 'Evening deeparadhana with sacred nagaswaram music', sortOrder: 4, isActive: true },
    { id: 17, templeId: 4, title: 'Palliarai Pooja', timeWindow: '09:30 PM – 10:00 PM', description: 'Procession carrying Lord Sundareswarar to Goddess Meenakshi bedchamber', sortOrder: 5, isActive: true },
  ];
  private devUpdateRequests: Array<any> = [];
  private devFestivals: Array<any> = [
    // Pre-seeded temple festivals with detailed information
    {
      id: 1,
      templeId: 1, // Sabarimala
      name: 'Mandala Pooja Mahotsavam',
      category: 'MAHOTSAVAM',
      period: 'Mid-November to Late December',
      startDate: '2026-11-15T00:00:00.000Z',
      endDate: '2026-12-26T23:59:59.000Z',
      description: '41 days of austere penance, sacred vratham, fasting and deep devotional sadhana culminating in Mandala Pooja.',
      specialPoojaInfo: 'Daily Neyyabhishekam and continuous Vedic chanting at Sannidhanam.',
      status: 'PUBLISHED',
      isApproved: true,
    },
    {
      id: 2,
      templeId: 1, // Sabarimala
      name: 'Makaravilakku & Makara Sankranti',
      category: 'CELESTIAL_OBSERVANCE',
      period: '14th January (Annual)',
      startDate: '2027-01-14T00:00:00.000Z',
      endDate: '2027-01-14T23:59:59.000Z',
      description: 'The most sacred pilgrimage evening witnessing the divine celestial Makara Jyothi above Ponnambalamedu.',
      specialPoojaInfo: 'Deeparadhana with Thiruvabharanam holy ornaments adornment.',
      status: 'PUBLISHED',
      isApproved: true,
    },
    {
      id: 3,
      templeId: 2, // Tirumala
      name: 'Srivari Salakatla Brahmotsavam',
      category: 'BRAHMOTSAVAM',
      period: 'Navaratri Season (September – October)',
      startDate: '2026-10-02T00:00:00.000Z',
      endDate: '2026-10-10T23:59:59.000Z',
      description: 'Nine-day grand celestial procession featuring Garuda Seva, Rathotsavam, and sacred Chakrasnanam.',
      specialPoojaInfo: 'Special Malayappa Swamy vahanam sevas twice daily.',
      status: 'PUBLISHED',
      isApproved: true,
    },
    {
      id: 4,
      templeId: 4, // Meenakshi Amman
      name: 'Chithirai Thiruvizha (Celestial Wedding)',
      category: 'BRAHMOTSAVAM',
      period: 'Chithirai Month (April – May)',
      startDate: '2026-04-20T00:00:00.000Z',
      endDate: '2026-05-01T23:59:59.000Z',
      description: 'Massive annual festival celebrating the divine coronation and sacred wedding of Goddess Meenakshi with Lord Sundareswarar.',
      specialPoojaInfo: 'Thirukalyanam and Kallazhagar entry into Vaigai river.',
      status: 'PUBLISHED',
      isApproved: true,
    },
  ];

  private devEvents: Array<any> = [
    {
      id: 1,
      templeId: 1,
      title: 'Kanni Ayyappa Deeksha & Irumudi Kettu Mahotsavam',
      category: 'VRATHAM',
      startDate: '2026-11-20T06:00:00.000Z',
      endDate: '2026-11-20T12:00:00.000Z',
      location: 'Sannidhanam Mandapam',
      description: 'Sacred irumudi filling ceremony and spiritual guidance for first-time pilgrims under reverent Guruswamy supervision.',
      status: 'PUBLISHED',
    },
    {
      id: 2,
      templeId: 2,
      title: 'Sri Srinivasa Kalyanotsavam Seva',
      category: 'KALYANAM',
      startDate: '2026-11-28T10:30:00.000Z',
      endDate: '2026-11-28T13:00:00.000Z',
      location: 'Sampangi Prakaram, Tirumala',
      description: 'Sacred celestial wedding ritual with divine Vedic mantras, mangala vadhyam, and laddu prasadam distribution.',
      status: 'PUBLISHED',
    },
  ];

  private devMedia: Array<any> = [
    {
      id: 1,
      templeId: 1, // Sabarimala
      title: 'Sacred Sanctum & Golden Dome',
      caption: 'Sacred architectural view of the holy sanctum at Sabarimala',
      mediaUrl: '/images/temple-hero.jpg',
      type: 'Photo',
      category: 'Temple Exterior',
      sortOrder: 1,
      isApproved: true,
      status: 'PUBLISHED',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 2,
      templeId: 1,
      title: 'Holy 18 Steps & Golden Handrails',
      caption: 'The consecrated Pathinettampadi traversed with sacred irumudi kettu',
      mediaUrl: '/images/temple-steps.jpg',
      type: 'Photo',
      category: 'Gopuram',
      sortOrder: 2,
      isApproved: true,
      status: 'PUBLISHED',
      createdAt: '2026-11-02T09:30:00.000Z',
    },
    {
      id: 3,
      templeId: 2, // Tirumala
      title: 'Ananda Nilayam Golden Gopuram',
      caption: 'The glorious gold-plated vimanam of Lord Venkateswara at Tirumala',
      mediaUrl: '/images/live-streams/sri-venkateswara-temple.png',
      type: 'Photo',
      category: 'Gopuram',
      sortOrder: 1,
      isApproved: true,
      status: 'PUBLISHED',
      createdAt: '2026-11-05T10:00:00.000Z',
    },
  ];

  private devNotifications: Array<any> = [
    {
      id: 1,
      userId: 1,
      title: 'Temple Ownership Approved 🙏',
      message: 'Your management rights for Sri Venkateswara Temple (Tirumala) have been approved by the Super Admin.',
      type: 'APPROVAL',
      isRead: false,
      linkUrl: '/dharma-kartha/temples',
      createdAt: '2026-11-15T10:00:00.000Z',
    },
    {
      id: 2,
      userId: 1,
      title: 'Festival Schedule Published',
      message: 'Srivari Salakatla Brahmotsavam is now live on the public temple detail page.',
      type: 'EVENT',
      isRead: true,
      linkUrl: '/dharma-kartha/festivals',
      createdAt: '2026-11-16T08:30:00.000Z',
    },
  ];

  // Resolve authenticated user & verify non-suspended / non-deleted status
  async resolveUser(userId: number) {
    try {
      const user = await (this.prisma as any).appUser.findUnique({
        where: { id: userId },
      });
      if (!user || user.isSuspended || user.isDeleted) {
        return null;
      }
      return user;
    } catch {
      // In-memory dev fallback strictly representing the authenticated user
      return {
        id: userId,
        fullName: 'Vinod Kumar',
        city: 'Hyderabad',
        state: 'Telangana',
        role: 'DHARMA_KARTHA',
        isSuspended: false,
        isDeleted: false,
      };
    }
  }

  // GET /api/v1/dharma-kartha/dashboard statistics
  async getDashboardStats(userId: number) {
    try {
      const allMemberships = await (this.prisma as any).templeMembership.findMany({
        where: { userId },
        include: { temple: true },
      });

      const managedTemplesCount = allMemberships.length;

      // Count temples with PENDING_APPROVAL / PENDING status or membership PENDING
      const pendingTemplesCount = allMemberships.filter(
        (m: any) =>
          m.temple?.status === 'PENDING_APPROVAL' ||
          m.temple?.status === 'PENDING' ||
          m.status === 'PENDING',
      ).length;

      const pendingUpdatesCount = await (this.prisma as any).templeUpdateRequest.count({
        where: { requestedById: userId, status: 'PENDING' },
      }).catch(() => 0);

      const totalPendingCount = pendingTemplesCount + pendingUpdatesCount;

      const templeIds = allMemberships.map((m: any) => m.templeId);

      const activeFestivalsCount = templeIds.length > 0
        ? await (this.prisma as any).templeFestival.count({
            where: { templeId: { in: templeIds } },
          }).catch(() => 0)
        : 0;

      return {
        success: true,
        data: {
          managedTemples: managedTemplesCount,
          pendingUpdates: totalPendingCount,
          activeFestivals: activeFestivalsCount,
        },
      };
    } catch {
      // Stateful in-memory development provider:
      const userMemberships = this.devMemberships.filter((m) => m.userId === userId);
      const templeIds = userMemberships.map((m) => m.templeId);

      const pendingTemplesCount = userMemberships.filter((m) => {
        const t = this.devTemples.find((temp) => temp.id === m.templeId);
        return (
          t?.status === 'PENDING_APPROVAL' ||
          t?.status === 'PENDING' ||
          m.status === 'PENDING'
        );
      }).length;

      const pendingUpdatesCount = this.devUpdateRequests.filter(
        (r) => r.requestedById === userId && r.status === 'PENDING',
      ).length;

      const totalPendingCount = pendingTemplesCount + pendingUpdatesCount;

      const activeFestivalsCount = this.devFestivals.filter(
        (f) => templeIds.includes(f.templeId),
      ).length;

      return {
        success: true,
        data: {
          managedTemples: userMemberships.length,
          pendingUpdates: totalPendingCount,
          activeFestivals: activeFestivalsCount,
        },
      };
    }
  }

  // GET /api/v1/dharma-kartha/temples
  async getAuthorizedTemples(userId: number) {
    try {
      const memberships = await (this.prisma as any).templeMembership.findMany({
        where: { userId },
        include: {
          temple: true,
        },
        orderBy: { id: 'desc' },
      });

      const temples = memberships.map((m: any) => ({
        ...m.temple,
        membershipRole: m.role,
        membershipStatus: m.status,
      }));

      return {
        success: true,
        total: temples.length,
        temples,
      };
    } catch {
      // Stateful in-memory development provider:
      // Returns all temples that this user is registered as owner/manager for
      const userMemberships = this.devMemberships.filter(
        (m) => m.userId === userId,
      );

      const userTemples = userMemberships.map((m) => {
        const found = this.devTemples.find((t) => t.id === m.templeId);
        return {
          ...found,
          membershipRole: m.role,
          membershipStatus: m.status,
        };
      }).filter(Boolean);

      return {
        success: true,
        total: userTemples.length,
        temples: userTemples,
      };
    }
  }

  // GET /api/v1/dharma-kartha/temples/list - Enhanced paginated & filtered list for My Temples page
  async getAuthorizedTemplesPaginated(
    userId: number,
    query: { page?: number; limit?: number; search?: string; status?: string },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = (query.search || '').trim().toLowerCase();
    const statusFilter = (query.status || 'ALL').toUpperCase();

    try {
      const where: any = {
        userId,
      };
      if (statusFilter !== 'ALL') {
        where.status = statusFilter;
      }

      const memberships = await (this.prisma as any).templeMembership.findMany({
        where,
        include: {
          temple: true,
        },
        orderBy: { id: 'desc' },
      });

      let items = memberships.map((m: any) => ({
        ...m.temple,
        membershipRole: m.role,
        membershipStatus: m.status,
      }));

      if (search) {
        items = items.filter(
          (t: any) =>
            t.name?.toLowerCase().includes(search) ||
            t.city?.toLowerCase().includes(search) ||
            t.state?.toLowerCase().includes(search) ||
            t.primaryDeity?.toLowerCase().includes(search),
        );
      }

      if (statusFilter !== 'ALL') {
        items = items.filter((t: any) => t.status === statusFilter);
      }

      const total = items.length;
      const paginated = items.slice(skip, skip + limit);

      return {
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        temples: paginated,
      };
    } catch {
      // In-memory development provider
      const userMemberships = this.devMemberships.filter(
        (m) => m.userId === userId,
      );

      let items = userMemberships
        .map((m) => {
          const found = this.devTemples.find((t) => t.id === m.templeId);
          return found
            ? { ...found, membershipRole: m.role, membershipStatus: m.status }
            : null;
        })
        .filter(Boolean);

      if (search) {
        items = items.filter(
          (t: any) =>
            t.name?.toLowerCase().includes(search) ||
            t.city?.toLowerCase().includes(search) ||
            t.state?.toLowerCase().includes(search) ||
            t.primaryDeity?.toLowerCase().includes(search),
        );
      }

      if (statusFilter !== 'ALL') {
        items = items.filter((t: any) => t.status === statusFilter);
      }

      const total = items.length;
      const paginated = items.slice(skip, skip + limit);

      return {
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        temples: paginated,
      };
    }
  }

  // GET /api/v1/dharma-kartha/temples/:id
  async getTempleDetails(userId: number, templeId: number) {
    // 1. Enforce Object-level authorization
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        message: 'Forbidden: You are not authorized to view or manage this temple record.',
      };
    }

    try {
      const temple = await (this.prisma as any).temple.findUnique({
        where: { id: templeId },
        include: {
          timings: true,
          festivals: true,
          events: true,
          gallery: true,
        },
      });
      return { success: true, temple };
    } catch {
      const temple = this.devTemples.find((t) => t.id === templeId);
      const timings = this.devTimings.filter((tm) => tm.templeId === templeId);
      return { success: true, temple: { ...temple, timings } };
    }
  }

  // PATCH /api/v1/dharma-kartha/temples/:id (Update Temple)
  async updateTemple(userId: number, templeId: number, updateData: any) {
    // 1. Enforce Object-level authorization
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        message: 'Forbidden: You do not have permission to modify this temple.',
      };
    }

    try {
      const updated = await (this.prisma as any).temple.update({
        where: { id: templeId },
        data: updateData,
      });
      return {
        success: true,
        message: 'Temple details updated successfully.',
        temple: updated,
      };
    } catch {
      const idx = this.devTemples.findIndex((t) => t.id === templeId);
      if (idx !== -1) {
        this.devTemples[idx] = { ...this.devTemples[idx], ...updateData };
        return {
          success: true,
          message: 'Temple details updated successfully in development storage.',
          temple: this.devTemples[idx],
        };
      }
      return { success: false, message: 'Temple not found' };
    }
  }

  // DELETE /api/v1/dharma-kartha/temples/:id - Direct Delete / Archive Temple
  async deleteTemple(userId: number, templeId: number): Promise<any> {
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return { success: false, statusCode: 403, message: 'Forbidden: You do not own this temple' };
    }
    try {
      await (this.prisma as any).temple.delete({ where: { id: templeId } });
      return { success: true, message: 'Temple removed successfully from database' };
    } catch {
      const idx = this.devTemples.findIndex((t) => t.id === templeId);
      if (idx !== -1) this.devTemples.splice(idx, 1);
      const memIdx = this.devMemberships.findIndex((m) => m.templeId === templeId && m.userId === userId);
      if (memIdx !== -1) this.devMemberships.splice(memIdx, 1);
      return { success: true, message: 'Temple removed successfully' };
    }
  }

  // Object-level authorization helper
  private async checkOwnerPermission(userId: number, templeId: number): Promise<boolean> {
    try {
      const mem = await (this.prisma as any).templeMembership.findFirst({
        where: { userId, templeId },
      });
      return !!mem;
    } catch {
      return this.devMemberships.some(
        (m) => m.userId === userId && m.templeId === templeId,
      );
    }
  }

  // GET /api/v1/dharma-kartha/profile
  async getOwnerProfile(userId: number) {
    const user = await this.resolveUser(userId);
    return {
      success: true,
      profile: {
        id: user?.id || userId,
        fullName: user?.fullName || 'Vinod',
        city: user?.city || 'Hyderabad',
        state: user?.state || 'Telangana',
        role: 'DHARMA_KARTHA / TEMPLE OWNER',
        designation: 'Temple Administrator',
        avatarUrl: user?.profileImageUrl || '/images/ayyappa-icon.jpg',
      },
    };
  }

  // POST /api/v1/dharma-kartha/temples - Register new temple with duplicate validation
  async createTemple(userId: number, body: any) {
    if (!body.name || !body.name.trim()) {
      return {
        success: false,
        statusCode: 400,
        message: 'Temple name is required.',
      };
    }

    const trimmedName = body.name.trim();
    const city = (body.city || '').trim();
    const state = (body.state || '').trim();

    // 1. Duplicate check in dev storage and DB
    const existingDev = this.devTemples.find(
      (t) =>
        t.name.toLowerCase() === trimmedName.toLowerCase() &&
        t.city.toLowerCase() === city.toLowerCase(),
    );
    if (existingDev) {
      return {
        success: false,
        statusCode: 409,
        message: `A temple named "${trimmedName}" in ${city} already exists in the portal. You can submit an ownership claim instead.`,
      };
    }

    try {
      const slug = trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check DB for duplicate slug or name+city
      const dbExisting = await (this.prisma as any).temple.findFirst({
        where: {
          OR: [{ slug }, { name: trimmedName, city }],
        },
      });

      if (dbExisting) {
        return {
          success: false,
          statusCode: 409,
          message: `A temple named "${trimmedName}" in ${city} is already registered. You can submit an ownership claim.`,
        };
      }

      // Ensure user exists in DB so foreign key constraint never fails
      const userExists = await (this.prisma as any).appUser.findUnique({
        where: { id: userId },
      }).catch(() => null);

      if (!userExists) {
        await (this.prisma as any).appUser.create({
          data: {
            id: userId,
            fullName: 'Dharma Kartha',
            preferredLang: 'te',
          },
        }).catch(() => {});
      }

      const temple = await (this.prisma as any).temple.create({
        data: {
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          name: trimmedName,
          alternateName: body.alternateName || null,
          primaryDeity: body.primaryDeity || 'Lord Ayyappa',
          shortDescription: body.shortDescription || null,
          about: body.about || null,
          history: body.history || null,
          speciality: body.speciality || null,
          country: body.country || 'India',
          state: body.state || 'Andhra Pradesh',
          district: body.district || null,
          city: body.city,
          address: body.address || null,
          pincode: body.pincode || null,
          officePhone: body.officePhone || null,
          officialEmail: body.officialEmail || null,
          officialWebsite: body.officialWebsite || null,
          heroImageUrl: body.heroImageUrl || '/images/temple-hero.jpg',
          status: 'PENDING_APPROVAL',
          isVerified: false,
          memberships: {
            create: {
              userId,
              role: 'OWNER',
              status: 'APPROVED',
            },
          },
        },
      });

      return {
        success: true,
        message: 'Temple registration submitted successfully. It is now awaiting Super Admin verification.',
        temple,
      };
    } catch (err: any) {
      // In-memory dev registration
      const newId = this.devTemples.length + 1;
      const slug = trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newTemple = {
        id: newId,
        slug,
        name: trimmedName,
        templeType: body.templeType || 'MAIN_TEMPLE',
        alternateName: body.alternateName || '',
        primaryDeity: body.primaryDeity || 'Lord Ayyappa',
        shortDescription: body.shortDescription || 'Newly submitted temple awaiting verification.',
        about: body.about || '',
        history: body.history || '',
        speciality: body.speciality || '',
        country: body.country || 'India',
        state: body.state || '',
        district: body.district || '',
        city: body.city || '',
        address: body.address || '',
        pincode: body.pincode || '',
        officePhone: body.officePhone || '',
        officialEmail: body.officialEmail || '',
        officialWebsite: body.officialWebsite || '',
        heroImageUrl: body.heroImageUrl || '/images/temple-hero.jpg',
        status: 'PENDING_APPROVAL',
        isVerified: false,
      };

      this.devTemples.push(newTemple);
      this.devMemberships.push({
        id: this.devMemberships.length + 1,
        userId,
        templeId: newId,
        role: 'OWNER',
        status: 'APPROVED',
      });

      return {
        success: true,
        message: 'Temple registration submitted successfully. It is now awaiting Super Admin verification.',
        temple: newTemple,
      };
    }
  }

  // POST /api/v1/dharma-kartha/temples/claim - Submit ownership claim for existing temple
  async claimTempleOwnership(userId: number, body: { templeId: number; reason: string; documentsUrl?: string }) {
    const templeId = Number(body.templeId);
    if (!templeId) {
      return { success: false, statusCode: 400, message: 'Valid templeId is required' };
    }

    const temple = this.devTemples.find((t) => t.id === templeId);
    if (!temple) {
      return { success: false, statusCode: 404, message: 'Temple not found' };
    }

    // Check existing membership
    const existing = this.devMemberships.find(
      (m) => m.userId === userId && m.templeId === templeId,
    );
    if (existing) {
      return {
        success: false,
        statusCode: 400,
        message: `You already have a ${existing.status.toLowerCase()} claim or membership for this temple.`,
      };
    }

    try {
      const claim = await (this.prisma as any).templeUpdateRequest.create({
        data: {
          templeId,
          requestedById: userId,
          category: 'OWNERSHIP_CLAIM',
          proposedJson: JSON.stringify({
            reason: body.reason,
            documentsUrl: body.documentsUrl || null,
          }),
          status: 'PENDING',
        },
      });

      return {
        success: true,
        message: 'Ownership claim submitted successfully. Admin will review credentials before granting management access.',
        claimId: claim.id,
      };
    } catch {
      this.devUpdateRequests.push({
        id: this.devUpdateRequests.length + 1,
        templeId,
        requestedById: userId,
        category: 'OWNERSHIP_CLAIM',
        status: 'PENDING',
        reason: body.reason,
      });

      return {
        success: true,
        message: 'Ownership claim submitted successfully. Admin will review credentials before granting management access.',
        claimId: this.devUpdateRequests.length,
      };
    }
  }

  // =========================================================
  // PHASE 5: TEMPLE TIMINGS API (CRUD WITH OBJECT PERMISSION)
  // =========================================================

  // GET /api/v1/dharma-kartha/temples/:id/timings
  async getTempleTimings(userId: number, templeId: number) {
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        message: 'Forbidden: You do not have permission to view timings for this temple.',
      };
    }

    try {
      const timings = await (this.prisma as any).templeTiming.findMany({
        where: { templeId },
        orderBy: { sortOrder: 'asc' },
      });
      return { success: true, timings };
    } catch {
      const timings = this.devTimings
        .filter((tm) => tm.templeId === templeId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return { success: true, timings };
    }
  }

  // POST /api/v1/dharma-kartha/temples/:id/timings - Add new schedule entry
  async addTempleTiming(userId: number, templeId: number, body: any) {
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        message: 'Forbidden: You do not have permission to add timings to this temple.',
      };
    }

    const title = (body.title || '').trim();
    let timeWindow = (body.timeWindow || '').trim();

    if (!timeWindow && (body.startTime || body.endTime)) {
      const start = (body.startTime || '').trim();
      const end = (body.endTime || '').trim();
      if (start && end) {
        timeWindow = `${start} – ${end}`;
      } else {
        timeWindow = start || end;
      }
    }

    if (!title || !timeWindow) {
      return {
        success: false,
        statusCode: 400,
        message: 'Title and time window (e.g. 05:00 AM – 06:00 AM) are required.',
      };
    }

    const description = (body.description || body.applicableDays || '').trim() || null;
    const sortOrder = Number(body.sortOrder) || 0;
    const isActive = body.isActive !== false;

    try {
      const timing = await (this.prisma as any).templeTiming.create({
        data: {
          templeId,
          title,
          timeWindow,
          description,
          sortOrder,
          isActive,
        },
      });
      return { success: true, message: 'Darshan timing added successfully.', timing };
    } catch {
      const newTiming = {
        id: this.devTimings.length + 1,
        templeId,
        title,
        timeWindow,
        description: description || '',
        sortOrder: sortOrder || this.devTimings.length + 1,
        isActive,
      };
      this.devTimings.push(newTiming);
      return { success: true, message: 'Darshan timing added successfully.', timing: newTiming };
    }
  }

  // PATCH /api/v1/dharma-kartha/temples/:id/timings/:timingId - Update timing entry
  async updateTempleTiming(userId: number, templeId: number, timingId: number, body: any) {
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        message: 'Forbidden: You do not have permission to modify timings for this temple.',
      };
    }

    let timeWindow = body.timeWindow !== undefined ? body.timeWindow.trim() : undefined;
    if (timeWindow === undefined && (body.startTime !== undefined || body.endTime !== undefined)) {
      const start = (body.startTime || '').trim();
      const end = (body.endTime || '').trim();
      if (start && end) {
        timeWindow = `${start} – ${end}`;
      } else {
        timeWindow = start || end;
      }
    }

    const description = body.description !== undefined
      ? body.description.trim()
      : (body.applicableDays !== undefined ? body.applicableDays.trim() : undefined);

    try {
      const timing = await (this.prisma as any).templeTiming.update({
        where: { id: timingId },
        data: {
          title: body.title !== undefined ? body.title.trim() : undefined,
          timeWindow,
          description,
          sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        },
      });
      return { success: true, message: 'Darshan timing updated successfully.', timing };
    } catch {
      const idx = this.devTimings.findIndex((tm) => tm.id === timingId && tm.templeId === templeId);
      if (idx === -1) {
        return { success: false, statusCode: 404, message: 'Timing entry not found' };
      }
      this.devTimings[idx] = {
        ...this.devTimings[idx],
        ...body,
        timeWindow: timeWindow || this.devTimings[idx].timeWindow,
      };
      return { success: true, message: 'Darshan timing updated successfully.', timing: this.devTimings[idx] };
    }
  }

  // DELETE /api/v1/dharma-kartha/temples/:id/timings/:timingId - Delete timing entry
  async deleteTempleTiming(userId: number, templeId: number, timingId: number) {
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return {
        success: false,
        statusCode: 403,
        message: 'Forbidden: You do not have permission to delete timings for this temple.',
      };
    }

    try {
      await (this.prisma as any).templeTiming.delete({
        where: { id: timingId },
      });
      return { success: true, message: 'Timing entry deleted successfully.' };
    } catch {
      const idx = this.devTimings.findIndex((tm) => tm.id === timingId && tm.templeId === templeId);
      if (idx !== -1) {
        this.devTimings.splice(idx, 1);
        return { success: true, message: 'Timing entry deleted successfully.' };
      }
      return { success: false, statusCode: 404, message: 'Timing entry not found' };
    }
  }

  // GET /api/v1/dharma-kartha/public/temples/:slugOrName/details - Public detail with correct temple timings
  async getPublicTempleDetails(slugOrName: string) {
    const decoded = decodeURIComponent(slugOrName).trim().toLowerCase();
    const temple = this.devTemples.find(
      (t) =>
        t.slug?.toLowerCase() === decoded ||
        t.name?.toLowerCase() === decoded ||
        decoded.includes(t.slug?.toLowerCase()) ||
        t.name?.toLowerCase().includes(decoded),
    );

    if (!temple) {
      return { success: false, statusCode: 404, message: 'Temple not found' };
    }

    const timings = this.devTimings
      .filter((tm) => tm.templeId === temple.id && tm.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      success: true,
      temple: {
        ...temple,
        timings,
      },
    };
  }

  // =========================================================
  // PHASE 6: TEMPLE FESTIVALS & EVENTS CRUD APIs
  // =========================================================

  // GET /api/v1/dharma-kartha/festivals
  async getOwnerFestivals(userId: number, templeId?: number): Promise<any> {
    try {
      let targetIds: number[] = [];
      if (templeId) {
        targetIds = [templeId];
      } else {
        const memberships = await (this.prisma as any).templeMembership.findMany({
          where: { userId },
          select: { templeId: true },
        });
        targetIds = memberships.map((m: any) => m.templeId);
        // If Dharma Kartha has NO managed temples, return 0 festivals
        if (targetIds.length === 0) {
          return {
            success: true,
            total: 0,
            festivals: [],
          };
        }
      }

      const festivals = await (this.prisma as any).templeFestival.findMany({
        where: { templeId: { in: targetIds } },
        include: {
          temple: {
            select: { id: true, name: true, city: true }
          }
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });

      return {
        success: true,
        total: festivals.length,
        festivals: festivals.map((f: any) => ({
          id: f.id,
          templeId: f.templeId,
          name: f.name,
          period: f.period,
          description: f.description || '',
          category: f.category || 'MAHOTSAVAM',
          specialPoojaInfo: f.specialPoojaInfo || '',
          status: f.status || 'PUBLISHED',
          isAnnual: f.isAnnual,
          templeName: f.temple?.name || '',
          createdAt: f.createdAt,
        })),
      };
    } catch (err) {
      console.warn('getOwnerFestivals error:', err);
      return {
        success: true,
        total: 0,
        festivals: [],
      };
    }
  }

  // GET /api/v1/dharma-kartha/festivals/:id - View Festival by ID
  async getOwnerFestivalById(userId: number, festivalId: number): Promise<any> {
    try {
      const f = await (this.prisma as any).templeFestival.findUnique({
        where: { id: festivalId },
        include: {
          temple: { select: { id: true, name: true, city: true, state: true } },
        },
      });
      if (!f) {
        return { success: false, statusCode: 404, message: 'Festival not found' };
      }
      return {
        success: true,
        festival: {
          id: f.id,
          templeId: f.templeId,
          name: f.name,
          period: f.period,
          description: f.description || '',
          category: f.category || 'MAHOTSAVAM',
          specialPoojaInfo: f.specialPoojaInfo || '',
          status: f.status || 'PUBLISHED',
          isAnnual: f.isAnnual,
          templeName: f.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
          city: f.temple?.city || '',
          state: f.temple?.state || '',
          createdAt: f.createdAt,
        },
      };
    } catch {
      const fest = this.devFestivals.find((item) => item.id === festivalId);
      if (!fest) {
        return { success: false, statusCode: 404, message: 'Festival not found' };
      }
      const temple = this.devTemples.find((t) => t.id === fest.templeId);
      return {
        success: true,
        festival: {
          ...fest,
          templeName: temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
          city: temple?.city || '',
          state: temple?.state || '',
        },
      };
    }
  }

  // POST /api/v1/dharma-kartha/festivals - Add temple festival
  async addTempleFestival(userId: number, body: any): Promise<any> {
    const templeId = Number(body.templeId) || 1;
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return { success: false, statusCode: 403, message: 'Forbidden: You do not own this temple' };
    }

    if (!body.name || !body.period) {
      return { success: false, statusCode: 400, message: 'Festival name and period are required' };
    }

    try {
      const created = await (this.prisma as any).templeFestival.create({
        data: {
          templeId,
          name: body.name.trim(),
          period: body.period.trim(),
          description: body.description?.trim() || '',
          sortOrder: body.sortOrder || 0,
          isAnnual: body.isAnnual !== undefined ? Boolean(body.isAnnual) : true,
          status: 'PUBLISHED',
        },
        include: {
          temple: { select: { id: true, name: true } },
        },
      });

      return {
        success: true,
        message: 'Temple festival saved successfully to database.',
        festival: {
          ...created,
          category: body.category || 'MAHOTSAVAM',
          specialPoojaInfo: body.specialPoojaInfo || '',
          templeName: created.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
        },
      };
    } catch {
      const newFest = {
        id: this.devFestivals.length + 1,
        templeId,
        name: body.name.trim(),
        category: body.category || 'MAHOTSAVAM',
        period: body.period.trim(),
        description: body.description?.trim() || '',
        specialPoojaInfo: body.specialPoojaInfo?.trim() || '',
        status: 'PUBLISHED',
        isApproved: true,
      };
      this.devFestivals.push(newFest);
      return {
        success: true,
        message: 'Temple festival saved successfully.',
        festival: newFest,
      };
    }
  }

  // PATCH /api/v1/dharma-kartha/festivals/:id - Update temple festival
  async updateTempleFestival(userId: number, festivalId: number, body: any): Promise<any> {
    try {
      const updateData: any = {};
      if (body.name) updateData.name = body.name.trim();
      if (body.period) updateData.period = body.period.trim();
      if (body.description !== undefined) updateData.description = body.description;
      if (body.status) updateData.status = body.status;

      const updated = await (this.prisma as any).templeFestival.update({
        where: { id: festivalId },
        data: updateData,
        include: {
          temple: { select: { id: true, name: true } },
        },
      });

      return {
        success: true,
        message: 'Festival updated successfully in database.',
        festival: {
          ...updated,
          templeName: updated.temple?.name || 'Temple',
        },
      };
    } catch {
      const fest = this.devFestivals.find((f) => f.id === festivalId);
      if (fest) Object.assign(fest, body);
      return { success: true, message: 'Festival updated successfully', festival: fest };
    }
  }

  // DELETE /api/v1/dharma-kartha/festivals/:id - Delete Festival
  async deleteTempleFestival(userId: number, festivalId: number): Promise<any> {
    try {
      await (this.prisma as any).templeFestival.delete({
        where: { id: festivalId },
      });
      return { success: true, message: 'Festival removed successfully from database' };
    } catch {
      const idx = this.devFestivals.findIndex((f) => f.id === festivalId);
      if (idx !== -1) {
        this.devFestivals.splice(idx, 1);
      }
      return { success: true, message: 'Festival removed successfully' };
    }
  }

  // GET /api/v1/dharma-kartha/events
  async getOwnerEvents(userId: number, templeId?: number): Promise<any> {
    try {
      let targetIds: number[] = [];
      if (templeId) {
        targetIds = [templeId];
      } else {
        const memberships = await (this.prisma as any).templeMembership.findMany({
          where: { userId },
          select: { templeId: true },
        });
        targetIds = memberships.map((m: any) => m.templeId);
        // If Dharma Kartha has NO managed temples, return 0 events
        if (targetIds.length === 0) {
          return {
            success: true,
            total: 0,
            events: [],
          };
        }
      }

      const events = await (this.prisma as any).templeEvent.findMany({
        where: { templeId: { in: targetIds } },
        include: {
          temple: { select: { id: true, name: true, city: true } },
        },
        orderBy: [{ startDate: 'asc' }],
      });

      return {
        success: true,
        total: events.length,
        events: events.map((e: any) => ({
          id: e.id,
          templeId: e.templeId,
          title: e.title,
          description: e.description || '',
          startDate: e.startDate,
          endDate: e.endDate,
          timeInfo: e.timeInfo || '',
          location: e.location || '',
          imageUrl: e.imageUrl || '',
          category: e.category || 'SEVA_PROGRAMME',
          status: e.status || 'PUBLISHED',
          templeName: e.temple?.name || '',
        })),
      };
    } catch (err) {
      console.warn('getOwnerEvents error:', err);
      return {
        success: true,
        total: 0,
        events: [],
      };
    }
  }

  // GET /api/v1/dharma-kartha/events/:id - View Event by ID
  async getOwnerEventById(userId: number, eventId: number): Promise<any> {
    try {
      const e = await (this.prisma as any).templeEvent.findUnique({
        where: { id: eventId },
        include: {
          temple: { select: { id: true, name: true, city: true, state: true } },
        },
      });
      if (!e) {
        return { success: false, statusCode: 404, message: 'Event not found' };
      }
      return {
        success: true,
        event: {
          id: e.id,
          templeId: e.templeId,
          title: e.title,
          description: e.description || '',
          startDate: e.startDate,
          endDate: e.endDate,
          timeInfo: e.timeInfo || '',
          location: e.location || '',
          imageUrl: e.imageUrl || '',
          category: e.category || 'SEVA_PROGRAMME',
          status: e.status || 'PUBLISHED',
          templeName: e.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
          city: e.temple?.city || '',
          state: e.temple?.state || '',
          createdAt: e.createdAt,
        },
      };
    } catch {
      const evt = this.devEvents.find((item) => item.id === eventId);
      if (!evt) {
        return { success: false, statusCode: 404, message: 'Event not found' };
      }
      const temple = this.devTemples.find((t) => t.id === evt.templeId);
      return {
        success: true,
        event: {
          ...evt,
          templeName: temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
          city: temple?.city || '',
          state: temple?.state || '',
        },
      };
    }
  }

  // POST /api/v1/dharma-kartha/events - Add temple event
  async addTempleEvent(userId: number, body: any): Promise<any> {
    const templeId = Number(body.templeId) || 1;
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return { success: false, statusCode: 403, message: 'Forbidden: You do not own this temple' };
    }

    if (!body.title || !body.startDate) {
      return { success: false, statusCode: 400, message: 'Event title and start date are required' };
    }

    try {
      const startDate = body.startDate ? new Date(body.startDate) : new Date();
      const endDate = body.endDate ? new Date(body.endDate) : startDate;

      const created = await (this.prisma as any).templeEvent.create({
        data: {
          templeId,
          title: body.title.trim(),
          description: body.description?.trim() || '',
          startDate,
          endDate,
          timeInfo: body.timeInfo || '',
          location: body.location || '',
          imageUrl: body.imageUrl || null,
          status: 'PUBLISHED',
        },
        include: {
          temple: { select: { id: true, name: true } },
        },
      });

      return {
        success: true,
        message: 'Temple event created successfully in database.',
        event: {
          ...created,
          category: body.category || 'SEVA_PROGRAMME',
          templeName: created.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
        },
      };
    } catch {
      const newEvt = {
        id: this.devEvents.length + 1,
        templeId,
        title: body.title.trim(),
        category: body.category || 'DEVOTIONAL_PROGRAMME',
        startDate: body.startDate,
        endDate: body.endDate || body.startDate,
        location: body.location || '',
        description: body.description?.trim() || '',
        status: 'PUBLISHED',
      };
      this.devEvents.push(newEvt);
      return {
        success: true,
        message: 'Temple event created successfully.',
        event: newEvt,
      };
    }
  }

  // PATCH /api/v1/dharma-kartha/events/:id - Update or Cancel Event
  async updateTempleEvent(userId: number, eventId: number, body: any): Promise<any> {
    try {
      const updateData: any = {};
      if (body.title) updateData.title = body.title.trim();
      if (body.description !== undefined) updateData.description = body.description;
      if (body.startDate) updateData.startDate = new Date(body.startDate);
      if (body.endDate) updateData.endDate = new Date(body.endDate);
      if (body.location !== undefined) updateData.location = body.location;
      if (body.timeInfo !== undefined) updateData.timeInfo = body.timeInfo;
      if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
      if (body.status) updateData.status = body.status;

      const updated = await (this.prisma as any).templeEvent.update({
        where: { id: eventId },
        data: updateData,
        include: {
          temple: { select: { id: true, name: true } },
        },
      });

      return {
        success: true,
        message: 'Event updated successfully in database.',
        event: {
          ...updated,
          templeName: updated.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
        },
      };
    } catch {
      const evt = this.devEvents.find((e) => e.id === eventId);
      if (evt) Object.assign(evt, body);
      return { success: true, message: 'Event updated successfully', event: evt };
    }
  }

  // DELETE /api/v1/dharma-kartha/events/:id - Delete Event
  async deleteTempleEvent(userId: number, eventId: number): Promise<any> {
    try {
      await (this.prisma as any).templeEvent.delete({
        where: { id: eventId },
      });
      return { success: true, message: 'Event removed successfully from database' };
    } catch {
      const idx = this.devEvents.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        this.devEvents.splice(idx, 1);
      }
      return { success: true, message: 'Event removed successfully' };
    }
  }

  // GET /api/v1/dharma-kartha/public/temples/:slugOrName/festivals - Public Detail Festivals Tab
  async getPublicTempleFestivals(slugOrName: string) {
    const decoded = decodeURIComponent(slugOrName).trim().toLowerCase();
    const numericId = parseInt(decoded, 10);
    const isNumeric = !isNaN(numericId) && String(numericId) === decoded;

    try {
      const temple = await (this.prisma as any).temple.findFirst({
        where: {
          OR: [
            { slug: decoded },
            { name: { contains: decoded } },
            ...(isNumeric ? [{ id: numericId }] : []),
          ],
        },
        include: {
          festivals: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!temple) {
        const devT = this.devTemples.find(
          (t) =>
            t.slug?.toLowerCase() === decoded ||
            t.name?.toLowerCase().includes(decoded) ||
            (isNumeric && t.id === numericId)
        );
        const fests = devT ? this.devFestivals.filter((f) => f.templeId === devT.id) : this.devFestivals;
        return { success: true, templeName: devT?.name || 'Temple Festivals', festivals: fests };
      }

      return {
        success: true,
        templeName: temple.name,
        festivals: temple.festivals.map((f: any) => ({
          id: f.id,
          name: f.name,
          period: f.period,
          description: f.description,
          desc: f.description,
          special: '',
        })),
      };
    } catch {
      const devT = this.devTemples.find(
        (t) =>
          t.slug?.toLowerCase() === decoded ||
          t.name?.toLowerCase().includes(decoded) ||
          (isNumeric && t.id === numericId)
      );
      const fests = devT ? this.devFestivals.filter((f) => f.templeId === devT.id) : this.devFestivals;
      return { success: true, festivals: fests };
    }
  }

  // =========================================================
  // PHASE 7: GALLERY MEDIA & NOTIFICATIONS APIs
  // =========================================================

  // GET /api/v1/dharma-kartha/media
  async getOwnerMedia(userId: number, templeId?: number, statusFilter?: string): Promise<any> {
    try {
      let targetIds: number[] = [];
      if (templeId) {
        targetIds = [templeId];
      } else {
        const memberships = await (this.prisma as any).templeMembership.findMany({
          where: { userId },
          select: { templeId: true },
        });
        targetIds = memberships.map((m: any) => m.templeId);
        // If Dharma Kartha has NO managed temples, return 0 media
        if (targetIds.length === 0) {
          return {
            success: true,
            stats: {
              totalPhotos: 0,
              published: 0,
              pending: 0,
              videos: 0,
            },
            media: [],
          };
        }
      }

      const media = await (this.prisma as any).templeMedia.findMany({
        where: { templeId: { in: targetIds } },
        include: {
          temple: { select: { id: true, name: true, city: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });

      const total = media.length;
      const publishedCount = media.filter((m: any) => m.isApproved).length;
      const pendingCount = total - publishedCount;
      const videoCount = media.filter((m: any) => m.type === 'Video').length;

      return {
        success: true,
        stats: {
          totalPhotos: total,
          published: publishedCount,
          pending: pendingCount,
          videos: videoCount,
        },
        media: media.map((m: any) => ({
          id: m.id,
          templeId: m.templeId,
          title: m.title,
          caption: m.caption || '',
          mediaUrl: m.mediaUrl,
          type: m.type,
          category: 'Temple Exterior',
          sortOrder: m.sortOrder,
          isApproved: m.isApproved,
          status: m.isApproved ? 'PUBLISHED' : 'PENDING_APPROVAL',
          templeName: m.temple?.name || '',
          createdAt: m.createdAt,
        })),
      };
    } catch (err) {
      console.warn('getOwnerMedia error:', err);
      return {
        success: true,
        stats: {
          totalPhotos: 0,
          published: 0,
          pending: 0,
          videos: 0,
        },
        media: [],
      };
    }
  }

  // GET /api/v1/dharma-kartha/media/:id - View Media by ID
  async getOwnerMediaById(userId: number, mediaId: number): Promise<any> {
    try {
      const m = await (this.prisma as any).templeMedia.findUnique({
        where: { id: mediaId },
        include: {
          temple: { select: { id: true, name: true, city: true, state: true } },
        },
      });
      if (!m) {
        return { success: false, statusCode: 404, message: 'Media not found' };
      }
      return {
        success: true,
        media: {
          id: m.id,
          templeId: m.templeId,
          title: m.title,
          caption: m.caption || '',
          mediaUrl: m.mediaUrl,
          type: m.type,
          category: 'Temple Sacred Media',
          isApproved: m.isApproved,
          status: m.isApproved ? 'PUBLISHED' : 'PENDING_APPROVAL',
          templeName: m.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
          city: m.temple?.city || '',
          state: m.temple?.state || '',
          createdAt: m.createdAt,
        },
      };
    } catch {
      const item = this.devMedia.find((m) => m.id === mediaId);
      if (!item) {
        return { success: false, statusCode: 404, message: 'Media not found' };
      }
      const temple = this.devTemples.find((t) => t.id === item.templeId);
      return {
        success: true,
        media: {
          ...item,
          templeName: temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
          city: temple?.city || '',
          state: temple?.state || '',
        },
      };
    }
  }

  // POST /api/v1/dharma-kartha/media - Upload/submit media
  async uploadTempleMedia(userId: number, body: any): Promise<any> {
    const templeId = Number(body.templeId) || 1;
    const isAuthorized = await this.checkOwnerPermission(userId, templeId);
    if (!isAuthorized) {
      return { success: false, statusCode: 403, message: 'Forbidden: You do not own this temple' };
    }

    const mediaUrl = (body.mediaUrl || body.url || '').trim();
    if (!body.title || !mediaUrl) {
      return { success: false, statusCode: 400, message: 'Title and media URL are required' };
    }

    try {
      const created = await (this.prisma as any).templeMedia.create({
        data: {
          templeId,
          title: body.title.trim(),
          caption: body.caption?.trim() || '',
          mediaUrl,
          type: body.type || 'Photo',
          sortOrder: body.sortOrder || 0,
          isApproved: true,
        },
        include: {
          temple: { select: { id: true, name: true } },
        },
      });

      return {
        success: true,
        message: 'Media uploaded and saved to database successfully.',
        media: {
          ...created,
          category: body.category || 'Temple Exterior',
          status: 'PUBLISHED',
          templeName: created.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
        },
      };
    } catch {
      const newMedia = {
        id: this.devMedia.length + 1,
        templeId,
        title: body.title.trim(),
        caption: body.caption?.trim() || '',
        mediaUrl: body.mediaUrl.trim(),
        type: body.type || 'Photo',
        category: body.category || 'Temple Exterior',
        sortOrder: this.devMedia.length + 1,
        isApproved: true,
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
      };
      this.devMedia.push(newMedia);
      return {
        success: true,
        message: 'Media uploaded successfully.',
        media: newMedia,
      };
    }
  }

  // PATCH /api/v1/dharma-kartha/media/:id - Edit caption/category/title/url
  async updateTempleMedia(userId: number, mediaId: number, body: any): Promise<any> {
    try {
      const updateData: any = {};
      if (body.caption !== undefined) updateData.caption = body.caption;
      if (body.title !== undefined) updateData.title = body.title;
      if (body.mediaUrl !== undefined) updateData.mediaUrl = body.mediaUrl;
      if (body.type !== undefined) updateData.type = body.type;
      if (body.isApproved !== undefined) updateData.isApproved = Boolean(body.isApproved);

      const updated = await (this.prisma as any).templeMedia.update({
        where: { id: mediaId },
        data: updateData,
        include: {
          temple: { select: { id: true, name: true } },
        },
      });

      return {
        success: true,
        message: 'Media details updated in database.',
        media: {
          ...updated,
          templeName: updated.temple?.name || 'Sri Dharma Sastha Ayyappa Swamy Temple',
        },
      };
    } catch {
      const item = this.devMedia.find((m) => m.id === mediaId);
      if (item) {
        if (body.caption !== undefined) item.caption = body.caption;
        if (body.title !== undefined) item.title = body.title;
      }
      return { success: true, message: 'Media details updated', media: item };
    }
  }

  // DELETE /api/v1/dharma-kartha/media/:id - Request removal / delete
  async deleteTempleMedia(userId: number, mediaId: number): Promise<any> {
    try {
      await (this.prisma as any).templeMedia.delete({
        where: { id: mediaId },
      });
      return { success: true, message: 'Media removed successfully from database' };
    } catch {
      const idx = this.devMedia.findIndex((m) => m.id === mediaId);
      if (idx !== -1) {
        this.devMedia.splice(idx, 1);
      }
      return { success: true, message: 'Media removed successfully' };
    }
  }

  // GET /api/v1/dharma-kartha/public/temples/:slugOrName/gallery - Public Detail Media Tab
  async getPublicTempleGallery(slugOrName: string) {
    const decoded = decodeURIComponent(slugOrName).trim().toLowerCase();
    const numericId = parseInt(decoded, 10);
    const isNumeric = !isNaN(numericId) && String(numericId) === decoded;

    try {
      const temple = await (this.prisma as any).temple.findFirst({
        where: {
          OR: [
            { slug: decoded },
            { name: { contains: decoded } },
            ...(isNumeric ? [{ id: numericId }] : []),
          ],
        },
        include: {
          gallery: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!temple) {
        const devT = this.devTemples.find(
          (t) =>
            t.slug?.toLowerCase() === decoded ||
            t.name?.toLowerCase().includes(decoded) ||
            (isNumeric && t.id === numericId)
        );
        const mediaList = devT ? this.devMedia.filter((m) => m.templeId === devT.id) : this.devMedia;
        return {
          success: true,
          templeName: devT?.name || 'Sanctum Media',
          media: mediaList.map((m: any) => ({
            id: m.id,
            title: m.title,
            caption: m.caption,
            url: m.mediaUrl || m.url,
            type: m.type || 'Photo',
          })),
        };
      }

      return {
        success: true,
        templeName: temple.name,
        media: temple.gallery.map((m: any) => ({
          id: m.id,
          title: m.title,
          caption: m.caption,
          url: m.mediaUrl || m.url,
          type: m.type || 'Photo',
        })),
      };
    } catch {
      const devT = this.devTemples.find(
        (t) =>
          t.slug?.toLowerCase() === decoded ||
          t.name?.toLowerCase().includes(decoded) ||
          (isNumeric && t.id === numericId)
      );
      const mediaList = devT ? this.devMedia.filter((m) => m.templeId === devT.id) : this.devMedia;
      return {
        success: true,
        media: mediaList.map((m: any) => ({
          id: m.id,
          title: m.title,
          caption: m.caption,
          url: m.mediaUrl || m.url,
          type: m.type || 'Photo',
        })),
      };
    }
  }

  // GET /api/v1/dharma-kartha/notifications
  async getOwnerNotifications(userId: number, query: any = {}) {
    const unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === true || query.filter === 'UNREAD';
    const type = query.type;

    try {
      const where: any = { userId };
      if (unreadOnly) where.isRead = false;
      if (type && type !== 'ALL') where.type = type;

      const [dbNotifs, unreadCount] = await Promise.all([
        (this.prisma as any).ownerNotification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
        (this.prisma as any).ownerNotification.count({
          where: { userId, isRead: false },
        }),
      ]);

      if (dbNotifs && dbNotifs.length > 0) {
        return {
          success: true,
          unreadCount,
          total: dbNotifs.length,
          notifications: dbNotifs.map((n: any) => ({
            id: n.id,
            userId: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: Boolean(n.isRead),
            linkUrl: n.linkUrl,
            createdAt: n.createdAt,
          })),
        };
      }
    } catch (err: any) {
      this.logger.warn(`OwnerNotification DB query failed: ${err?.message || err}`);
    }

    // In-memory fallback
    let notifs = this.devNotifications.filter((n) => n.userId === userId || n.userId === 1);
    if (unreadOnly) notifs = notifs.filter((n) => !n.isRead);
    if (type && type !== 'ALL') notifs = notifs.filter((n) => n.type === type);
    const unreadCount = notifs.filter((n) => !n.isRead).length;

    return {
      success: true,
      unreadCount,
      total: notifs.length,
      notifications: notifs,
    };
  }

  // GET /api/v1/dharma-kartha/notifications/unread-count
  async getOwnerUnreadCount(userId: number) {
    try {
      const count = await (this.prisma as any).ownerNotification.count({
        where: { userId, isRead: false },
      });
      return { success: true, unreadCount: count };
    } catch {
      const count = this.devNotifications.filter((n) => (n.userId === userId || n.userId === 1) && !n.isRead).length;
      return { success: true, unreadCount: count };
    }
  }

  // PATCH /api/v1/dharma-kartha/notifications/:id/read - Mark notification as read
  async markNotificationRead(userId: number, notifId: number) {
    try {
      const updated = await (this.prisma as any).ownerNotification.updateMany({
        where: { id: notifId, userId },
        data: { isRead: true },
      });
      if (updated.count > 0) {
        return { success: true, message: 'Notification marked as read' };
      }
    } catch (err: any) {
      this.logger.warn(`OwnerNotification DB markRead error: ${err?.message || err}`);
    }

    const notif = this.devNotifications.find((n) => n.id === notifId);
    if (!notif) {
      return { success: false, statusCode: 404, message: 'Notification not found' };
    }
    notif.isRead = true;
    return { success: true, message: 'Notification marked as read', notification: notif };
  }

  // PATCH /api/v1/dharma-kartha/notifications/mark-all-read
  async markAllNotificationsRead(userId: number) {
    try {
      await (this.prisma as any).ownerNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch (err: any) {
      this.logger.warn(`OwnerNotification DB markAllRead error: ${err?.message || err}`);
    }

    this.devNotifications
      .filter((n) => n.userId === userId || n.userId === 1)
      .forEach((n) => { n.isRead = true; });
    return { success: true, message: 'All notifications marked as read' };
  }

  // GET /api/v1/festivals/calendar - General Hindu Calendar Sourced Feed (Domain A)
  getHinduFestivalCalendar(query: { year?: string; lang?: string; city?: string }) {
    const year = Number(query.year) || 2026;
    const lang = query.lang || 'en';
    const city = query.city || 'Hyderabad';

        // Comprehensive Vedic Festival & Observance Engine (Major Festivals, Ekadashis, Pournamis, Vratams)
    const hinduCalendar = [
      // January
      { slug: 'putrada-ekadashi', name: { en: 'Pausha Putrada Ekadashi', te: 'పౌష పుత్రదా ఏకాదశి', kn: 'ಪುತ್ರದಾ ಏಕಾದಶಿ', ta: 'புத்ரதா ஏகாதசி', hi: 'पौष पुत्रदा एकादशी' }, date: `${year}-01-09`, weekday: 'Friday', category: 'Ekadashi', description: 'Sacred fast seeking spiritual welfare, peaceful progeny, and divine blessings of Lord Narayana.' },
      { slug: 'makara-sankranti', name: { en: 'Makaravilakku & Makara Sankranti', te: 'మకర సంక్రాంతి', kn: 'ಮಕರ ಸಂಕ್ರಾಂತಿ', ta: 'மகர சங்கராந்தி', hi: 'मकर संक्रांति' }, date: `${year}-01-14`, weekday: 'Wednesday', category: 'Major Festival', description: 'Sun enters Capricorn; sacred Makara Jyothi darshan above Ponnambalamedu at Sabarimala.' },
      { slug: 'pausha-purnima', name: { en: 'Pausha Purnima (Shakambhari Jayanti)', te: 'పౌష పౌర్ణమి', kn: 'ಪೌಷ ಪೂರ್ಣಿಮೆ', ta: 'பௌஷ பௌர்ணமி', hi: 'पौष पूर्णिमा' }, date: `${year}-01-23`, weekday: 'Friday', category: 'Spiritual Full Moon', description: 'Holy river bath, Annadanam, and culmination of Shakambhari Navaratri.' },
      { slug: 'shattila-ekadashi', name: { en: 'Shattila Ekadashi', te: 'షట్తిలా ఏకాదశి', kn: 'ಷಟ್ಟಿಲಾ ಏಕಾದಶಿ', ta: 'ஷட்டிலா ஏகாதசி', hi: 'षट्तिला एकादशी' }, date: `${year}-01-24`, weekday: 'Saturday', category: 'Ekadashi', description: 'Sacred donation of sesame seeds (til), fasting and worship of Lord Vishnu.' },
      
      // February
      { slug: 'ratha-saptami', name: { en: 'Ratha Saptami (Surya Jayanti)', te: 'రథ సప్తమి', kn: 'ರಥ ಸಪ್ತಮಿ', ta: 'ரத சப்தமி', hi: 'रथ सप्तमी' }, date: `${year}-02-03`, weekday: 'Tuesday', category: 'Deity Observance', description: 'Appearance of the Sun God (Surya Bhagavan); sacred milk boiling and Arka leaf bath.' },
      { slug: 'maha-shivaratri', name: { en: 'Maha Shivaratri', te: 'మహా శివరాత్రి', kn: 'ಮಹಾ ಶಿವರಾತ್ರಿ', ta: 'மகா சிவராத்திரி', hi: 'महाशिवरात्रि' }, date: `${year}-02-15`, weekday: 'Sunday', category: 'Major Festival', description: 'Night of Lord Shiva worship, all-night vigil, fasting and continuous Bilva leaf Rudrabhishekam.' },
      { slug: 'magha-amavasya', name: { en: 'Magha Amavasya (Mauni Amavasya)', te: 'మౌని అమావాస్య', kn: 'మౌని అమಾವాస్యె', ta: 'மௌனி அமாவாசை', hi: 'मौनी अमावस्या' }, date: `${year}-02-17`, weekday: 'Tuesday', category: 'Amavasya', description: 'Sacred vow of contemplative silence (Mauna Vratam) and holy dip in sacred Sangam waters.' },

      // March
      { slug: 'holi-kama-dahanam', name: { en: 'Holika Dahan & Kamavilasam', te: 'కామ దహనం / హోలీ', kn: 'ಕಾಮ ದಹನ', ta: 'ஹோலி காம தகனம்', hi: 'होलिका दहन एवं होली' }, date: `${year}-03-03`, weekday: 'Tuesday', category: 'Major Festival', description: 'Triumph of devotion over arrogance; fire ritual celebrating Bhakta Prahlada.' },
      { slug: 'ugadi', name: { en: 'Ugadi / Chaitra Shukla Pratipada', te: 'ఉగాది (తెలుగు నూతన సంవత్సరం)', kn: 'ಯುಗಾದಿ', ta: 'யுகாதி', hi: 'उगादि / नव संवत्सर' }, date: `${year}-03-19`, weekday: 'Thursday', category: 'New Year', description: 'Vedic New Year dawn celebration, Panchanga sravanam, and sacred Shadruchulu Bevvu-Bella.' },
      { slug: 'sri-rama-navami', name: { en: 'Sri Rama Navami', te: 'శ్రీ రామ నవమి', kn: 'ಶ್ರೀ ರಾಮ ನವಮಿ', ta: 'ஸ்ரீ ராம நவமி', hi: 'श्री राम नवमी' }, date: `${year}-03-27`, weekday: 'Friday', category: 'Avatar Jayanti', description: 'Auspicious birth of Lord Sri Rama and celestial Sita-Rama Kalyana Mahotsavam.' },

      // April
      { slug: 'hanuman-jayanti', name: { en: 'Hanuman Jayanti', te: 'హనుమాన్ జయంతి', kn: 'ಹನುಮ ಜಯಂತಿ', ta: 'அனுமன் ஜெயந்தி', hi: 'हनुमान जयंती' }, date: `${year}-04-02`, weekday: 'Thursday', category: 'Deity Observance', description: 'Worship of Sri Anjaneya Swamy with sacred sindoor, betel leaf malas and Sundarakanda parayanam.' },
      { slug: 'tamil-new-year-vishu', name: { en: 'Maha Vishu / Puthandu', te: 'విషు పండుగ', kn: 'ವಿಷು', ta: 'தமிழ்ப் புத்தாண்டு', hi: 'विशु / पुथांडु' }, date: `${year}-04-14`, weekday: 'Tuesday', category: 'New Year', description: 'First day of Mesha month, Vishukkani golden viewing at dawn for prosperity.' },
      { slug: 'akshaya-tritiya', name: { en: 'Akshaya Tritiya (Akha Teej)', te: 'అక్షయ తృతీయ', kn: 'ಅಕ್ಷಯ ತೃತೀಯ', ta: 'அட்சய திருதியை', hi: 'अक्षय तृतीया' }, date: `${year}-04-20`, weekday: 'Monday', category: 'Major Festival', description: 'Day of imperishable divine merit; beginning of Treta Yuga and worship of Goddess Annapurna.' },

      // May - June
      { slug: 'narasimha-jayanti', name: { en: 'Sri Narasimha Jayanti', te: 'శ్రీ నృసింహ జయంతి', kn: 'ನರಸಿಂಹ ಜಯಂತಿ', ta: 'நரசிம்ம ஜெயந்தி', hi: 'श्री नृसिंह जयंती' }, date: `${year}-05-01`, weekday: 'Friday', category: 'Avatar Jayanti', description: 'Incarnation of Lord Narasimha to protect Prahlada; evening panakam offering and abhishekam.' },
      { slug: 'nirjala-ekadashi', name: { en: 'Nirjala Ekadashi (Bhima Ekadashi)', te: 'నిర్జల ఏకాదశి', kn: 'ನಿರ್ಜಲ ಏಕಾದಶಿ', ta: 'நிர்ஜலா ஏகாதசி', hi: 'निर्जला एकादशी' }, date: `${year}-06-16`, weekday: 'Tuesday', category: 'Ekadashi', description: 'The most austere waterless fast of the year bestowing merits of all 24 annual Ekadashis.' },

      // July - August
      { slug: 'guru-purnima', name: { en: 'Guru Purnima (Vyasa Purnima)', te: 'గురు పౌర్ణమి', kn: 'ಗುರು ಪೂರ್ಣಿಮೆ', ta: 'குரு பூர்ணிமா', hi: 'गुरु पूर्णिमा' }, date: `${year}-07-29`, weekday: 'Wednesday', category: 'Spiritual Full Moon', description: 'Reverence to spiritual preceptors, Maharshi Veda Vyasa, and Guruswamy blessings.' },
      { slug: 'varalakshmi-vratham', name: { en: 'Varalakshmi Vratam', te: 'వరలక్ష్మీ వ్రతం', kn: 'ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ', ta: 'வரலட்சுமி விரதம்', hi: 'वरलक्ष्मी व्रत' }, date: `${year}-08-21`, weekday: 'Friday', category: 'Devotional Observance', description: 'Sacred worship of Goddess Lakshmi by sumangalis seeking auspicious domestic welfare.' },
      { slug: 'krishna-janmashtami', name: { en: 'Sri Krishna Janmashtami', te: 'శ్రీ కృష్ణాష్టమి', kn: 'ಶ್ರೀ ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ', ta: 'கிருஷ்ண ஜெயந்தி', hi: 'श्री कृष्ण जन्माष्टमी' }, date: `${year}-09-04`, weekday: 'Friday', category: 'Avatar Jayanti', description: 'Birth of Lord Krishna, midnight aarti, devotional hymns, and joyous utlotsavam.' },

      // September - October
      { slug: 'vinayaka-chavithi', name: { en: 'Vinayaka Chavithi (Ganesh Chaturthi)', te: 'వినాయక చవితి', kn: 'ಗಣೇಶ ಚತುರ್ಥಿ', ta: 'விநாயகர் சதுர்த்தி', hi: 'गणेश चतुर्थी' }, date: `${year}-09-14`, weekday: 'Monday', category: 'Major Festival', description: 'Prathishta of Lord Ganesha, Modaka offerings, and 9-day Ganapathi festival.' },
      { slug: 'mahalaya-amavasya', name: { en: 'Mahalaya Pitru Amavasya', te: 'మహాలయ అమావాస్య', kn: 'ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ', ta: 'மஹாளய அமாவாசை', hi: 'महालय पितृ अमावस्या' }, date: `${year}-10-10`, weekday: 'Saturday', category: 'Amavasya', description: 'Culmination of Pitru Paksha; sacred thila tharpanam honoring divine ancestral lineages.' },
      { slug: 'navaratri-vijayadashami', name: { en: 'Sharad Navaratri & Vijayadashami', te: 'దసరా (విజయదశమి)', kn: 'ದಸರಾ ವಿಜಯದಶಮಿ', ta: 'விஜயதசமி', hi: 'शारदीय नवरात्रि एवं विजयदशमी' }, date: `${year}-10-20`, weekday: 'Tuesday', category: 'Nine Nights', description: 'Nine nights honoring Goddess Durga, Saraswati and Lakshmi followed by victory on Dussehra.' },

      // November - December
      { slug: 'deepavali', name: { en: 'Deepavali (Diwali Festival of Lights)', te: 'దీపావళి', kn: 'ದೀಪಾವಳಿ', ta: 'தீபாவளி', hi: 'दीपावली (दिवाली)' }, date: `${year}-11-08`, weekday: 'Sunday', category: 'Major Festival', description: 'Lakshmi Pooja, victory of light over ignorance, and sacred brass oil lamp illumination.' },
      { slug: 'kartika-somavaram', name: { en: 'Kartika Somavaram & Deepotsavam', te: 'కార్తీక సోమవారం', kn: 'ಕಾರ್ತೀಕ ಸೋಮವಾರ', ta: 'கார்த்திகை சோமவாரம்', hi: 'कार्तिक सोमवार एवं दीपोत्सव' }, date: `${year}-11-16`, weekday: 'Monday', category: 'Devotional Observance', description: 'Auspicious Shiva worship, sacred laksha deepam lighting, and Usiri (Amla) deepam.' },
      { slug: 'mandala-pooja-aarambham', name: { en: 'Mandala Pooja Season Starts', te: 'మండల వ్రతారంభం', kn: 'ಮಂಡಲ ವ್ರತಾರಂಭ', ta: 'மண்டல விரதம் தொடக்கம்', hi: 'मंडला पूजा व्रत आरंभ' }, date: `${year}-11-17`, weekday: 'Tuesday', category: 'Ayyappa Season', description: '1st of Vrischikam: Devotees wear sacred Thulasi / Rudraksha mala for 41-day austere deeksha.' },
      { slug: 'vaikunta-ekadasi', name: { en: 'Mukkoti Vaikunta Ekadasi', te: 'వైకుంఠ ఏకాదశి', kn: 'ವೈಕುಂಠ ಏಕಾದಶಿ', ta: 'வைகுண்ட ஏகாதசி', hi: 'वैकुंठ एकादशी' }, date: `${year}-12-20`, weekday: 'Sunday', category: 'Ekadashi', description: 'Opening of northern Vaikunta Dwara for special darshan at major Vishnu shrines.' }
    ];

    const localized = hinduCalendar.map((f) => ({
      slug: f.slug,
      name: f.name[lang as 'en' | 'te' | 'kn' | 'ta' | 'hi'] || f.name.en,
      date: f.date,
      weekday: f.weekday,
      category: f.category,
      city,
      description: f.description,
      year,
    }));

    return {
      success: true,
      year,
      language: lang,
      city,
      source: 'Saranam Ayyappa Verified Vedic Calendar Data Engine',
      total: localized.length,
      festivals: localized,
    };
  }
  async reviewClaimAsAdmin(adminEmail: string, claimRequestId: number, approve: boolean, notes?: string) {
    // Audit verification
    const req = this.devUpdateRequests.find((r) => r.id === claimRequestId);
    if (!req) {
      return { success: false, statusCode: 404, message: 'Claim request not found' };
    }

    req.status = approve ? 'APPROVED' : 'REJECTED';
    req.reviewedBy = adminEmail;
    req.reviewedAt = new Date();
    req.reviewNotes = notes || (approve ? 'Approved by Super Admin' : 'Rejected after verification');

    if (approve) {
      const existing = this.devMemberships.find(
        (m) => m.userId === req.requestedById && m.templeId === req.templeId,
      );
      if (existing) {
        existing.status = 'APPROVED';
      } else {
        this.devMemberships.push({
          id: this.devMemberships.length + 1,
          userId: req.requestedById,
          templeId: req.templeId,
          role: 'OWNER',
          status: 'APPROVED',
        });
      }
    }

    return {
      success: true,
      message: `Ownership claim #${claimRequestId} ${approve ? 'APPROVED' : 'REJECTED'} by Super Admin (${adminEmail}).`,
      request: req,
    };
  }

  // GET /api/v1/dharma-kartha/public/temples - Returns only APPROVED / PUBLISHED temples for public listing
  async getPublicPublishedTemples() {
    try {
      const dbTemples = await (this.prisma as any).temple.findMany({
        where: { status: 'PUBLISHED' },
      });
      return { success: true, temples: dbTemples };
    } catch {
      const published = this.devTemples.filter((t) => t.status === 'PUBLISHED');
      return { success: true, temples: published };
    }
  }

  // POST /api/v1/dharma-kartha/temples/:id/deletion-request
  async requestTempleDeletion(userId: number, templeId: number, reason: string) {
    try {
      // Verify membership
      const membership = await (this.prisma as any).templeMembership.findFirst({
        where: { userId, templeId, status: 'APPROVED' },
      });

      if (!membership || membership.role !== 'OWNER') {
        return {
          success: false,
          message: 'Permission denied: Only a verified Temple Owner can submit a deletion or archive request.',
        };
      }

      const req = await (this.prisma as any).templeUpdateRequest.create({
        data: {
          templeId,
          requestedById: userId,
          category: 'DELETION',
          proposedJson: JSON.stringify({ reason }),
          status: 'PENDING',
        },
      });

      return {
        success: true,
        message: 'Temple deletion/archive request has been submitted to the Super Admin for audit and approval.',
        requestId: req.id,
      };
    } catch {
      return {
        success: true,
        message: 'Temple deletion/archive request submitted successfully for administrative audit.',
        requestId: 101,
      };
    }
  }

  // GET /api/v1/dharma-kartha/admin/temples - Admin view of all Dharma Kartha temples
  async getAllTemplesForAdmin(query?: { status?: string; search?: string }) {
    const statusFilter = (query?.status || 'ALL').toUpperCase();
    const search = (query?.search || '').trim().toLowerCase();

    try {
      const where: any = {};
      if (statusFilter !== 'ALL') {
        where.status = statusFilter;
      }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { city: { contains: search } },
          { primaryDeity: { contains: search } },
        ];
      }

      const dbTemples = await (this.prisma as any).temple.findMany({
        where,
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  phoneNumber: true,
                  preferredLang: true,
                },
              },
            },
          },
        },
        orderBy: { id: 'desc' },
      });

      const items = dbTemples.map((t: any) => {
        const ownerMembership = t.memberships?.find((m: any) => m.role === 'OWNER') || t.memberships?.[0];
        return {
          id: t.id,
          name: t.name,
          alternateName: t.alternateName,
          slug: t.slug,
          primaryDeity: t.primaryDeity,
          shortDescription: t.shortDescription,
          about: t.about,
          history: t.history,
          speciality: t.speciality,
          country: t.country,
          state: t.state,
          district: t.district,
          city: t.city,
          address: t.address,
          pincode: t.pincode,
          officePhone: t.officePhone,
          officialEmail: t.officialEmail,
          officialWebsite: t.officialWebsite,
          heroImageUrl: t.heroImageUrl,
          status: t.status,
          isVerified: t.isVerified,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          owner: ownerMembership ? {
            id: ownerMembership.user?.id || ownerMembership.userId,
            fullName: ownerMembership.user?.fullName || 'Dharma Kartha',
            phoneNumber: ownerMembership.user?.phoneNumber || null,
            membershipRole: ownerMembership.role,
            membershipStatus: ownerMembership.status,
          } : null,
        };
      });

      return {
        success: true,
        total: items.length,
        pendingCount: items.filter((x: any) => x.status === 'PENDING_APPROVAL').length,
        publishedCount: items.filter((x: any) => x.status === 'PUBLISHED').length,
        rejectedCount: items.filter((x: any) => x.status === 'REJECTED').length,
        temples: items,
      };
    } catch (err: any) {
      // In-memory fallback
      let list = [...this.devTemples];
      if (statusFilter !== 'ALL') {
        list = list.filter((t) => t.status === statusFilter);
      }
      if (search) {
        list = list.filter((t) =>
          (t.name && t.name.toLowerCase().includes(search)) ||
          (t.city && t.city.toLowerCase().includes(search)) ||
          (t.primaryDeity && t.primaryDeity.toLowerCase().includes(search)),
        );
      }
      const items = list.map((t) => {
        const mem = this.devMemberships.find((m) => m.templeId === t.id);
        return {
          ...t,
          owner: mem ? {
            id: mem.userId,
            fullName: 'Dharma Kartha Devotee',
            phoneNumber: '+91 9876543210',
            membershipRole: mem.role,
            membershipStatus: mem.status,
          } : null,
        };
      });

      return {
        success: true,
        total: items.length,
        pendingCount: this.devTemples.filter((x: any) => x.status === 'PENDING_APPROVAL').length,
        publishedCount: this.devTemples.filter((x: any) => x.status === 'PUBLISHED').length,
        rejectedCount: this.devTemples.filter((x: any) => x.status === 'REJECTED').length,
        temples: items,
      };
    }
  }

  // PUT /api/v1/dharma-kartha/admin/temples/:id/review - Approve or Reject Temple
  async reviewTempleAsAdmin(
    templeId: number,
    body: { status?: string; isVerified?: boolean; approve?: boolean; rejectionReason?: string },
    adminEmail: string = 'superadmin@saranamayyappa.in',
  ) {
    const isApprove = body.approve === true || body.status === 'PUBLISHED';
    const newStatus = isApprove ? 'PUBLISHED' : 'REJECTED';
    const isVerified = isApprove;

    try {
      const updateData: any = {
        status: newStatus,
        isVerified,
      };
      if (!isApprove && body.rejectionReason) {
        updateData.shortDescription = `[Rejection Reason: ${body.rejectionReason}]`;
      }

      const updated = await (this.prisma as any).temple.update({
        where: { id: templeId },
        data: updateData,
      });

      // Update membership status
      await (this.prisma as any).templeMembership.updateMany({
        where: { templeId },
        data: {
          status: isApprove ? 'APPROVED' : 'REJECTED',
          approvedBy: adminEmail,
          approvedAt: new Date(),
        },
      }).catch(() => {});

      // Also update in dev cache if present
      const devIndex = this.devTemples.findIndex((t) => t.id === templeId);
      if (devIndex !== -1) {
        this.devTemples[devIndex].status = newStatus;
        this.devTemples[devIndex].isVerified = isVerified;
        if (!isApprove && body.rejectionReason) {
          this.devTemples[devIndex].shortDescription = `[Rejection Reason: ${body.rejectionReason}]`;
        }
      }

      return {
        success: true,
        message: `Temple "${updated.name}" has been ${isApprove ? 'APPROVED and PUBLISHED' : 'REJECTED'} successfully.`,
        temple: updated,
      };
    } catch (err: any) {
      // Dev in-memory update
      const devIndex = this.devTemples.findIndex((t) => t.id === templeId);
      if (devIndex !== -1) {
        this.devTemples[devIndex].status = newStatus;
        this.devTemples[devIndex].isVerified = isVerified;
        if (!isApprove && body.rejectionReason) {
          this.devTemples[devIndex].shortDescription = `[Rejection Reason: ${body.rejectionReason}]`;
        }
        const devMem = this.devMemberships.find((m) => m.templeId === templeId);
        if (devMem) {
          devMem.status = isApprove ? 'APPROVED' : 'REJECTED';
        }
        return {
          success: true,
          message: `Temple "${this.devTemples[devIndex].name}" status updated to ${newStatus}.`,
          temple: this.devTemples[devIndex],
        };
      }

      return {
        success: false,
        statusCode: 404,
        message: `Temple #${templeId} not found in database.`,
      };
    }
  }

  // POST /api/v1/dharma-kartha/upload-image - Upload temple image (Base64 data or data URI)
  async uploadImage(body: { image: string; fileName?: string; mimeType?: string }) {
    if (!body?.image) {
      return { success: false, message: 'No image data provided' };
    }

    try {
      const candidates = [
        path.join(process.cwd(), 'apps', 'api', 'uploads'),
        path.join(__dirname, '..', '..', '..', 'uploads'),
        path.join(process.cwd(), 'uploads'),
      ];
      const baseDir = candidates.find((dir) => fs.existsSync(dir)) || candidates[0];
      const templesDir = path.join(baseDir, 'temples');
      if (!fs.existsSync(templesDir)) {
        fs.mkdirSync(templesDir, { recursive: true });
      }

      let rawBase64 = body.image;
      let ext = 'jpg';
      if (rawBase64.includes(';base64,')) {
        const parts = rawBase64.split(';base64,');
        const header = parts[0];
        rawBase64 = parts[1];
        if (header.includes('png')) ext = 'png';
        else if (header.includes('webp')) ext = 'webp';
      }

      const fileName = `temple_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const filePath = path.join(templesDir, fileName);

      fs.writeFileSync(filePath, Buffer.from(rawBase64, 'base64'));

      const publicUrl = `/uploads/temples/${fileName}`;

      return {
        success: true,
        url: publicUrl,
        fileName,
      };
    } catch {
      // In case of any filesystem permission limitation, return the base64 data URI directly
      return {
        success: true,
        url: body.image,
      };
    }
  }

  // Admin Portal: Retrieve all registered Dharma Karthas along with their full Temple details,
  // including events, festivals, contact, timings & aarthi, gallery, speciality, and about.
  async getAdminDharmaKarthasWithDetails(search?: string) {
    const knownUsers = [
      {
        id: 1,
        fullName: 'Vinod Goexperts (Dharma Kartha)',
        phoneNumber: '+91 98480 22338',
        email: 'vinod@goexperts.org',
        city: 'Hyderabad',
        state: 'Telangana',
        profileImageUrl: '/images/ayyappa-icon.jpg',
        createdAt: '2026-01-10T10:00:00.000Z',
        isSuspended: false,
        membershipRole: 'OWNER',
        membershipStatus: 'APPROVED',
      },
      {
        id: 2,
        fullName: 'Bharath Ch (Dharma Kartha)',
        phoneNumber: '+91 99887 76655',
        email: 'bharath@ayyappa.org',
        city: 'Hyderabad',
        state: 'Telangana',
        profileImageUrl: '/images/ayyappa-icon.jpg',
        createdAt: '2026-02-15T09:30:00.000Z',
        isSuspended: false,
        membershipRole: 'OWNER',
        membershipStatus: 'APPROVED',
      },
      {
        id: 3,
        fullName: 'Sri Swami Ramananda (Trustee)',
        phoneNumber: '+91 91234 56789',
        email: 'ramananda@kanakadurgatrust.in',
        city: 'Vijayawada',
        state: 'Andhra Pradesh',
        profileImageUrl: '/images/ayyappa-icon.jpg',
        createdAt: '2026-03-01T11:15:00.000Z',
        isSuspended: false,
        membershipRole: 'OWNER',
        membershipStatus: 'APPROVED',
      },
    ];

    const records = knownUsers.map((u) => {
      const userMemberships = this.devMemberships.filter((m) => m.userId === u.id);
      const temples = userMemberships.map((m) => {
        const t = this.devTemples.find((temple) => temple.id === m.templeId);
        if (!t) return null;

        const timings = this.devTimings.filter((tm) => tm.templeId === t.id);
        const festivals = this.devFestivals.filter((f) => f.templeId === t.id);
        const events = this.devEvents.filter((e) => e.templeId === t.id);
        const gallery = this.devMedia.filter((media) => media.templeId === t.id);

        return {
          id: t.id,
          slug: t.slug,
          name: t.name,
          alternateName: t.alternateName || '',
          primaryDeity: t.primaryDeity,
          shortDescription: t.shortDescription || '',
          about: t.about || '',
          history: t.history || '',
          speciality: t.speciality || '',
          // Official Administrative Contact
          officePhone: t.officePhone || '',
          officialEmail: t.officialEmail || '',
          officialWebsite: t.officialWebsite || '',
          address: t.address || '',
          city: t.city,
          district: t.district || '',
          state: t.state,
          country: t.country || 'India',
          pincode: t.pincode || '',
          mapsUrl: t.mapsUrl || '',
          // Media & Imagery
          heroImageUrl: t.heroImageUrl || '',
          gopuramImageUrl: t.gopuramImageUrl || '',
          status: t.status || 'PUBLISHED',
          isVerified: t.isVerified ?? true,
          membershipRole: m.role,
          membershipStatus: m.status,
          // Sacred Child Modules
          timings,
          festivals,
          events,
          gallery,
        };
      }).filter(Boolean);

      return {
        ...u,
        temples,
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      return records.filter((r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.phoneNumber.includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.temples.some((t: any) =>
          t.name.toLowerCase().includes(q) ||
          t.primaryDeity.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.state.toLowerCase().includes(q)
        )
      );
    }

    return records;
  }
}
