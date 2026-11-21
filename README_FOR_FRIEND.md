# 🙏 Saranam Ayyappa — Complete Project Guide

Welcome! This archive contains the complete full-stack source code, mobile app, and database for the **Saranam Ayyappa Devotional Platform**.

---

## 📦 What's Inside This Package

This package is organized into four core components:

```
├── apps/
│   ├── mobile/                  # 1. Mobile App (React Native / Expo - Android & iOS)
│   ├── api/                     # 2. Backend API (NestJS + Prisma ORM + MariaDB/MySQL)
│   └── admin-panel/             # 3. Super Admin Panel (Next.js 14 + Tailwind CSS)
│
├── database/                    # 4. Database Dump & Schemas
│   ├── ayyappa_aradhana_dump.sql      # Full database dump with all tables & seeded data
│   ├── ayyappa_aradhana_cpanel.sql    # Optimized SQL dump for cPanel / phpMyAdmin
│   ├── schema.prisma                  # Prisma ORM schema definitions
│   └── DATABASE_IMPORT_GUIDE.md       # Step-by-step SQL import instructions
│
├── ayyappa_aradhana_dump.sql    # Database dump also available at the root level
├── README_FOR_FRIEND.md         # This setup and quickstart guide
└── package.json                 # Monorepo root workspace configuration
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: v18.x or v20.x (LTS recommended)
- **Package Manager**: `npm` or `pnpm` (install pnpm: `npm install -g pnpm`)
- **Database**: MySQL 8.0+ or MariaDB 10.4+
- **Mobile Development**:
  - Expo Go app on your physical mobile phone (iOS / Android) **OR**
  - Android Studio emulator / Xcode simulator

---

## 🚀 Quick Setup Instructions

### 1️⃣ Database Setup (First Step)

1. Open your MySQL client, command line, or phpMyAdmin.
2. Create a new database named `ayyappa_aradhana`:
   ```sql
   CREATE DATABASE ayyappa_aradhana CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import the database dump file (`ayyappa_aradhana_dump.sql`):
   - **Command Line**:
     ```bash
     mysql -u root -p ayyappa_aradhana < ayyappa_aradhana_dump.sql
     ```
   - **phpMyAdmin**:
     - Select `ayyappa_aradhana` database -> Click **Import** tab -> Choose `ayyappa_aradhana_dump.sql` -> Click **Go**.

---

### 2️⃣ Backend API Setup (`apps/api`)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd apps/api
   ```
2. Install dependencies:
   ```bash
   pnpm install
   # or: npm install
   ```
3. Configure your database connection in `apps/api/.env`:
   ```env
   PORT=3000
   DATABASE_URL="mysql://root:your_password@localhost:3306/ayyappa_aradhana"
   JWT_SECRET="ayyappa_super_secret_jwt_key_2026"
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Start the backend in development mode:
   ```bash
   npm run start:dev
   ```
   *The backend will be running at: `http://localhost:3000`*
   *API documentation / endpoints are available at: `http://localhost:3000/api`*

---

### 3️⃣ Admin Panel Setup (`apps/admin-panel`)

1. Open a new terminal and navigate to the admin panel folder:
   ```bash
   cd apps/admin-panel
   ```
2. Install dependencies:
   ```bash
   pnpm install
   # or: npm install
   ```
3. Ensure `.env.local` points to your backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
4. Start the admin panel development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   👉 **`http://localhost:3001`** (or `http://localhost:3000` if port 3000 is free)

#### 🔑 Default Super Admin Login Credentials:
- **Email**: `admin@ayyappa.org`
- **Password**: `SuperAdmin@2026`

#### 📋 Admin Panel Menu Structure:
1. **Dashboard**: High-level platform statistics and metrics.
2. **Website/App CMS**: Manage About App, Terms & Conditions, Privacy Policy, Sabarimala Guidelines.
3. **User Management**:
   - Devotees (Registered users with status, deletion request badges, and actions)
   - Dharma Karthas (Temple priests and trustees)
   - Soft-Deleted Users (Dedicated page for viewing and restoring soft-deleted accounts)
4. **Categories**: Manage Temples, Poojas, and Events.
5. **Spiritual Management Vidhanam**: Manage Gods/Goddesses, Slokas & Ashtothrams, Stotras.
6. **Spiritual Music**: Manage Bhajans, Slogans, Aarti Songs.

---

### 4️⃣ Mobile App Setup (`apps/mobile`)

1. Open a new terminal and navigate to the mobile folder:
   ```bash
   cd apps/mobile
   ```
2. Install dependencies:
   ```bash
   pnpm install
   # or: npm install
   ```
3. Set your backend IP in `.env` or `src/config/api.ts` (use your computer's local LAN IP like `192.168.x.x` so physical phones can reach the backend):
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api
   ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Scan the QR code with:
   - **Android**: Expo Go app camera scanner
   - **iOS**: Camera app -> open in Expo Go

---

## 🌟 Key Application Features Included

- **Multilingual Devotional Support**: Telugu, Tamil, Malayalam, Kannada, Hindi, English.
- **Account Management & Security**:
  - Edit Profile with Vedic Rashi, Nakshatram, and contact details.
  - Delete Account flow with 6-digit Mobile OTP verification.
  - Soft-delete & permanent delete support with admin recovery.
- **Content Management System (CMS)**:
  - Dynamic About App screen driven by admin CMS.
  - Dynamic Terms & Conditions and Privacy Policy.
- **Spiritual Content**:
  - Pooja Vidhanam, Daily Panchangam, Temple Directory, Bhajans, Slokas, and Aarti Songs.

---

*Swamiye Saranam Ayyappa!* 🙏

