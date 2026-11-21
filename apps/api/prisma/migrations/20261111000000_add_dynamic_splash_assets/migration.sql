-- Migration: Add Dynamic Splash Screen Assets Table
-- Author: Saranam Ayyappa Engineering Team
-- Date: 2026-11-11

CREATE TABLE IF NOT EXISTS `splash_assets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `storage_key` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT NULL,
  `image_width` INT NULL,
  `image_height` INT NULL,
  `aspect_ratio` VARCHAR(20) NULL,
  `platform` VARCHAR(20) NOT NULL DEFAULT 'ALL',
  `status` VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  `scheduled_start` DATETIME(3) NULL,
  `scheduled_end` DATETIME(3) NULL,
  `version` INT NOT NULL DEFAULT 1,
  `created_by` VARCHAR(100) NULL,
  `updated_by` VARCHAR(100) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `archived_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `splash_assets_status_idx` (`status`),
  INDEX `splash_assets_platform_idx` (`platform`),
  INDEX `splash_assets_scheduled_start_scheduled_end_idx` (`scheduled_start`, `scheduled_end`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Production Rollback & Recovery Plan (Non-Destructive):
-- CAUTION: NEVER execute 'DROP TABLE splash_assets' in production, as this permanently destroys 
-- historical audit records, published devotional image pointers, and scheduled campaigns.
--
-- Tested Recovery Procedures:
-- 1. Pre-Deployment Snapshot Backup:
--    mysqldump -u <db_user> -p ayyappa_aradhana splash_assets > backup_splash_assets_$(date +%Y%m%d_%H%M%S).sql
--
-- 2. Schema Reversal / Rollback Procedure:
--    If dynamic splash capabilities must be deactivated without data loss:
--    a. Mark active records to ARCHIVED rather than deleting tables:
--       UPDATE splash_assets SET status = 'ARCHIVED', archived_at = NOW(3) WHERE status = 'PUBLISHED';
--    b. If emergency table rename is required for zero-data-loss rollback:
--       RENAME TABLE splash_assets TO splash_assets_archived_20261111;
--    c. To restore from pre-deployment snapshot:
--       mysql -u <db_user> -p ayyappa_aradhana < backup_splash_assets_<timestamp>.sql


