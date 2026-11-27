-- ==============================================================================
-- SARANAM AYYAPPA PRODUCTION DATABASE SAFE SEED & SYNC SCRIPT
-- Database: thathwamasi_saranamayyappa
--
-- SAFE TO RUN REPEATEDLY:
-- - Uses `slug` unique matching (no hardcoded primary key `id` conflicts)
-- - Safely links subcategories by dynamically querying parent IDs
-- - Un-archives any hidden records (sets `is_archived = 0`)
-- - Inserts all 9 Devotional Services into `category_services` and `app_settings`
-- - Updates translations without throwing #1062 Duplicate entry errors
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Ensure Supported Languages exist in `languages`
-- ------------------------------------------------------------------------------
INSERT INTO `languages` (`code`, `name`, `created_at`, `updated_at`)
VALUES
  ('te', 'Telugu', NOW(), NOW()),
  ('kn', 'Kannada', NOW(), NOW()),
  ('en', 'English', NOW(), NOW()),
  ('ta', 'Tamil', NOW(), NOW()),
  ('hi', 'Hindi', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 2. Seed 9 Devotional Services into `category_services` Table
-- ------------------------------------------------------------------------------
INSERT INTO `category_services` (`service_id`, `title`, `sub`, `icon`, `url`, `image`, `artwork`, `display_order`, `is_active`, `created_at`, `updated_at`)
VALUES
  ('pooja', 'Pooja Vidhanam', 'Step-by-step sacred rituals', 'Flame', '/subcategories', '/images/categories/art-pooja-trans.png', '/images/categories/art-pooja-trans.png', 1, 1, NOW(), NOW()),
  ('stotras', 'Divine Stotras', 'Sacred Hymns & Chants', 'BookOpen', '/subcategories', '/images/categories/art-stotras-trans.png', '/images/categories/art-stotras-trans.png', 2, 1, NOW(), NOW()),
  ('slokas', 'Daily Slokas', 'Verses for Meditation', 'Sparkles', '/subcategories', '/images/categories/art-slokas-trans.png', '/images/categories/art-slokas-trans.png', 3, 1, NOW(), NOW()),
  ('bhajans', 'Bhajans & Songs', 'Devotional Melodies', 'Music', '/subcategories', '/images/categories/art-bhajans-trans.png', '/images/categories/art-bhajans-trans.png', 4, 1, NOW(), NOW()),
  ('darshan', 'Live Darshan', 'Daily Temple Streams', 'Tv', '/temples', '/images/categories/art-live-trans.png', '/images/categories/art-live-trans.png', 5, 1, NOW(), NOW()),
  ('panchangam', 'Panchangam', 'Auspicious Timings', 'Calendar', '/panchangam', '/images/categories/art-panchangam-trans.png', '/images/categories/art-panchangam-trans.png', 6, 1, NOW(), NOW()),
  ('festivals', 'Temple Festivals', 'Annual Celebrations', 'Sparkles', '/festivals', '/images/categories/art-festivals-trans.png', '/images/categories/art-festivals-trans.png', 7, 1, NOW(), NOW()),
  ('temples', 'Sacred Temples', 'Shrines & Pilgrimages', 'Landmark', '/temples', '/images/categories/art-temples-trans.png', '/images/categories/art-temples-trans.png', 8, 1, NOW(), NOW()),
  ('annadanam', 'Annadanam Seva', 'Meal Offering & Seva', 'Heart', '/subcategories', '/images/categories/art-donations-trans.png', '/images/categories/art-donations-trans.png', 9, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `sub` = VALUES(`sub`),
  `icon` = VALUES(`icon`),
  `url` = VALUES(`url`),
  `image` = VALUES(`image`),
  `artwork` = VALUES(`artwork`),
  `display_order` = VALUES(`display_order`),
  `is_active` = 1,
  `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 3. Seed 9 Devotional Services into `app_settings` (key: `category_services`)
-- ------------------------------------------------------------------------------
INSERT INTO `app_settings` (`key`, `value`, `description`, `created_at`, `updated_at`)
VALUES
  ('category_services', '[{"id":"pooja","serviceId":"pooja","title":"Pooja Vidhanam","sub":"Step-by-step sacred rituals","icon":"Flame","url":"/subcategories","artwork":"/images/categories/art-pooja-trans.png","displayOrder":1,"isActive":true},{"id":"stotras","serviceId":"stotras","title":"Divine Stotras","sub":"Sacred Hymns & Chants","icon":"BookOpen","url":"/subcategories","artwork":"/images/categories/art-stotras-trans.png","displayOrder":2,"isActive":true},{"id":"slokas","serviceId":"slokas","title":"Daily Slokas","sub":"Verses for Meditation","icon":"Sparkles","url":"/subcategories","artwork":"/images/categories/art-slokas-trans.png","displayOrder":3,"isActive":true},{"id":"bhajans","serviceId":"bhajans","title":"Bhajans & Songs","sub":"Devotional Melodies","icon":"Music","url":"/subcategories","artwork":"/images/categories/art-bhajans-trans.png","displayOrder":4,"isActive":true},{"id":"darshan","serviceId":"darshan","title":"Live Darshan","sub":"Daily Temple Streams","icon":"Tv","url":"/temples","artwork":"/images/categories/art-live-trans.png","displayOrder":5,"isActive":true},{"id":"panchangam","serviceId":"panchangam","title":"Panchangam","sub":"Auspicious Timings","icon":"Calendar","url":"/panchangam","artwork":"/images/categories/art-panchangam-trans.png","displayOrder":6,"isActive":true},{"id":"festivals","serviceId":"festivals","title":"Temple Festivals","sub":"Annual Celebrations","icon":"Sparkles","url":"/festivals","artwork":"/images/categories/art-festivals-trans.png","displayOrder":7,"isActive":true},{"id":"temples","serviceId":"temples","title":"Sacred Temples","sub":"Shrines & Pilgrimages","icon":"Landmark","url":"/temples","artwork":"/images/categories/art-temples-trans.png","displayOrder":8,"isActive":true},{"id":"annadanam","serviceId":"annadanam","title":"Annadanam Seva","sub":"Meal Offering & Seva","icon":"Heart","url":"/subcategories","artwork":"/images/categories/art-donations-trans.png","displayOrder":9,"isActive":true}]', 'Devotional Services Directory (9 Sanctum Categories)', NOW(), NOW())
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 4. Upsert Root Parent Categories in `content_categories` (by unique `slug`)
-- ------------------------------------------------------------------------------
INSERT INTO `content_categories` (`slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES
  ('pooja-vidhanam', 1, 0, 0, NULL, NOW(), NOW()),
  ('stotras', 2, 0, 0, NULL, NOW(), NOW()),
  ('slokas', 3, 0, 0, NULL, NOW(), NOW()),
  ('bhajans', 4, 1, 0, NULL, NOW(), NOW()),
  ('live-darshan', 5, 0, 0, NULL, NOW(), NOW()),
  ('temple-festivals', 6, 0, 0, NULL, NOW(), NOW()),
  ('sacred-temples', 7, 0, 0, NULL, NOW(), NOW()),
  ('sri-ayyappa-ashtottara', 8, 0, 0, NULL, NOW(), NOW()),
  ('annadanam-seva', 9, 0, 0, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `display_order` = VALUES(`display_order`),
  `is_archived` = 0,
  `updated_at` = NOW();

-- Ensure all root categories are un-archived and active
UPDATE `content_categories`
SET `is_archived` = 0
WHERE `slug` IN ('pooja-vidhanam', 'stotras', 'slokas', 'bhajans', 'live-darshan', 'temple-festivals', 'sacred-temples', 'sri-ayyappa-ashtottara', 'annadanam-seva');

-- ------------------------------------------------------------------------------
-- 5. Seed Sacred Pooja Subcategories under `pooja-vidhanam`
-- Matching Mobile App Screen: All, Ayyappa, Shiva, Devi, Ganesha
-- ------------------------------------------------------------------------------
SET @pooja_parent_id = (SELECT `id` FROM `content_categories` WHERE `slug` = 'pooja-vidhanam' LIMIT 1);

INSERT INTO `content_categories` (`slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES
  ('ayyappa-padi-pooja', 1, 0, 0, @pooja_parent_id, NOW(), NOW()),
  ('ganapathi-pooja', 2, 0, 0, @pooja_parent_id, NOW(), NOW()),
  ('satyanarayana-vratham', 3, 0, 0, @pooja_parent_id, NOW(), NOW()),
  ('lakshmi-pooja', 4, 0, 0, @pooja_parent_id, NOW(), NOW()),
  ('rudrabhishekam', 5, 0, 0, @pooja_parent_id, NOW(), NOW()),
  ('hanuman-pooja', 6, 0, 0, @pooja_parent_id, NOW(), NOW()),
  ('subramanya-pooja', 7, 0, 0, @pooja_parent_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `parent_id` = @pooja_parent_id,
  `display_order` = VALUES(`display_order`),
  `is_archived` = 0,
  `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 6. Seed 9 Sacred Ayyappa Padi Pooja Procedures
-- Under parent 'sri-ayyappa-ashtottara' (or 'ayyappa-padi-pooja')
-- Matching user screenshot:
-- 1. Sri Ayyappa Pooja
-- 2. irumudi
-- 3. Ayyappaswamy Stotram
-- 4. Sri Sabarigireeshashtakam
-- 5. Hariharathmajashtakam
-- 6. Sri Dharmasastha Bhujanga Stotram
-- 7. Sri Dharmasastha Stotram (Sringeri)
-- 8. Sri Mahasastha Anugraha Kavacham
-- 9. Sri Dharmasastha Sahasranama Stotram
-- ------------------------------------------------------------------------------
SET @ayyappa_parent_id = COALESCE(
  (SELECT `id` FROM `content_categories` WHERE `slug` = 'sri-ayyappa-ashtottara' LIMIT 1),
  (SELECT `id` FROM `content_categories` WHERE `slug` = 'ayyappa-padi-pooja' LIMIT 1),
  8
);

INSERT INTO `content_categories` (`slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES
  ('sri-ayyappa-pooja', 1, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('irumudi', 2, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('ayyappaswamy-stotram', 3, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('sri-sabarigirisashtakam', 4, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('hariharatmajashtakam', 5, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('sri-dharmasastha-bhujanga-stotram', 6, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('sri-dharmasastha-stotram-sringeri', 7, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('sri-mahasastha-anugraha-kavacham', 8, 0, 0, @ayyappa_parent_id, NOW(), NOW()),
  ('sri-dharmasastha-sahasranama-stotram', 9, 0, 0, @ayyappa_parent_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `parent_id` = @ayyappa_parent_id,
  `display_order` = VALUES(`display_order`),
  `is_archived` = 0,
  `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 7. Upsert Translations for All Categories (Telugu = 1, English = (SELECT id FROM languages WHERE code='en'))
-- ------------------------------------------------------------------------------
SET @lang_te = COALESCE((SELECT `id` FROM `languages` WHERE `code` = 'te' LIMIT 1), 1);
SET @lang_en = COALESCE((SELECT `id` FROM `languages` WHERE `code` = 'en' LIMIT 1), 3);

-- Macro helper for translations
INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'పూజా విధానము', 'నిత్య పూజా విధులు, వ్రతాలు మరియు పవిత్ర పూజా ప్రక్రియలు.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'pooja-vidhanam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Pooja Vidhanam', 'Step-by-step sacred pooja procedures, vrathams, and rituals.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'pooja-vidhanam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'అయ్యప్ప పడి పూజ', 'పూజా విధానం, సామగ్రి మరియు 18 పదుల పూజా క్రమము.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'ayyappa-padi-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Ayyappa Padi Pooja', 'Pooja procedure, materials & steps for 18 holy steps padi pooja.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'ayyappa-padi-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'గణపతి పూజ', 'సంపూర్ణ విఘ్నేశ్వర పూజా విధానం మరియు మంత్రములు.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'ganapathi-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Ganapathi Pooja', 'Complete vidhanam & mantras for Lord Ganesha.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'ganapathi-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'సత్యనారాయణ వ్రతం', 'కథ, పూజా విధానం మరియు మహత్యము.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'satyanarayana-vratham'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Satyanarayana Vratham', 'With story, procedure & benefits.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'satyanarayana-vratham'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'లక్ష్మీ పూజ', 'సిరి సంపదలు, సౌభాగ్యం మరియు శాంతి కొరకు.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'lakshmi-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Lakshmi Pooja', 'For wealth, prosperity & peace.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'lakshmi-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'రుద్రాభిషేకం', 'ఆరోగ్యం మరియు సర్వవిఘ్న నివారణార్థం ఏకాదశ రుద్రాభిషేకం.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'rudrabhishekam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Rudrabhishekam', 'For health & removal of obstacles.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'rudrabhishekam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'హనుమాన్ పూజ & సింధూరం', 'ధైర్యం, రక్షణ మరియు మనోధైర్యం ప్రసాదించే ఆంజనేయ పూజ.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'hanuman-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Hanuman Pooja & Sindhooram', 'For courage, protection & inner strength.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'hanuman-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'సుబ్రహ్మణ్య షష్ఠి పూజ', 'విజయం, సంతాన సౌభాగ్యం మరియు సంకట నివారణార్థం.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'subramanya-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Subramanya Sashti Pooja', 'For victory, youth & overcoming challenges.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'subramanya-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- Translations for 9 Sacred Ayyappa Padi Pooja items
INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'శ్రీ అయ్యప్ప పూజ', 'ధ్యానం: ధ్యాయేత్ కోటీందుశంకాశం శాస్తారం దేవమవ్యయమ్ | పూర్ణపుష్కలాసంయుక్తం రత్నాభరణభూషితమ్ ||', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-ayyappa-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Sri Ayyappa Pooja', 'ధ్యానం: ధ్యాయేత్ కోటీందుశంకాశం శాస్తారం దేవమవ్యయమ్ | పూర్ణపుష్కలాసంయుక్తం రత్నాభరణభూషితమ్ || Complete daily pooja vidhanam, dhyanam, avahanam, and shodashopachara pooja.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-ayyappa-pooja'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'ఇరుముడి', 'ఇరుముడి అనగా రెండు ముడులు కలిగిన పవిత్ర సంచీ. ముందు ముడి (మున్ముడి) స్వామి కోసం, వెనుక ముడి భక్తుని కోసం.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'irumudi'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'irumudi', 'ఇరుముడి అనగా రెండు ముడులు కలిగిన పవిత్ర సంచీ. Sacred two-compartment bag for pilgrimage to Sabarimala.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'irumudi'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'అయ్యప్పస్వామి స్తోత్రం', 'హరిహరసుతమీశం తారకారాధినాథం శబరిగిరినివాసం శాంతమీశం ప్రసన్నమ్ | త్రిభువనహితకృత్యం వీరమణికంఠదీపం హరిహరసుతమీడే స్వామియే శరణమిత్యే ||', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'ayyappaswamy-stotram'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Ayyappaswamy Stotram', 'హరిహరసుతమీశం తారకారాధినాథం... Sacred hymn praising the glory of Hariharasutha, the Lord of Sabarimala.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'ayyappaswamy-stotram'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'శ్రీ శబరిగిరీశాష్టకమ్', 'యజన పూజన కామినార్ధం | నిత్య పూజిత పాద పద్మమ్ | మునివరైరభివందితం త్వాం | శబరిగిరీశమహం ప్రపద్యే ||', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-sabarigirisashtakam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Sri Sabarigireeshashtakam', 'యజన పూజన కామినార్ధం... Eight sacred verses praising the glorious Lord residing upon Sabarigiri hills.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-sabarigirisashtakam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'హరిహరాత్మజాష్టకం', 'హరివరాసనం విశ్వమోహనం హరిదధీశ్వరం ఆరాధ్యపాదుకమ్ | అరివిమర్దనం నిత్యనర్తనం హరిహరాత్మజం దేవమాశ్రయే ||', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'hariharatmajashtakam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Hariharathmajashtakam', '(హరివరాసనం - నిత్యాభివందన స్తోత్రము)... The supreme divine lullaby sung each night at Sabarimala sanctum.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'hariharatmajashtakam'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'శ్రీ ధర్మశాస్తా భుజంగ స్తోత్రం', 'కృపాలోకవీరం భవాంభోధిపోతం సురారాతిదైత్యప్రహర్తారమీశమ్ | శరణ్యాభిరామం శబర్యాలయస్థం భజే ధర్మశాస్తారమాద్యం పరేశమ్ ||', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-dharmasastha-bhujanga-stotram'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Sri Dharmasastha Bhujanga Stotram', 'కృపాలోకవీరం భవాంభోధిపోతం... Serpentine meter hymn composed in adoration of Lord Dharma Sastha.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-dharmasastha-bhujanga-stotram'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'శ్రీ ధర్మశాస్తా స్తోత్రం (శృంగేరి జగద్గురు విరచితం)', 'శృంగేరి శారదాపీఠ జగద్గురు శ్రీ సచ్చిదానంద శివాభినవ నృసింహభారతీ స్వామివారిచే రచింపబడిన దివ్య స్తోత్రము.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-dharmasastha-stotram-sringeri'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Sri Dharmasastha Stotram (Sringeri Jagadguru Composed)', '(శృంగేరి శారదాపీఠ జగద్గురు శ్రీ సచ్చిదానంద...) Divine hymn composed by Sringeri Jagadguru Sri Sacchidananda Sivabhinava Nrusimha Bharati Mahaswamigal.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-dharmasastha-stotram-sringeri'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'శ్రీ మహాశాస్తా అనుగ్రహ కవచం', 'ఓం అస్య శ్రీ మహాశాస్తా అనుగ్రహ కవచ స్తోత్ర మహా మంత్రస్య, బ్రహ్మ ఋషిః, గాయత్రీ ఛందః, శ్రీ మహాశాస్తా దేవతా ||', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-mahasastha-anugraha-kavacham'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Sri Mahasastha Anugraha Kavacham', 'Protective divine armour invoking the all-encompassing grace of Sri Dharma Sastha.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-mahasastha-anugraha-kavacham'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_te, 'శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్', 'శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్ - వేయి దివ్య నామములతో స్వామివారిని అర్చించు మహా మహిమాన్విత స్తోత్రము.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-dharmasastha-sahasranama-stotram'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
SELECT c.id, @lang_en, 'Sri Dharmasastha Sahasranama Stotram', 'The 1000 glorious holy names of Lord Ayyappa for profound spiritual liberation.', NOW(), NOW()
FROM `content_categories` c WHERE c.slug = 'sri-dharmasastha-sahasranama-stotram'
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- COMPLETED SAFELY!
-- All tables are now synced and updated without any primary key or duplicate errors.
-- ==============================================================================
