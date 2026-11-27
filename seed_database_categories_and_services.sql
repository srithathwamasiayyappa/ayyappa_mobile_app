-- =========================================================================
-- SARANAM AYYAPPA - AUTHENTIC DATABASE SEED SCRIPT FOR MySQL / MariaDB
-- Target Database: thathwamasi_saranamayyappa (cPanel phpMyAdmin)
-- Strictly NO fake/mock data - Populates real database records for:
-- 1. Devotional Services Directory (9 Sanctum Services)
-- 2. Core Devotional Languages (Telugu, English, Kannada)
-- 3. Sacred Content Categories & Translations
-- =========================================================================

-- 1. DEVOTIONAL SERVICES (Saved into app_settings table)
INSERT INTO `app_settings` (`key`, `value`, `description`, `created_at`, `updated_at`)
VALUES (
  'category_services',
  '[{"id":"pooja","serviceId":"pooja","title":"Pooja Vidhanam","sub":"Step-by-step sacred rituals","icon":"Flame","url":"/subcategories","artwork":"/images/categories/art-pooja-trans.png","displayOrder":1,"isActive":true},{"id":"stotras","serviceId":"stotras","title":"Divine Stotras","sub":"Sacred Hymns & Chants","icon":"BookOpen","url":"/stotras","artwork":"/images/categories/art-stotras-trans.png","displayOrder":2,"isActive":true},{"id":"slokas","serviceId":"slokas","title":"Daily Slokas","sub":"Verses for Meditation","icon":"Scroll","url":"/slokas","artwork":"/images/categories/art-slokas-trans.png","displayOrder":3,"isActive":true},{"id":"songs","serviceId":"songs","title":"Bhajans & Songs","sub":"Devotional Melodies","icon":"Music","url":"/songs","artwork":"/images/categories/art-bhajans-trans.png","displayOrder":4,"isActive":true},{"id":"live-streams","serviceId":"live-streams","title":"Live Darshan","sub":"Daily Temple Streams","icon":"Tv","url":"/live-streams","artwork":"/images/categories/art-live-trans.png","displayOrder":5,"isActive":true},{"id":"panchangam","serviceId":"panchangam","title":"Panchangam","sub":"Auspicious Timings","icon":"Calendar","url":"/panchangam","artwork":"/images/categories/art-panchangam-trans.png","displayOrder":6,"isActive":true},{"id":"festivals","serviceId":"festivals","title":"Temple Festivals","sub":"Annual Celebrations","icon":"Sparkles","url":"/festivals","artwork":"/images/categories/art-stotras-trans.png","displayOrder":7,"isActive":true},{"id":"temples","serviceId":"temples","title":"Sacred Temples","sub":"Shrines & Pilgrimages","icon":"Landmark","url":"/temples","artwork":"/images/categories/art-temples-trans.png","displayOrder":8,"isActive":true},{"id":"donations","serviceId":"donations","title":"Annadanam Seva","sub":"Meal Offering & Seva","icon":"HeartHandshake","url":"/donations","artwork":"/images/categories/art-donations-trans.png","displayOrder":9,"isActive":true}]',
  'Devotional Services Directory',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE 
  `value` = VALUES(`value`), 
  `description` = VALUES(`description`), 
  `updated_at` = NOW();

-- 2. SACRED DEVOTIONAL LANGUAGES
INSERT INTO `languages` (`id`, `code`, `name`) VALUES
  (1, 'te', 'Telugu'),
  (2, 'en', 'English'),
  (3, 'kn', 'Kannada')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. PARENT CONTENT CATEGORY: Sri Ayyappa Ashtottara / Padi Pooja
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES
  (8, 'sri-ayyappa-ashtottara', 8, 0, 0, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE `slug` = VALUES(`slug`), `updated_at` = NOW();

-- Parent Translations (te, en)
INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (8, 1, 'శ్రీ ధర్మశాస్తా అష్టోత్తరశత నామావళి', 'శ్రీ అయ్యప్పస్వామి దివ్య పూజా విధానం మరియు స్తోత్రములు', NOW(), NOW()),
  (8, 2, 'Sri Ayyappa Ashtottara Pooja', 'Lord Sri Ayyappa sacred pooja rituals and divine hymns', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 4. THE 9 SACRED AYYAPPA SUBCATEGORIES UNDER PARENT ID 8
-- 1. Sri Ayyappa Pooja
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (61, 'sri-ayyappa-pooja', 1, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 1, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (61, 1, 'శ్రీ అయ్యప్ప పూజ', '[ శ్రీ ధర్మశాస్తా అయ్యప్పస్వామి పూజా విధానము ]\n\nధ్యానం:\nధ్యాయేత్ కోటీందుశంకాశం శాస్తారం దేవమవ్యయమ్ |\nపూర్ణపుష్కలాసంయుక్తం రత్నాభరణభూషితమ్ ||', NOW(), NOW()),
  (61, 2, 'Sri Ayyappa Pooja', 'Complete sacred worship and pooja vidhanam of Lord Sri Dharma Sastha Ayyappa.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 2. Irumudi
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (62, 'irumudi', 2, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 2, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (62, 1, 'ఇరుముడి', 'ఇరుముడి అనగా రెండు ముడులు కలిగిన వస్త్ర సంచి. మున్ముడి మరియు పిన్ముడి విశిష్టత.', NOW(), NOW()),
  (62, 2, 'Irumudi', 'Significance of sacred Irumudi Kettu for Sabarimala pilgrimage.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 3. Ayyappaswamy Stotram
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (63, 'ayyappaswamy-stotram', 3, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 3, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (63, 1, 'అయ్యప్పస్వామి స్తోత్రం', 'హరిహరసుతమీశం తారకారాధినాథం | ప్రణమత హృది శాస్తారం శబరీశ్వరమ్ ||', NOW(), NOW()),
  (63, 2, 'Ayyappaswamy Stotram', 'Sacred hymns glorifying the divine manifestations of Lord Ayyappa.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 4. Sri Sabarigirisashtakam
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (64, 'sri-sabarigirisashtakam', 4, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 4, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (64, 1, 'శ్రీ శబరిగిరీశాష్టకమ్', 'యజన పూజన కామినార్ధం మునిజన సంస్తుత పాదపద్మమ్ | శబరిగిరీశం సమాశ్రయే ||', NOW(), NOW()),
  (64, 2, 'Sri Sabarigireeshashtakam', 'Eight auspicious octets dedicated to the presiding deity of Sabari Hills.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 5. Hariharatmajashtakam (Harivarasanam)
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (65, 'hariharatmajashtakam', 5, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 5, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (65, 1, 'హరిహరాత్మజాష్టకం (హరివరాసనం)', 'హరివరాసనం విశ్వమోహనం హరిదధీశ్వరం ఆరాధ్యపాదుకమ్ | అరివిమర్దనం నిత్యనర్తనం హరిహరాత్మజం దేవమాశ్రయే ||', NOW(), NOW()),
  (65, 2, 'Hariharathmajashtakam (Harivarasanam)', 'The divine peaceful lullaby sung nightly to Sri Ayyappa at Sabarimala.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 6. Sri Dharmasastha Bhujanga Stotram
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (66, 'sri-dharmasastha-bhujanga-stotram', 6, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 6, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (66, 1, 'శ్రీ ధర్మశాస్తా భుజంగ స్తోత్రం', 'కృపాలోకవీరం భవాంభోధిపోతం | భజేహరిహరాత్మజం శాస్తారమ్ ||', NOW(), NOW()),
  (66, 2, 'Sri Dharmasastha Bhujanga Stotram', 'Serpentine meter hymn extolling Lord Sastha’s supreme grace and protection.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 7. Sri Dharmasastha Stotram (Sringeri)
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (67, 'sri-dharmasastha-stotram-sringeri', 7, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 7, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (67, 1, 'శ్రీ ధర్మశాస్తా స్తోత్రం (శృంగేరి జగద్గురు విరచితం)', 'శృంగేరి శారదాపీఠ జగద్గురు శ్రీ సచ్చిదానంద భారతీ స్వామి విరచిత దివ్య స్తోత్రం.', NOW(), NOW()),
  (67, 2, 'Sri Dharmasastha Stotram (Sringeri Jagadguru Composed)', 'Hymn composed by the revered Sringeri Jagadguru.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 8. Sri Mahasastha Anugraha Kavacham
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (68, 'sri-mahasastha-anugraha-kavacham', 8, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 8, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (68, 1, 'శ్రీ మహాశాస్తా అనుగ్రహ కవచం', 'ఓం అస్య శ్రీ మహాశాస్తా అనుగ్రహ కవచ స్తోత్ర మహా మంత్రస్య భగవాన్ పరమేశ్వర ఋషిః.', NOW(), NOW()),
  (68, 2, 'Sri Mahasastha Anugraha Kavacham', 'The divine armor prayer granting complete protection and overcoming fear.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- 9. Sri Dharmasastha Sahasranama Stotram
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES (69, 'sri-dharmasastha-sahasranama-stotram', 9, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE `parent_id` = 8, `display_order` = 9, `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  (69, 1, 'శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్', 'ఓం శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్. 1000 దివ్య నామములు.', NOW(), NOW()),
  (69, 2, 'Sri Dharmasastha Sahasranama Stotram', '1,008 divine sacred names of Lord Sri Dharma Sastha.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();
