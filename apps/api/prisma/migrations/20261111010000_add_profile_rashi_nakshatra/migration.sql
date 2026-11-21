-- Migration: Add Profile Attributes, Rashis & Nakshatras Master Tables
-- Author: Saranam Ayyappa Engineering Team
-- Date: 2026-11-11

-- 1. Additive attributes on app_users
ALTER TABLE `app_users`
  ADD COLUMN IF NOT EXISTS `date_of_birth` DATE NULL,
  ADD COLUMN IF NOT EXISTS `gender` VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS `rashi_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `nakshatra_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `profile_image_url` VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS `address_line` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `state` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `district` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `city` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `pincode` VARCHAR(10) NULL,
  ADD COLUMN IF NOT EXISTS `devotional_updates_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS `profile_completed_at` DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS `profile_onboarding_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- 2. Create Rashis Table
CREATE TABLE IF NOT EXISTS `rashis` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `rashis_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Create Rashi Translations Table
CREATE TABLE IF NOT EXISTS `rashi_translations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rashi_id` INT NOT NULL,
  `language_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rashi_translations_rashi_id_language_id_key` (`rashi_id`, `language_id`),
  CONSTRAINT `rashi_translations_rashi_id_fkey` FOREIGN KEY (`rashi_id`) REFERENCES `rashis` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rashi_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Create Nakshatras Table
CREATE TABLE IF NOT EXISTS `nakshatras` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nakshatras_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Create Nakshatra Translations Table
CREATE TABLE IF NOT EXISTS `nakshatra_translations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nakshatra_id` INT NOT NULL,
  `language_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nakshatra_translations_nakshatra_id_language_id_key` (`nakshatra_id`, `language_id`),
  CONSTRAINT `nakshatra_translations_nakshatra_id_fkey` FOREIGN KEY (`nakshatra_id`) REFERENCES `nakshatras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nakshatra_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Non-Destructive Recovery / Rollback Plan:
-- 1. Backup: mysqldump -u <user> -p ayyappa_aradhana app_users rashis nakshatras > backup_profile_master_$(date +%Y%m%d).sql
-- 2. Soft rollback: UPDATE app_users SET profile_onboarding_status = 'SKIPPED' WHERE profile_onboarding_status = 'PENDING';

