import React from 'react';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// 1. Brass Diya Oil Lamp (Pooja Vidhanam)
export const BrassDiyaIcon: React.FC<IconProps> = ({ size = 26, color = '#C98928' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Diya Base Pedestal */}
    <Path d="M10 27H22C23 27 23.5 28.5 22.5 29H9.5C8.5 28.5 9 27 10 27Z" fill={color} />
    <Path d="M13 24H19V27H13V24Z" fill={color} opacity={0.9} />
    {/* Diya Bowl */}
    <Path
      d="M5 18C5 23 10 25 16 25C22 25 27 23 27 18C27 16.5 25.5 16.5 23 17.5C19 19 13 19 9 17.5C6.5 16.5 5 16.5 5 18Z"
      fill={color}
    />
    <Path
      d="M6 18C8.5 19.5 12 20.5 16 20.5C20 20.5 23.5 19.5 26 18"
      stroke="#FFE599"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Golden Diya Flame */}
    <Path
      d="M16 4C16 4 11.5 11 11.5 14C11.5 16.5 13.5 18.5 16 18.5C18.5 18.5 20.5 16.5 20.5 14C20.5 11 16 4 16 4Z"
      fill="#F4C75F"
    />
    <Path
      d="M16 8C16 8 13.5 12 13.5 14C13.5 15.4 14.6 16.5 16 16.5C17.4 16.5 18.5 15.4 18.5 14C18.5 12 16 8 16 8Z"
      fill="#E76A05"
    />
    <Circle cx="16" cy="14.5" r="1.3" fill="#FFF2B2" />
  </Svg>
);

// 2. Green Calendar Icon (Panchangam)
export const GreenCalendarIcon: React.FC<IconProps> = ({ size = 26, color = '#2E7D32' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Calendar Rings */}
    <Path d="M10 3V7 M22 3V7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    {/* Calendar Outer Body */}
    <Rect x="5" y="5" width="22" height="23" rx="4" stroke={color} strokeWidth="2" fill="#FFFFFF" />
    {/* Red/Green Header Banner */}
    <Path d="M5 9C5 6.8 6.8 5 9 5H23C25.2 5 27 6.8 27 9V11H5V9Z" fill={color} />
    {/* Date Dots / Grid */}
    <Circle cx="10" cy="16" r="1.5" fill={color} />
    <Circle cx="16" cy="16" r="1.5" fill={color} />
    <Circle cx="22" cy="16" r="1.5" fill={color} />
    <Circle cx="10" cy="21" r="1.5" fill={color} />
    <Circle cx="16" cy="21" r="1.5" fill={color} />
    <Circle cx="22" cy="21" r="1.5" fill={color} />
  </Svg>
);

// 3. Golden Temple Gopuram Icon (Temples)
export const GoldenTempleIcon: React.FC<IconProps> = ({ size = 26, color = '#D4932A' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Kalasam Spire */}
    <Path d="M16 2V5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="16" cy="5" r="1.3" fill={color} />
    {/* Tier 1 (Shikhara) */}
    <Path d="M13 8L16 5.5L19 8H13Z" fill={color} />
    <Path d="M12 9H20" stroke="#FFE7A3" strokeWidth="1" />
    {/* Tier 2 */}
    <Path d="M12 9.5L10 14H22L20 9.5H12Z" fill={color} />
    <Path d="M9.5 14.5H22.5" stroke="#FFE7A3" strokeWidth="1.2" />
    {/* Tier 3 */}
    <Path d="M10 15L8 20H24L22 15H10Z" fill={color} />
    <Path d="M7 20.5H25" stroke="#FFE7A3" strokeWidth="1.2" />
    {/* Base Sanctum with Arched Door */}
    <Path d="M8 21H24V29H8V21Z" fill={color} />
    <Path d="M13 29V24C13 22.3 14.3 21 16 21C17.7 21 19 22.3 19 24V29" fill="#FFFFFF" />
    {/* Base Pedestal */}
    <Path d="M5 29H27V31H5V29Z" fill={color} />
  </Svg>
);

// 4. Musical Notes Icon (Slokas / Bhajans)
export const MusicalNotesIcon: React.FC<IconProps> = ({ size = 26, color = '#6F4E37' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Left Note Head */}
    <Circle cx="10" cy="23" r="3.5" fill={color} />
    {/* Right Note Head */}
    <Circle cx="22" cy="19" r="3.5" fill={color} />
    {/* Stems */}
    <Path d="M13.5 23V8" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <Path d="M25.5 19V4" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    {/* Connecting Beam */}
    <Path d="M13.5 8L25.5 4V7.5L13.5 11.5V8Z" fill={color} />
  </Svg>
);

// 5. Hands Holding Heart (Donations)
export const HeartInHandsIcon: React.FC<IconProps> = ({ size = 26, color = '#C98928' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Heart Floating Above Hands */}
    <Path
      d="M16 13C16 13 13 9 10 9C7.5 9 6 11 6 13C6 16.5 11.5 20 16 23C20.5 20 26 16.5 26 13C26 11 24.5 9 22 9C19 9 16 13 16 13Z"
      fill="#E53935"
      opacity={0.9}
    />
    {/* Open Devotional Hand Supporting From Bottom Left */}
    <Path
      d="M6 21C4 21 3 22.5 3 24C3 26 6 27.5 9 27.5C13 27.5 18 26 21 24.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Palm and Fingers */}
    <Path
      d="M8 21L15 23C17 23.5 19 23 20 21.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

// 6. Folded Praying Hands (Namaste / Special Sevas)
export const PrayingHandsIcon: React.FC<IconProps> = ({ size = 26, color = '#C98928' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Left Palm */}
    <Path
      d="M15 5C14.5 4.5 13.5 5 13.5 6L11 16C10.5 18 10 20 8 22L7 23C6 24 6.5 25.5 8 26L14 27V12L15 5Z"
      fill={color}
      opacity={0.88}
    />
    {/* Right Palm */}
    <Path
      d="M17 5C17.5 4.5 18.5 5 18.5 6L21 16C21.5 18 22 20 24 22L25 23C26 24 25.5 25.5 24 26L18 27V12L17 5Z"
      fill={color}
    />
    {/* Gold Cuffs/Bangles */}
    <Rect x="6.5" y="26.5" width="8" height="2.5" rx="1" fill="#F4C75F" />
    <Rect x="17.5" y="26.5" width="8" height="2.5" rx="1" fill="#F4C75F" />
    {/* Center Division line */}
    <Path d="M16 5V27" stroke="#FFE9A0" strokeWidth="1" strokeLinecap="round" />
  </Svg>
);

// 7. Green Crescent Moon (Tithi)
export const GreenCrescentMoonIcon: React.FC<IconProps> = ({ size = 20, color = '#2E7D32' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 13.5C18.8 17.5 14.8 20 10.5 19.5C6.2 19 2.8 15.5 2.5 11.2C2.2 6.9 4.8 3 8.8 1.8C8 3.5 8.2 5.5 9.2 7.2C10.5 9.5 13 10.8 15.8 10.5C17.5 10.3 19.1 9.4 20 8C20.2 9.8 20.2 11.8 20 13.5Z"
      fill={color}
    />
  </Svg>
);

// 8. Green Star (Nakshatram)
export const GreenStarIcon: React.FC<IconProps> = ({ size = 20, color = '#2E7D32' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5 L14.9 8.4 L21.4 9.3 L16.7 13.9 L17.8 20.4 L12 17.3 L6.2 20.4 L7.3 13.9 L2.6 9.3 L9.1 8.4 Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// 9. Golden Clock (Auspicious Time)
export const GoldenClockIcon: React.FC<IconProps> = ({ size = 20, color = '#C98928' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 7 V12 L15.5 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 10. Decorative Subtle Mountain Peaks Silhouette (Top-Right of Today's Panchangam)
export const SubtleMountainPeaksArt: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 42,
}) => (
  <Svg width={width} height={height} viewBox="0 0 90 42" fill="none">
    <Defs>
      <SvgGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#E9CA8D" stopOpacity="0.45" />
        <Stop offset="0.7" stopColor="#F5DFB4" stopOpacity="0.2" />
        <Stop offset="1" stopColor="#FFF8ED" stopOpacity="0.0" />
      </SvgGradient>
    </Defs>
    {/* Background Ridge */}
    <Path d="M15 42 L35 18 L50 28 L72 10 L90 26 V42 H15Z" fill="url(#mountainGrad)" opacity={0.6} />
    {/* Foreground Ridge */}
    <Path d="M0 42 L22 24 L38 32 L58 14 L78 28 L90 20 V42 H0Z" fill="url(#mountainGrad)" />
  </Svg>
);

// 11. Location Map Pin Icon
export const LocationMapPinIcon: React.FC<IconProps> = ({ size = 14, color = '#E69500' }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14.5 8 14.5C8 14.5 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z"
      fill={color}
    />
    <Circle cx="8" cy="6" r="1.8" fill="#FFFFFF" />
  </Svg>
);

// 12. Open Scripture Book Icon (Daily Spiritual Inspiration)
export const ScriptureBookIcon: React.FC<IconProps> = ({ size = 24, color = '#D4932A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6.5C10.5 5 8 4.5 5 4.5C3.5 4.5 2 4.8 2 4.8V18.8C2 18.8 3.5 18.5 5 18.5C8 18.5 10.5 19 12 20.5C13.5 19 16 18.5 19 18.5C20.5 18.5 22 18.8 22 18.8V4.8C22 4.8 20.5 4.5 19 4.5C16 4.5 13.5 5 12 6.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M12 6.5 V20.5" stroke={color} strokeWidth="1.8" />
  </Svg>
);

// 13. Circular Green Play Button (Audio Card)
export const GreenCircularPlayBtn: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <Circle cx="14" cy="14" r="13" fill="#17503B" />
    <Path d="M11.5 9.5 L19 14 L11.5 18.5 Z" fill="#FFFFFF" />
  </Svg>
);

// 14. Circular Green Document Icon (Pooja Guide Card)
export const GreenCircularDocBtn: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <Circle cx="14" cy="14" r="13" fill="#17503B" />
    <Rect x="8.5" y="8" width="11" height="12" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
    <Path d="M11 11 H17 M11 14 H17 M11 17 H15" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
  </Svg>
);

// 15. Steaming Annadanam Food Bowl Icon (Annadanam & Temple Support)
export const SteamingFoodBowlIcon: React.FC<IconProps> = ({ size = 28, color = '#D4932A' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Steaming Wisps */}
    <Path d="M11 6 C10.5 8 11.5 9 11 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M16 4 C15.5 7 16.5 8 16 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M21 6 C20.5 8 21.5 9 21 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    {/* Sacred Bowl */}
    <Path d="M4 14 H28 C28 22 22 25 16 25 C10 25 4 22 4 14 Z" fill={color} />
    {/* Bowl Rim */}
    <Path d="M4 14 H28" stroke="#FFE9A3" strokeWidth="1.5" strokeLinecap="round" />
    {/* Bowl Pedestal */}
    <Path d="M12 25 H20 V27 H12 V25 Z" fill={color} opacity={0.9} />
  </Svg>
);

// 16. Devotional Categories Grid Icon (4 rounded squares)
export const DevotionalCategoriesGridIcon: React.FC<IconProps> = ({ size = 18, color = '#D4932A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill="#FBF5E8" />
    <Rect x="14" y="3.5" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill="#FBF5E8" />
    <Rect x="3.5" y="14" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill="#FBF5E8" />
    <Rect x="14" y="14" width="6.5" height="6.5" rx="2" stroke={color} strokeWidth="1.8" fill="#FBF5E8" />
  </Svg>
);
