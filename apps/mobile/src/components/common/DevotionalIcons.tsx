import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

// 1. Pooja Vidhanam: Sacred Pooja Thali with Brass Diya & Flowers
export const PoojaVidhanamIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Thali plate */}
    <Path d="M4 23 C4 23 8 27 16 27 C24 27 28 23 28 23" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M2 21 C2 21 7 24 16 24 C25 24 30 21 30 21" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    {/* Deepam Lamp base */}
    <Path d="M12 21 C12 18 14 17 16 17 C18 17 20 18 20 21 Z" fill={color} />
    {/* Oil lamp bowl */}
    <Path d="M10 17 H22 C22 17 21 13 16 13 C11 13 10 17 10 17 Z" fill={color} />
    {/* Sacred flame */}
    <Path d="M16 4 C16 4 19 9 19 11.5 C19 13.5 17.5 14.5 16 14.5 C14.5 14.5 13 13.5 13 11.5 C13 9 16 4 16 4 Z" fill="#E65100" />
    <Path d="M16 7 C16 7 17.5 10 17.5 11.5 C17.5 12.5 16.8 13.5 16 13.5 C15.2 13.5 14.5 12.5 14.5 11.5 C14.5 10 16 7 16 7 Z" fill="#FFD54F" />
    {/* Flowers on plate */}
    <Circle cx="8" cy="19" r="1.8" fill="#E53935" />
    <Circle cx="24" cy="19" r="1.8" fill="#E53935" />
  </Svg>
);

// 2. Astothrams: Sacred Temple Gopuram Shrine
export const AstothramsIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Kalasha top */}
    <Circle cx="16" cy="3.5" r="1.5" fill="#FFD54F" />
    <Path d="M15 5 H17 L16.5 7 H15.5 Z" fill={color} />
    {/* Tier 1 */}
    <Path d="M13.5 7 H18.5 L19.5 11 H12.5 Z" fill={color} />
    {/* Tier 2 */}
    <Path d="M11 11 H21 L22.5 16 H9.5 Z" fill={color} />
    {/* Tier 3 */}
    <Path d="M8 16 H24 L25.5 22 H6.5 Z" fill={color} />
    {/* Sanctum pillars */}
    <Path d="M5 22 H27 V28 H5 Z" stroke={color} strokeWidth="1.6" />
    {/* Inner sanctum doorway */}
    <Path d="M13 28 V24 Q16 22 19 24 V28 Z" fill="#173D32" />
    {/* Mini spires */}
    <Path d="M8 19 L9 22 H7 Z M24 19 L25 22 H23 Z" fill="#FFD54F" />
  </Svg>
);

// 3. Slokas: Sacred Palm-Leaf Scripture / Open Holy Book
export const SlokasIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Left Page */}
    <Path
      d="M16 11 C13 9 7 9 4 11 V25 C7 23 13 23 16 25 Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="rgba(255, 248, 235, 0.4)"
    />
    {/* Right Page */}
    <Path
      d="M16 11 C19 9 25 9 28 11 V25 C25 23 19 23 16 25 Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="rgba(255, 248, 235, 0.4)"
    />
    {/* Spine */}
    <Path d="M16 11 V25" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Sacred verses lines */}
    <Path d="M7 14 H13 M7 17 H13 M7 20 H11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M19 14 H25 M19 17 H25 M21 20 H25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    {/* Sacred Om symbol or glow at top */}
    <Circle cx="16" cy="6" r="2" fill="#E65100" />
  </Svg>
);

// 4. Bhajans: Musical Notes & Kartals
export const BhajansIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Double musical notes with crossbeam */}
    <Circle cx="10" cy="22" r="3.5" fill={color} />
    <Circle cx="22" cy="19" r="3.5" fill={color} />
    <Path d="M13.5 22 V9 L25.5 6 V19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.5 9 L25.5 6" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Little rhythm sparkle */}
    <Path d="M19 11 L20 13 L22 13 L20.5 14.5 L21 16.5 L19 15 L17 16.5 L17.5 14.5 L16 13 L18 13 Z" fill="#FFD54F" />
  </Svg>
);

// 5. Harathis & Songs: Multi-Tiered Brass Aarti Deepam with Flame
export const HarathisIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Stand base */}
    <Path d="M11 27 H21 L19 24 H13 Z" fill={color} />
    <Path d="M15 24 V18 H17 V24 Z" fill={color} />
    {/* Main saucer bowl */}
    <Path d="M8 18 H24 C24 18 22 14 16 14 C10 14 8 18 8 18 Z" fill={color} />
    {/* Central burning flame */}
    <Path d="M16 4 C16 4 19 8 19 10.5 C19 12.5 17.5 13.5 16 13.5 C14.5 13.5 13 12.5 13 10.5 C13 8 16 4 16 4 Z" fill="#E65100" />
    <Path d="M16 6.5 C16 6.5 17.5 9 17.5 10.5 C17.5 11.5 16.8 12.2 16 12.2 C15.2 12.2 14.5 11.5 14.5 10.5 C14.5 9 16 6.5 16 6.5 Z" fill="#FFD54F" />
    {/* Side flames */}
    <Path d="M10 10 C10 10 12 12.5 12 14 C12 15 11.2 15.5 10.5 15.5 C9.8 15.5 9 15 9 14 C9 12.5 10 10 10 10 Z" fill="#FF9800" />
    <Path d="M22 10 C22 10 23 12.5 23 14 C23 15 22.2 15.5 21.5 15.5 C20.8 15.5 20 15 20 14 C20 12.5 22 10 22 10 Z" fill="#FF9800" />
  </Svg>
);

// 6. Live Streams: Devotional Video Screen with Play Triangle
export const LiveStreamsIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Monitor / TV box */}
    <Rect x="4" y="6" width="24" height="17" rx="3.5" stroke={color} strokeWidth="2" />
    {/* Play triangle */}
    <Polygon points="13,10 21,14.5 13,19" fill="#E65100" />
    {/* Stand neck and base */}
    <Path d="M16 23 V26" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M11 26 H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Live broadcast dot */}
    <Circle cx="23" cy="9.5" r="1.5" fill="#D32F2F" />
  </Svg>
);

// 7. Panchangam: Calendar Page with Rings & Checkmark
export const PanchangamIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Calendar body */}
    <Rect x="4" y="6" width="24" height="21" rx="4" stroke={color} strokeWidth="2" fill="rgba(255, 248, 235, 0.4)" />
    {/* Top Header bar */}
    <Path d="M4 12 H28" stroke={color} strokeWidth="1.8" />
    {/* Hanging rings */}
    <Path d="M9 3.5 V7 M23 3.5 V7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    {/* Checkmark inside */}
    <Path d="M10 18 L14 22 L22 14" stroke="#E65100" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 8. Temples in India: Classic Indian Temple Architecture
export const TemplesIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Central Shikhara Dome */}
    <Path d="M16 3 C16 3 20 8 20 14 H12 C12 8 16 3 16 3 Z" fill={color} />
    {/* Kalasha atop */}
    <Circle cx="16" cy="2.5" r="1.2" fill="#FFD54F" />
    {/* Side miniature Shikharas */}
    <Path d="M8 10 C8 10 11 13 11 16 H6 C6 13 8 10 8 10 Z" fill={color} />
    <Path d="M24 10 C24 10 26 13 26 16 H21 C21 13 24 10 24 10 Z" fill={color} />
    {/* Base sanctum pillars */}
    <Path d="M4 16 H28 V27 H4 Z" stroke={color} strokeWidth="1.6" />
    {/* Temple archway */}
    <Path d="M12 27 V20 Q16 18 20 20 V27 Z" fill="#173D32" />
    <Path d="M3 27 H29" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// 9. Donations: Holy Kalasha with Sacred Offerings / Giving Hand
export const DonationsIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Pot / Kalasha base */}
    <Path d="M9 16 C9 13 11 11 16 11 C21 11 23 13 23 16 C23 21 21 26 16 26 C11 26 9 21 9 16 Z" stroke={color} strokeWidth="2" fill="rgba(255, 248, 235, 0.4)" />
    {/* Pot rim */}
    <Path d="M12 11 H20" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    {/* Coconut & Mango leaves on Kalasha */}
    <Circle cx="16" cy="7.5" r="3" fill="#345147" />
    <Path d="M16 4.5 L17.5 1.5 M13 6 L10 4 M19 6 L22 4" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round" />
    {/* Falling gold coins */}
    <Circle cx="8" cy="7" r="2.2" fill="#FFD54F" stroke="#E65100" strokeWidth="1" />
    <Circle cx="24" cy="8" r="2.2" fill="#FFD54F" stroke="#E65100" strokeWidth="1" />
  </Svg>
);

// 10. Food Donation: Sacred Annadanam Vessel with Holy Grains
export const FoodDonationIcon: React.FC<IconProps> = ({ size = 28, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Wide Prasadam Bowl */}
    <Path d="M5 14 C5 22 10 25 16 25 C22 25 27 22 27 14 Z" stroke={color} strokeWidth="2" fill="rgba(255, 248, 235, 0.4)" />
    <Path d="M4 14 H28" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    {/* Bowl base ring */}
    <Path d="M11 25 H21 L19 28 H13 Z" fill={color} />
    {/* Holy grains of rice / Prasadam heaped in center */}
    <Circle cx="16" cy="11" r="2" fill="#FFD54F" />
    <Circle cx="12" cy="11.5" r="1.8" fill="#FFD54F" />
    <Circle cx="20" cy="11.5" r="1.8" fill="#FFD54F" />
    <Circle cx="14" cy="8.5" r="1.6" fill="#FFD54F" />
    <Circle cx="18" cy="8.5" r="1.6" fill="#FFD54F" />
    <Circle cx="16" cy="6" r="1.5" fill="#E65100" />
    {/* Steam / Aroma curls */}
    <Path d="M11 5 Q13 3 11 1 M21 5 Q23 3 21 1" stroke="#FF9800" strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

// Traditional South Indian Kuthu Vilakku (Brass Deepam Lamp)
export const KuthuVilakkuIcon: React.FC<IconProps> = ({ size = 32, color = '#D48B30' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 36" fill="none">
    {/* Top peacock / kalasha finial */}
    <Circle cx="16" cy="4" r="1.8" fill="#FFD54F" />
    {/* Top bowl / tier with flames */}
    <Path d="M11 10 H21 C21 10 19.5 7 16 7 C12.5 7 11 10 11 10 Z" fill={color} />
    <Circle cx="9" cy="8" r="1.2" fill="#FF5722" />
    <Circle cx="16" cy="5.5" r="1.2" fill="#FF5722" />
    <Circle cx="23" cy="8" r="1.2" fill="#FF5722" />
    {/* Stem column */}
    <Path d="M15 10 V26 H17 V10 Z" fill={color} />
    <Circle cx="16" cy="16" r="2.5" fill="#FFD54F" />
    {/* Lower tier saucer */}
    <Path d="M9 22 H23 C23 22 21 19 16 19 C11 19 9 22 9 22 Z" fill={color} />
    {/* Base pedestals */}
    <Path d="M11 26 H21 L23 32 H9 Z" fill={color} />
    <Path d="M7 32 H25" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Hamburger Menu Icon
export const HamburgerIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3.5 6 H20.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M3.5 12 H20.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M3.5 18 H20.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

// Notification Bell Icon with Optional Badge
export const NotificationBellIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 16.5 V10 C18 6.7 15.3 4 12 4 C8.7 4 6 6.7 6 10 V16.5 L4.5 18 H19.5 L18 16.5 Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M10 19.5 C10 20.6 10.9 21.5 12 21.5 C13.1 21.5 14 20.6 14 19.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Circle cx="12" cy="2.5" r="1.2" fill={color} />
  </Svg>
);

