-- =============================================================================
-- SARANAM AYYAPPA - MASTER DATA SEED SCRIPT FOR PHPMYADMIN
-- Covers: Languages, Rashis, Nakshatras, Deities, States, and Districts
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. VERIFICATION / CHECK QUERIES (Run these first in phpMyAdmin SQL tab to check counts)
-- -----------------------------------------------------------------------------
SELECT 'languages' AS table_name, COUNT(*) AS total_rows FROM `languages`
UNION ALL
SELECT 'rashis', COUNT(*) FROM `rashis`
UNION ALL
SELECT 'rashi_translations', COUNT(*) FROM `rashi_translations`
UNION ALL
SELECT 'nakshatras', COUNT(*) FROM `nakshatras`
UNION ALL
SELECT 'nakshatra_translations', COUNT(*) FROM `nakshatra_translations`
UNION ALL
SELECT 'deities', COUNT(*) FROM `deities`;


-- -----------------------------------------------------------------------------
-- 2. SEED: LANGUAGES (Telugu, Kannada, English, Tamil, Hindi)
-- -----------------------------------------------------------------------------
INSERT INTO `languages` (`id`, `code`, `name`, `created_at`, `updated_at`) VALUES
(1, 'te', 'Telugu', NOW(), NOW()),
(2, 'kn', 'Kannada', NOW(), NOW()),
(3, 'en', 'English', NOW(), NOW()),
(4, 'ta', 'Tamil', NOW(), NOW()),
(5, 'hi', 'Hindi', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);


-- -----------------------------------------------------------------------------
-- 3. SEED: 12 VEDIC RASHIS
-- -----------------------------------------------------------------------------
INSERT INTO `rashis` (`id`, `code`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'MESHA', 1, 1, NOW()),
(2, 'VRISHABHA', 2, 1, NOW()),
(3, 'MITHUNA', 3, 1, NOW()),
(4, 'KARKATAKA', 4, 1, NOW()),
(5, 'SIMHA', 5, 1, NOW()),
(6, 'KANYA', 6, 1, NOW()),
(7, 'TULA', 7, 1, NOW()),
(8, 'VRISCHIKA', 8, 1, NOW()),
(9, 'DHANUS', 9, 1, NOW()),
(10, 'MAKARA', 10, 1, NOW()),
(11, 'KUMBHA', 11, 1, NOW()),
(12, 'MEENA', 12, 1, NOW())
ON DUPLICATE KEY UPDATE `sort_order`=VALUES(`sort_order`), `is_active`=1;

-- 3b. RASHI TRANSLATIONS (All 5 Languages)
INSERT INTO `rashi_translations` (`rashi_id`, `language_id`, `name`) VALUES
-- 1. Mesha
(1, 1, 'మేషం (Mesha)'), (1, 2, 'ಮೇಷ (Mesha)'), (1, 3, 'Mesha (Aries)'), (1, 4, 'மேஷம் (Mesha)'), (1, 5, 'मेष (Aries)'),
-- 2. Vrishabha
(2, 1, 'వృషభం (Vrishabha)'), (2, 2, 'ವೃಷಭ (Vrishabha)'), (2, 3, 'Vrishabha (Taurus)'), (2, 4, 'ரிஷபம் (Rishabha)'), (2, 5, 'वृषभ (Taurus)'),
-- 3. Mithuna
(3, 1, 'మిథునం (Mithuna)'), (3, 2, 'ಮಿಥುನ (Mithuna)'), (3, 3, 'Mithuna (Gemini)'), (3, 4, 'மிதுனம் (Mithunam)'), (3, 5, 'मिथुन (Gemini)'),
-- 4. Karkataka
(4, 1, 'కర్కాటకం (Karkataka)'), (4, 2, 'ಕರ್ಕಾಟಕ (Karkataka)'), (4, 3, 'Karkataka (Cancer)'), (4, 4, 'கடகம் (Kadagam)'), (4, 5, 'कर्क (Cancer)'),
-- 5. Simha
(5, 1, 'సింహం (Simha)'), (5, 2, 'ಸಿಂಹ (Simha)'), (5, 3, 'Simha (Leo)'), (5, 4, 'சிம்மம் (Simmam)'), (5, 5, 'सिंह (Leo)'),
-- 6. Kanya
(6, 1, 'కన్య (Kanya)'), (6, 2, 'ಕನ್ಯಾ (Kanya)'), (6, 3, 'Kanya (Virgo)'), (6, 4, 'கன்னி (Kanni)'), (6, 5, 'कन्या (Virgo)'),
-- 7. Tula
(7, 1, 'తుల (Tula)'), (7, 2, 'ತುಲಾ (Tula)'), (7, 3, 'Tula (Libra)'), (7, 4, 'துலாம் (Thulam)'), (7, 5, 'तुला (Libra)'),
-- 8. Vrischika
(8, 1, 'వృశ్చికం (Vrischika)'), (8, 2, 'ವೃಶ್ಚಿಕ (Vrischika)'), (8, 3, 'Vrischika (Scorpio)'), (8, 4, 'விருச்சிகம் (Viruchigam)'), (8, 5, 'वृश्चिक (Scorpio)'),
-- 9. Dhanus
(9, 1, 'ధనుస్సు (Dhanus)'), (9, 2, 'ಧನುಸ್ಸು (Dhanus)'), (9, 3, 'Dhanus (Sagittarius)'), (9, 4, 'தனுசு (Thanusu)'), (9, 5, 'धनु (Sagittarius)'),
-- 10. Makara
(10, 1, 'మకరం (Makara)'), (10, 2, 'ಮಕರ (Makara)'), (10, 3, 'Makara (Capricorn)'), (10, 4, 'மகரம் (Magaram)'), (10, 5, 'मकर (Capricorn)'),
-- 11. Kumbha
(11, 1, 'కుంభం (Kumbha)'), (11, 2, 'ಕುಂಭ (Kumbha)'), (11, 3, 'Kumbha (Aquarius)'), (11, 4, 'கும்பம் (Kumbam)'), (11, 5, 'कुंभ (Aquarius)'),
-- 12. Meena
(12, 1, 'మీనం (Meena)'), (12, 2, 'ಮೀನ (Meena)'), (12, 3, 'Meena (Pisces)'), (12, 4, 'மீனம் (Meenam)'), (12, 5, 'मीन (Pisces)')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);


-- -----------------------------------------------------------------------------
-- 4. SEED: 27 VEDIC NAKSHATRAS
-- -----------------------------------------------------------------------------
INSERT INTO `nakshatras` (`id`, `code`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'ASHWINI', 1, 1, NOW()),
(2, 'BHARANI', 2, 1, NOW()),
(3, 'KRITTIKA', 3, 1, NOW()),
(4, 'ROHINI', 4, 1, NOW()),
(5, 'MRIGASHIRA', 5, 1, NOW()),
(6, 'ARDRA', 6, 1, NOW()),
(7, 'PUNARVASU', 7, 1, NOW()),
(8, 'PUSHYA', 8, 1, NOW()),
(9, 'ASHLESHA', 9, 1, NOW()),
(10, 'MAGHA', 10, 1, NOW()),
(11, 'PURVA_PHALGUNI', 11, 1, NOW()),
(12, 'UTTARA_PHALGUNI', 12, 1, NOW()),
(13, 'HASTA', 13, 1, NOW()),
(14, 'CHITRA', 14, 1, NOW()),
(15, 'SWATI', 15, 1, NOW()),
(16, 'VISHAKHA', 16, 1, NOW()),
(17, 'ANURADHA', 17, 1, NOW()),
(18, 'JYESHTHA', 18, 1, NOW()),
(19, 'MULA', 19, 1, NOW()),
(20, 'PURVA_ASHADHA', 20, 1, NOW()),
(21, 'UTTARA_ASHADHA', 21, 1, NOW()),
(22, 'SHRAVANA', 22, 1, NOW()),
(23, 'DHANISHTHA', 23, 1, NOW()),
(24, 'SHATABHISHA', 24, 1, NOW()),
(25, 'PURVA_BHADRAPADA', 25, 1, NOW()),
(26, 'UTTARA_BHADRAPADA', 26, 1, NOW()),
(27, 'REVATI', 27, 1, NOW())
ON DUPLICATE KEY UPDATE `sort_order`=VALUES(`sort_order`), `is_active`=1;

-- 4b. NAKSHATRA TRANSLATIONS (Telugu & English)
INSERT INTO `nakshatra_translations` (`nakshatra_id`, `language_id`, `name`) VALUES
(1, 1, 'అశ్విని (Ashwini)'), (1, 3, 'Ashwini'),
(2, 1, 'భరణి (Bharani)'), (2, 3, 'Bharani'),
(3, 1, 'కృత్తిక (Krittika)'), (3, 3, 'Krittika'),
(4, 1, 'రోహిణి (Rohini)'), (4, 3, 'Rohini'),
(5, 1, 'మృగశిర (Mrigashira)'), (5, 3, 'Mrigashira'),
(6, 1, 'ఆర్ద్ర (Ardra)'), (6, 3, 'Ardra'),
(7, 1, 'పునర్వసు (Punarvasu)'), (7, 3, 'Punarvasu'),
(8, 1, 'పుష్యమి (Pushya)'), (8, 3, 'Pushya'),
(9, 1, 'ఆశ్లేష (Ashlesha)'), (9, 3, 'Ashlesha'),
(10, 1, 'మఖ (Magha)'), (10, 3, 'Magha'),
(11, 1, 'పూర్వఫల్గుణి / పుబ్బ (Purva Phalguni)'), (11, 3, 'Purva Phalguni'),
(12, 1, 'ఉత్తరఫల్గుణి / ఉత్తర (Uttara Phalguni)'), (12, 3, 'Uttara Phalguni'),
(13, 1, 'హస్త (Hasta)'), (13, 3, 'Hasta'),
(14, 1, 'చిత్త (Chitra)'), (14, 3, 'Chitra'),
(15, 1, 'స్వాతి (Swati)'), (15, 3, 'Swati'),
(16, 1, 'విశాఖ (Vishakha)'), (16, 3, 'Vishakha'),
(17, 1, 'అనూరాధ (Anuradha)'), (17, 3, 'Anuradha'),
(18, 1, 'జ్యేష్ఠ (Jyeshtha)'), (18, 3, 'Jyeshtha'),
(19, 1, 'మూల (Mula)'), (19, 3, 'Mula'),
(20, 1, 'పూర్వాషాఢ (Purva Ashadha)'), (20, 3, 'Purva Ashadha'),
(21, 1, 'ఉత్తరాషాఢ (Uttara Ashadha)'), (21, 3, 'Uttara Ashadha'),
(22, 1, 'శ్రవణం (Shravana)'), (22, 3, 'Shravana'),
(23, 1, 'ధనిష్ఠ (Dhanishtha)'), (23, 3, 'Dhanishtha'),
(24, 1, 'శతభిషం (Shatabhisha)'), (24, 3, 'Shatabhisha'),
(25, 1, 'పూర్వాభాద్ర (Purva Bhadrapada)'), (25, 3, 'Purva Bhadrapada'),
(26, 1, 'ఉత్తరాభాద్ర (Uttara Bhadrapada)'), (26, 3, 'Uttara Bhadrapada'),
(27, 1, 'రేవతి (Revati)'), (27, 3, 'Revati')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);


-- -----------------------------------------------------------------------------
-- 5. SEED: DEITIES (Lord Ayyappa, Ganesha, Murugan, Shiva, Vishnu, Goddess Devi)
-- -----------------------------------------------------------------------------
INSERT INTO `deities` (`slug`, `name`, `telugu_name`, `tamil_name`, `kannada_name`, `hindi_name`, `description`, `category`, `image_url`, `image_name`, `aliases`, `is_featured`, `order_index`, `is_active`, `created_at`, `updated_at`) VALUES
('ayyappa', 'Lord Ayyappa', 'అయ్యప్ప స్వామి', 'ஐயப்பன்', 'ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ', 'अय्यप्पा स्वामी', 'Lord Ayyappa, the presiding deity of Sabarimala, worshipped by millions of devotees embarking on sacred 41-day Mandala Vratham.', 'popular', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_ayyappa.png', 'lord_ayyappa.png', 'ayyappa, manikanta, shabarimala, shasta, swamy, hariharasuta', 1, 1, 1, NOW(), NOW()),
('ganesha', 'Lord Ganesha', 'గణపతి / వినాయక', 'விநாயகர்', 'ಗಣೇಶ', 'गणेश भगवान', 'Lord Ganesha, the remover of all obstacles (Vighnaharta) and embodiment of wisdom, worshipped first before beginning all sacred tasks.', 'popular', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_ganesha.png', 'lord_ganesha.png', 'ganesh, ganapathi, vinayaka, vighneshwara, pillayar, lambodara', 1, 2, 1, NOW(), NOW()),
('murugan', 'Lord Murugan', 'మురుగన్ / సుబ్రహ్మణ్య', 'முருகன்', 'ಮುರುಗನ್', 'मुरुगन / कार्तिकेय', 'Lord Murugan, commander of the divine army and embodiment of courage, power, and youthful wisdom.', 'popular', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_murugan.png', 'lord_murugan.png', 'muruga, subrahmanya, kartikeya, skanda, velan, kumara', 1, 3, 1, NOW(), NOW()),
('shiva', 'Lord Shiva', 'పరమ శివుడు', 'சிவன்', 'ಶಿವ', 'शिव शंकर', 'Lord Shiva, Mahadeva, the supreme ascetic and supreme transformer who protects devotees and bestows inner peace.', 'shiva', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_shiva.png', 'lord_shiva.png', 'shiva, mahadev, shankara, bholenath, ishwara, rudra, nataraja', 1, 4, 1, NOW(), NOW()),
('vishnu', 'Lord Vishnu', 'మహా విష్ణువు', 'விஷ்ணு', 'ಮಹಾ ವಿಷ್ಣು', 'भगवान विष्णु', 'Lord Vishnu, the preserver and sustainer of the universe, residing in Vaikuntha and protecting righteousness (Dharma).', 'vishnu', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_vishnu.png', 'lord_vishnu.png', 'vishnu, narayana, hari, perumal, govinda, jagannath', 1, 5, 1, NOW(), NOW()),
('devi', 'Goddess Devi', 'దేవి / అమ్మవారు', 'அம்மன் / தேவி', 'ದೇವಿ', 'देवी मां', 'Supreme Mother Goddess, embodiment of primordial divine cosmic energy (Adi Parashakti) and maternal compassion.', 'devi', 'https://backendapis.saranamayyappa.in/uploads/deities/goddess_devi.png', 'goddess_devi.png', 'devi, amman, shakti, mata, parvati, goddess, amba', 1, 6, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `telugu_name`=VALUES(`telugu_name`), `is_active`=1;


-- -----------------------------------------------------------------------------
-- 6. SEED: STATES & DISTRICTS TABLE & DATA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `states` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(10) UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `districts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `state_name` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  INDEX (`state_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6a. Insert States
INSERT INTO `states` (`id`, `code`, `name`, `is_active`) VALUES
(1, 'AP', 'Andhra Pradesh', 1),
(2, 'TS', 'Telangana', 1),
(3, 'KL', 'Kerala', 1),
(4, 'TN', 'Tamil Nadu', 1),
(5, 'KA', 'Karnataka', 1),
(6, 'MH', 'Maharashtra', 1),
(7, 'GJ', 'Gujarat', 1),
(8, 'OD', 'Odisha', 1),
(9, 'DL', 'Delhi', 1),
(10, 'UP', 'Uttar Pradesh', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 6b. Insert Districts
INSERT INTO `districts` (`state_name`, `name`, `is_active`) VALUES
-- Andhra Pradesh
('Andhra Pradesh', 'Visakhapatnam', 1),
('Andhra Pradesh', 'Vijayawada (NTR)', 1),
('Andhra Pradesh', 'Guntur', 1),
('Andhra Pradesh', 'Tirupati', 1),
('Andhra Pradesh', 'Kurnool', 1),
('Andhra Pradesh', 'Nellore', 1),
('Andhra Pradesh', 'Kakinada', 1),
('Andhra Pradesh', 'Rajahmundry', 1),
('Andhra Pradesh', 'Anantapur', 1),
('Andhra Pradesh', 'Kadapa', 1),
('Andhra Pradesh', 'Eluru', 1),
('Andhra Pradesh', 'Ongole', 1),
('Andhra Pradesh', 'Srikakulam', 1),
('Andhra Pradesh', 'Vizianagaram', 1),

-- Telangana
('Telangana', 'Hyderabad', 1),
('Telangana', 'Warangal', 1),
('Telangana', 'Karimnagar', 1),
('Telangana', 'Nizamabad', 1),
('Telangana', 'Khammam', 1),
('Telangana', 'Nalgonda', 1),
('Telangana', 'Mahabubnagar', 1),
('Telangana', 'Rangareddy', 1),
('Telangana', 'Medak', 1),
('Telangana', 'Adilabad', 1),
('Telangana', 'Siddipet', 1),
('Telangana', 'Suryapet', 1),

-- Kerala
('Kerala', 'Pathanamthitta', 1),
('Kerala', 'Thiruvananthapuram', 1),
('Kerala', 'Kollam', 1),
('Kerala', 'Alappuzha', 1),
('Kerala', 'Kottayam', 1),
('Kerala', 'Idukki', 1),
('Kerala', 'Ernakulam', 1),
('Kerala', 'Thrissur', 1),
('Kerala', 'Palakkad', 1),
('Kerala', 'Malappuram', 1),
('Kerala', 'Kozhikode', 1),

-- Tamil Nadu
('Tamil Nadu', 'Chennai', 1),
('Tamil Nadu', 'Madurai', 1),
('Tamil Nadu', 'Coimbatore', 1),
('Tamil Nadu', 'Tiruchirappalli', 1),
('Tamil Nadu', 'Salem', 1),
('Tamil Nadu', 'Tirunelveli', 1),
('Tamil Nadu', 'Kanchipuram', 1),
('Tamil Nadu', 'Thanjavur', 1),
('Tamil Nadu', 'Vellore', 1),

-- Karnataka
('Karnataka', 'Bengaluru Urban', 1),
('Karnataka', 'Mysuru', 1),
('Karnataka', 'Mangaluru (Dakshina Kannada)', 1),
('Karnataka', 'Hubballi-Dharwad', 1),
('Karnataka', 'Belagavi', 1),
('Karnataka', 'Udupi', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
