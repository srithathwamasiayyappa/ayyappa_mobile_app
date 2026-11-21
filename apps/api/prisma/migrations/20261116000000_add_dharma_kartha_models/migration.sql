-- Migration: 20261116000000_add_dharma_kartha_models
-- Safe, additive-only migration for Dharma Karthas Temple Management System

-- CreateTable temples
CREATE TABLE IF NOT EXISTS `temples` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `alternate_name` VARCHAR(200) NULL,
    `primary_deity` VARCHAR(100) NOT NULL,
    `short_description` VARCHAR(500) NULL,
    `about` TEXT NULL,
    `history` TEXT NULL,
    `speciality` TEXT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'India',
    `state` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NULL,
    `city` VARCHAR(100) NOT NULL,
    `address` VARCHAR(300) NULL,
    `pincode` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `maps_url` VARCHAR(500) NULL,
    `office_phone` VARCHAR(50) NULL,
    `official_email` VARCHAR(150) NULL,
    `official_website` VARCHAR(300) NULL,
    `hero_image_url` VARCHAR(500) NULL,
    `gopuram_image_url` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    `is_verified` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `temples_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable temple_memberships
CREATE TABLE IF NOT EXISTS `temple_memberships` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `temple_id` INTEGER NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'OWNER',
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `approved_by` VARCHAR(100) NULL,
    `approved_at` DATETIME(3) NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `temple_memberships_user_id_temple_id_key`(`user_id`, `temple_id`),
    INDEX `temple_memberships_user_id_idx`(`user_id`),
    INDEX `temple_memberships_temple_id_idx`(`temple_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `temple_memberships_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `app_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `temple_memberships_temple_id_fkey` FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable temple_timings
CREATE TABLE IF NOT EXISTS `temple_timings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `temple_id` INTEGER NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `time_window` VARCHAR(100) NOT NULL,
    `description` VARCHAR(300) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `temple_timings_temple_id_idx`(`temple_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `temple_timings_temple_id_fkey` FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable temple_festivals
CREATE TABLE IF NOT EXISTS `temple_festivals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `temple_id` INTEGER NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `period` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_annual` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `temple_festivals_temple_id_idx`(`temple_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `temple_festivals_temple_id_fkey` FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable temple_events
CREATE TABLE IF NOT EXISTS `temple_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `temple_id` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `time_info` VARCHAR(100) NULL,
    `location` VARCHAR(255) NULL,
    `image_url` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `temple_events_temple_id_idx`(`temple_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `temple_events_temple_id_fkey` FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable temple_media
CREATE TABLE IF NOT EXISTS `temple_media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `temple_id` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'Photo',
    `media_url` VARCHAR(500) NOT NULL,
    `caption` VARCHAR(300) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_approved` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `temple_media_temple_id_idx`(`temple_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `temple_media_temple_id_fkey` FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable temple_update_requests
CREATE TABLE IF NOT EXISTS `temple_update_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `temple_id` INTEGER NOT NULL,
    `requested_by_id` INTEGER NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `proposed_json` TEXT NOT NULL,
    `previous_json` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `review_notes` VARCHAR(500) NULL,
    `reviewed_by` VARCHAR(100) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `temple_update_requests_temple_id_idx`(`temple_id`),
    INDEX `temple_update_requests_requested_by_id_idx`(`requested_by_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `temple_update_requests_temple_id_fkey` FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `temple_update_requests_requested_by_id_fkey` FOREIGN KEY (`requested_by_id`) REFERENCES `app_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable owner_notifications
CREATE TABLE IF NOT EXISTS `owner_notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'INFO',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `link_url` VARCHAR(300) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `owner_notifications_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `owner_notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `app_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
