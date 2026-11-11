import { Platform, TextStyle } from 'react-native';

/**
 * ============================================================================
 * SARANAM AYYAPPA - MASTER THEME CONFIGURATION FILE
 * ============================================================================
 * Edit ANY color or text font style in this file to update the entire mobile app!
 * 
 * 1. COLORS: Change primary colors, gradients, background, text, borders, etc.
 * 2. FONTS: Change font family, font sizes, font weights, and typography styles.
 * ============================================================================
 */

export const THEME_COLORS = {
  // --- PRIMARY BRAND & HEADER COLORS ---
  headerPrimary: '#D84315',      // Main header bar & prominent action color
  headerDeep: '#BF360C',         // Darker header tone & status bar color
  orangeAccent: '#E65100',       // Button accents, icons, and highlights
  primaryBrand: '#D84315',       // Primary theme color
  accentBrand: '#E65100',        // Accent highlights

  // --- DEVOTIONAL BACKGROUND & GRADIENT PALETTE ---
  bgTop: '#FFA000',              // Devotional background gradient top
  bgMiddle: '#FFC107',           // Devotional background gradient middle
  bgBottom: '#FFD54F',           // Devotional background gradient bottom
  goldenYellow: '#FFC107',       // Auspicious gold color
  sacredGold: '#FFB300',         // Deep temple gold

  // --- CARD & CONTAINER SURFACES ---
  cardBackground: '#FFFFFF',     // Clean white surface for cards
  cardBackgroundAlt: '#FFF8E1',  // Warm cream surface
  cardBorder: '#FFE082',         // Subtle gold border for cards
  divider: '#E0E0E0',            // List / content dividers

  // --- CALENDAR & TODAY'S PANCHANGAM CARD ---
  calendarDateBox: '#EF6C00',    // Date box background
  calendarDateNum: '#FFD54F',    // Date number text color
  calendarMonthText: '#212121',  // Month title color
  calendarPanchangBox: '#E65100',// Panchangam details box background
  calendarPanchangText: '#FFE082',// Panchangam values text color

  // --- TICKER BANNER ---
  tickerBg: '#FFC107',           // Devotional scrolling ticker background
  tickerText: '#421405',         // Scrolling mantra text color
  omPurple: '#7B1FA2',           // Auspicious Om symbol accent

  // --- TEXT COLORS ---
  textPrimary: '#212121',        // Main dark heading & title text
  textSecondary: '#424242',      // Subtitle & secondary information text
  textMuted: '#757575',          // Captions, placeholders & hints
  textLight: '#FFFFFF',          // Pure white text on dark/orange backgrounds
  textGold: '#FFD54F',           // Gold highlighted text
  textDark: '#1A1A1A',           // Deep dark text

  // --- BUTTONS & ACTIONS ---
  buttonPrimaryBg: '#D84315',    // Primary submit button background
  buttonPrimaryText: '#FFFFFF',  // Primary button text color
  buttonSecondaryBg: '#E65100',  // Secondary button background
  buttonSecondaryText: '#FFFFFF',// Secondary button text color
  buttonDisabledBg: '#BDBDBD',   // Disabled button background

  // --- TOAST NOTIFICATIONS & STATUS FEEDBACK ---
  success: '#1B5E20',            // Sacred Forest Green (Success toast / badges)
  error: '#B71C1C',              // Deep Ruby Red (Error toast / validation)
  warning: '#E65100',            // Saffron warning color
  info: '#0288D1',               // Informational alerts

  // --- ACTIONS & ICONS ---
  checkCircle: '#1F1F1F',
  checkIcon: '#FFFFFF',
};

// Standard shorthand for colors
export const COLORS = THEME_COLORS;

/**
 * ============================================================================
 * FONT FAMILIES & TEXT STYLES
 * ============================================================================
 * Change the fontFamily or typography styles below to alter typography globally.
 */
export const THEME_FONTS = {
  // Main font family used across the app
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    default: 'sans-serif',
  }),

  // Font family specifically for sacred Sanskrit/Telugu/Tamil/Kannada/Hindi texts
  sacredFontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: '"Noto Sans", Roboto, sans-serif',
    default: 'sans-serif',
  }),

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
 * Pre-composed, ready-to-use typography styles for headings, bodies, and labels
 */
export const TYPOGRAPHY: Record<string, TextStyle> = {
  // Big Screen / Modal Heading (e.g. App Header)
  h1: {
    fontFamily: THEME_FONTS.fontFamily,
    fontSize: THEME_FONTS.sizes.xxl,
    fontWeight: THEME_FONTS.weights.black,
    color: THEME_COLORS.textPrimary,
    letterSpacing: 0.5,
  },

  // Section Heading
  h2: {
    fontFamily: THEME_FONTS.fontFamily,
    fontSize: THEME_FONTS.sizes.xl,
    fontWeight: THEME_FONTS.weights.bold,
    color: THEME_COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  // Card Title
  title: {
    fontFamily: THEME_FONTS.fontFamily,
    fontSize: THEME_FONTS.sizes.md,
    fontWeight: THEME_FONTS.weights.bold,
    color: THEME_COLORS.textPrimary,
  },

  // Subtitle / Secondary label
  subtitle: {
    fontFamily: THEME_FONTS.fontFamily,
    fontSize: THEME_FONTS.sizes.sm,
    fontWeight: THEME_FONTS.weights.medium,
    color: THEME_COLORS.textSecondary,
  },

  // Body content text (slokas, guidelines, terms)
  body: {
    fontFamily: THEME_FONTS.sacredFontFamily,
    fontSize: THEME_FONTS.sizes.base,
    fontWeight: THEME_FONTS.weights.regular,
    color: THEME_COLORS.textPrimary,
    lineHeight: 22,
  },

  // Bold Body content
  bodyBold: {
    fontFamily: THEME_FONTS.sacredFontFamily,
    fontSize: THEME_FONTS.sizes.base,
    fontWeight: THEME_FONTS.weights.bold,
    color: THEME_COLORS.textPrimary,
  },

  // Buttons
  button: {
    fontFamily: THEME_FONTS.fontFamily,
    fontSize: THEME_FONTS.sizes.base,
    fontWeight: THEME_FONTS.weights.bold,
    letterSpacing: 0.5,
    color: THEME_COLORS.buttonPrimaryText,
  },

  // Caption / Small metadata
  caption: {
    fontFamily: THEME_FONTS.fontFamily,
    fontSize: THEME_FONTS.sizes.xs,
    fontWeight: THEME_FONTS.weights.regular,
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

