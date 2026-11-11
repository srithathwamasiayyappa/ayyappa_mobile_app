# Ayyappa Aradhana – Frontend Architecture & Screen Specification

## 1. Overview
The frontend is a single React Native application built with **Expo + TypeScript**, targeting both **Android and iOS**.

## 2. Visual Theme & Design Tokens
Based on the approved devotional aesthetics:
- **Primary / Header**: Deep Temple Orange (`#D84315` to `#EF6C00`) with gold border accents (`#FFD54F`).
- **Background**: Warm textured sacred yellow/gold gradient (`#FFF8E1` -> `#FFE082`).
- **Typography**:
  - Headings: Serif traditional font style with devotional Telugu / Kannada unicode support.
  - Body: Legible sans-serif with proper line height for Telugu & Kannada scripts.
- **Iconography**: Circular sacred medallions with double golden borders (`#FFB300`), subtle drop-shadows, and devotional iconography.

---

## 3. Screen Specifications

### Screen 1: Language Selection (`LanguageScreen`)
- **Header**: Sacred decorative header with Ayyappa Namam / Om symbol and app title in glowing gold.
- **Center Piece**: Circular medallion depicting Lord Ayyappa Swamy.
- **Language Options**:
  1. **తెలుగు (Telugu)**
  2. **ಕನ್ನಡ (Kannada)**
  3. **English**
- **Action**: Selection saves active language in persistent state (Zustand) and transitions smoothly to the Home Screen.

### Screen 2: Home Screen (`HomeScreen`)
- **Devotional Top Bar**:
  - Circular Ayyappa Swamy avatar on the left.
  - Title: "Ayyappa Aradhana" with devotional subtitle / Sharanu Ghosha.
  - Language switch icon button on the top right.
- **Continuous Scrolling Ticker / Mahamantra**:
  - "స్వామియే శరణం అయ్యప్ప • ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ • Swamiye Saranam Ayyappa"
- **Daily Calendar & Panchangam Card**:
  - Current Gregorian date (e.g. Saturday, 07 November 2026).
  - Tithi, Nakshatram, Rahu Kalam, Yamagandam, Gulika Kalam.
  - 2026 Festival alert / countdown banner.
- **Sacred Devotional Categories Grid**:
  1. *Subhaprabhatham* (సుప్రభాతం / ಸುಪ್ರಭಾತ)
  2. *Nitya Parayana Slokamulu* (నిత్య పారాయణ శ్లోకములు)
  3. *Pujalu & Vratalu* (పూజలు & వ్రతాలు)
  4. *Mala Dharana Mantram* (మాలాధారణ మంత్రం)
  5. *Ayyappa Sharanu Ghosha* (అయ్యప్ప శరణు ఘోష)
  6. *Nitya Pooja Vidhanam* (నిత్య పూజా విధానం)
  7. *Stotramulu* (స్తోత్రములు)
  8. *Pooja Paddhatulu & 18 Steps* (18 మెట్లు & పూజా పద్ధతులు)
- **Persistent Bottom Devotional Audio Player**:
  - Track title & Singer name.
  - Play / Pause / Next / Duration bar.
  - Saranam ghosha audio ambient track.

