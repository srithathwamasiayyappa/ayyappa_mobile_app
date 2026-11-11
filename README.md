# Ayyappa Aradhana – Devotional Mobile Application

A unified **React Native (Expo + TypeScript)** application for Android and iOS providing daily Panchangam, devotional audio, slokas, and stotrams for Lord Ayyappa Swamy.

## Screenshots Reference
- [Language Selection](apps/mobile/src/assets/images/ref_language_screen.jpg)
- [Home Screen](apps/mobile/src/assets/images/ref_home_screen.jpg)

## Monorepo Structure
```text
AYYAPPA-ARADHANA/
├── apps/
│   └── mobile/                # Expo React Native App (Android & iOS)
│       ├── src/
│       │   ├── assets/        # Original devotional imagery & references
│       │   ├── components/    # Reusable Headers, Medallions, Cards
│       │   ├── features/      # Language selection & Home screens
│       │   ├── theme/         # Exact devotional color tokens
│       │   └── types/         # TypeScript definitions
│       ├── App.tsx            # Main app container & screen switcher
│       ├── app.json           # Expo project config
│       └── package.json
├── docs/                      # Architectural & Design specifications
├── package.json               # Root monorepo configuration
└── pnpm-workspace.yaml        # Workspace configuration
```

## Running the Mobile App
From the root directory:
```bash
# Start the Expo development server
pnpm --filter ayyappa-aradhana-mobile start
```
You can press:
- `a` to open on an Android emulator or device
- `i` to open on an iOS simulator
- `w` to preview on Web

