import { Platform, TextStyle } from 'react-native';

/**
 * ============================================================================
 * SARANAM AYYAPPA - MASTER THEME CONFIGURATION FILE
 * ============================================================================
 * Central Theme System:
 * - Color Palette: Sacred Pearl Green (#173D32, #0C251E, #215344, #2E7561)
 * - Typography: Poppins Bold for Titles, Poppins Regular for Descriptions & Info
 * ============================================================================
 */

export const THEME_COLORS = {
  // --- PRIMARY BRAND & PEARL GREEN COLORS ---
  headerPrimary: '#173D32',      // Deep Pearl Green for headers & primary actions
  headerDeep: '#0C251E',         // Dark Pearl Green tone & status bar color
  headerMid: '#215344',          // Mid Pearl Green
  orangeAccent: '#2E7561',       // Vibrant Pearl Green accent
  primaryBrand: '#173D32',       // Primary Pearl Green theme color
  accentBrand: '#215344',        // Accent highlights
  pearlGreen: '#173D32',         // Sacred Pearl Green
  pearlGreenDeep: '#0C251E',     // Deep Pearl Green
  pearlGreenMid: '#215344',      // Mid Pearl Green
  pearlGreenLight: '#2E7561',    // Vibrant Pearl Green
  pearlGreenAccent: '#1C5344',   // Accent Pearl Green
  pearlGreenMint: '#EAF4EF',     // Soft Pearl Mint surface
  pearlGreenBorder: '#CCE3D8',   // Pearl Green border
  pearlGreenCream: '#F4F9F6',    // Pearl Green Cream

  // --- DEVOTIONAL BACKGROUND & GRADIENT PALETTE ---
  bgTop: '#173D32',              // Pearl Green gradient top
  bgMiddle: '#215344',           // Pearl Green gradient middle
  bgBottom: '#2E7561',           // Pearl Green gradient bottom
  goldenYellow: '#DFA62E',       // Auspicious temple gold color
  sacredGold: '#C9A84E',         // Deep temple gold

  // --- CARD & CONTAINER SURFACES ---
  cardBackground: '#FFFFFF',     // Clean white surface for cards
  cardBackgroundAlt: '#F4F9F6',  // Warm Pearl Green cream surface
  cardBorder: '#CCE3D8',         // Subtle Pearl Green border for cards
  divider: '#CCE3D8',            // List / content dividers

  // --- CALENDAR & TODAY'S PANCHANGAM CARD ---
  calendarDateBox: '#173D32',    // Date box background (Pearl Green)
  calendarDateNum: '#FAECC5',    // Date number text color (Divine Gold)
  calendarMonthText: '#112620',  // Month title color
  calendarPanchangBox: '#215344',// Panchangam details box background
  calendarPanchangText: '#FAECC5',// Panchangam values text color

  // --- TICKER BANNER ---
  tickerBg: '#DFA62E',           // Devotional scrolling ticker background (Gold)
  tickerText: '#0C251E',         // Mantra text color (Deep Pearl Green)
  omPurple: '#215344',           // Om symbol accent (Pearl Green)

  // --- TEXT COLORS ---
  textPrimary: '#112620',        // Main dark heading & title text (Deep Pearl Ink)
  textSecondary: '#345147',      // Subtitle, description & information text
  textMuted: '#57746B',          // Captions, placeholders & hints
  textLight: '#FFFFFF',          // Pure white text on Pearl Green backgrounds
  textGold: '#DFA62E',           // Gold highlighted text
  textDark: '#0C251E',           // Deep Pearl Green text

  // --- BUTTONS & ACTIONS ---
  buttonPrimaryBg: '#173D32',    // Primary button background (Pearl Green)
  buttonPrimaryText: '#FFFFFF',  // Primary button text color
  buttonSecondaryBg: '#2E7561',  // Secondary button background
  buttonSecondaryText: '#FFFFFF',// Secondary button text color
  buttonDisabledBg: '#BDBDBD',   // Disabled button background

  // --- TOAST NOTIFICATIONS & STATUS FEEDBACK ---
  success: '#2B825C',            // Sacred Pearl Green (Success toast / badges)
  error: '#B71C1C',              // Deep Ruby Red (Error toast / validation)
  warning: '#DFA62E',            // Temple gold warning color
  info: '#1C5344',               // Pearl Green info alerts

  // --- ACTIONS & ICONS ---
  checkCircle: '#173D32',
  checkIcon: '#FFFFFF',

  // --- BACKWARD COMPATIBILITY ALIASES ---
  brown: '#173D32',
  maroon: '#173D32',
};

// Standard shorthand for colors
export const COLORS = THEME_COLORS;

/**
 * ============================================================================
 * FONT FAMILIES & TEXT STYLES (POPPINS BOLD FOR TITLES, POPPINS REGULAR FOR INFO)
 * ============================================================================
 */
export const THEME_FONTS = {
  // Title / Heading Font: Poppins Bold
  titleFont: Platform.select({
    ios: 'Poppins-Bold',
    android: 'Poppins_700Bold',
    web: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'Poppins_700Bold',
  }),

  // Extra Bold Font: Poppins 800
  extraBoldFont: Platform.select({
    ios: 'Poppins-ExtraBold',
    android: 'Poppins_800ExtraBold',
    web: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'Poppins_800ExtraBold',
  }),

  // SemiBold Font: Poppins 600
  semiBoldFont: Platform.select({
    ios: 'Poppins-SemiBold',
    android: 'Poppins_600SemiBold',
    web: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'Poppins_600SemiBold',
  }),

  // Medium Font: Poppins 500
  mediumFont: Platform.select({
    ios: 'Poppins-Medium',
    android: 'Poppins_500Medium',
    web: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'Poppins_500Medium',
  }),

  // Description & Information Font: Poppins Regular (400)
  descFont: Platform.select({
    ios: 'Poppins-Regular',
    android: 'Poppins_400Regular',
    web: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'Poppins_400Regular',
  }),

  // Main font family used across the app
  fontFamily: Platform.select({
    ios: 'Poppins-Regular',
    android: 'Poppins_400Regular',
    web: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'Poppins_400Regular',
  }),

  // Font family specifically for devotional & information texts
  sacredFontFamily: Platform.select({
    ios: 'NTR-Regular',
    android: 'NTR-Regular',
    web: 'NTR, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'NTR-Regular',
  }),

  // NTR Font specifically for Telugu, Kannada, Tamil, Hindi
  ntrFont: Platform.select({
    ios: 'NTR-Regular',
    android: 'NTR-Regular',
    web: 'NTR, "Noto Sans Kannada", "Noto Sans Tamil", "Noto Sans Devanagari", Poppins, sans-serif',
    default: 'NTR-Regular',
  }),

  // Poppins Font specifically for English
  poppinsFont: Platform.select({
    ios: 'Poppins-Regular',
    android: 'Poppins_400Regular',
    web: 'Poppins, sans-serif',
    default: 'Poppins_400Regular',
  }),

  // Dynamic language-aware font resolver:
  // - Telugu, Kannada, Tamil, Hindi -> NTR font style
  // - English -> Poppins
  getFontForLanguage: (lang: string = 'en', weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular') => {
    const isIndic = ['te', 'kn', 'ta', 'hi'].includes(String(lang).toLowerCase());
    if (isIndic) {
      return Platform.select({
        ios: 'NTR-Regular',
        android: 'NTR-Regular',
        web: 'NTR, "Noto Sans Kannada", "Noto Sans Tamil", "Noto Sans Devanagari", Poppins, sans-serif',
        default: 'NTR-Regular',
      });
    }
    if (weight === 'bold') {
      return Platform.select({
        ios: 'Poppins-Bold',
        android: 'Poppins_700Bold',
        web: 'Poppins, sans-serif',
        default: 'Poppins_700Bold',
      });
    }
    if (weight === 'semiBold') {
      return Platform.select({
        ios: 'Poppins-SemiBold',
        android: 'Poppins_600SemiBold',
        web: 'Poppins, sans-serif',
        default: 'Poppins_600SemiBold',
      });
    }
    if (weight === 'medium') {
      return Platform.select({
        ios: 'Poppins-Medium',
        android: 'Poppins_500Medium',
        web: 'Poppins, sans-serif',
        default: 'Poppins_500Medium',
      });
    }
    return Platform.select({
      ios: 'Poppins-Regular',
      android: 'Poppins_400Regular',
      web: 'Poppins, sans-serif',
      default: 'Poppins_400Regular',
    });
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },

  // Font sizes
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
};

export const FONTS = THEME_FONTS;

/**
 * Pre-composed typography styles
 * - Titles / Headings: Poppins Bold (700)
 * - Descriptions / Information / Body: Poppins Regular (400)
 */
export const TYPOGRAPHY: Record<string, TextStyle> = {
  // Big Screen / Modal Heading (App Header)
  h1: {
    fontFamily: THEME_FONTS.titleFont,
    fontSize: THEME_FONTS.sizes.xxl,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
    letterSpacing: 0.5,
  },

  // Section Heading
  h2: {
    fontFamily: THEME_FONTS.titleFont,
    fontSize: THEME_FONTS.sizes.xl,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  // Card / Screen Title
  title: {
    fontFamily: THEME_FONTS.titleFont,
    fontSize: THEME_FONTS.sizes.md,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
  },

  // Subtitle / Secondary label
  subtitle: {
    fontFamily: THEME_FONTS.descFont,
    fontSize: THEME_FONTS.sizes.sm,
    fontWeight: '400',
    color: THEME_COLORS.textSecondary,
  },

  // Body content text
  body: {
    fontFamily: THEME_FONTS.descFont,
    fontSize: THEME_FONTS.sizes.base,
    fontWeight: '400',
    color: THEME_COLORS.textPrimary,
    lineHeight: 22,
  },

  // Description text
  description: {
    fontFamily: THEME_FONTS.descFont,
    fontSize: THEME_FONTS.sizes.base,
    fontWeight: '400',
    color: THEME_COLORS.textSecondary,
    lineHeight: 20,
  },

  // Information text
  information: {
    fontFamily: THEME_FONTS.descFont,
    fontSize: THEME_FONTS.sizes.sm,
    fontWeight: '400',
    color: THEME_COLORS.textSecondary,
    lineHeight: 18,
  },

  // Bold Body content
  bodyBold: {
    fontFamily: THEME_FONTS.titleFont,
    fontSize: THEME_FONTS.sizes.base,
    fontWeight: '700',
    color: THEME_COLORS.textPrimary,
  },

  // Buttons
  button: {
    fontFamily: THEME_FONTS.titleFont,
    fontSize: THEME_FONTS.sizes.base,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: THEME_COLORS.buttonPrimaryText,
  },

  // Caption / Small metadata
  caption: {
    fontFamily: THEME_FONTS.descFont,
    fontSize: THEME_FONTS.sizes.xs,
    fontWeight: '400',
    color: THEME_COLORS.textMuted,
  },
};

/**
 * Single Unified Theme Export
 */
export const THEME = {
  colors: THEME_COLORS,
  fonts: THEME_FONTS,
  typography: TYPOGRAPHY,
};

export default THEME;
