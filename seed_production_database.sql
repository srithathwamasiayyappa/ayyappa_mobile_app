-- ==============================================================================
-- SARANAM AYYAPPA PRODUCTION DATABASE SEED SCRIPT
-- Database: thathwamasi_saranamayyappa
-- Import this SQL directly via cPanel -> phpMyAdmin -> thathwamasi_saranamayyappa -> Import
--
-- This script seeds the authentic database tables with:
-- 1. Supported languages (Telugu, Kannada, English, Tamil, Hindi)
-- 2. 9 Devotional Services (in `category_services` table and `app_settings`)
-- 3. Root Categories (Pooja Vidhanam, Divine Stotras, Daily Slokas, Bhajans, etc.)
-- 4. Sacred Pooja Subcategories (Ayyappa Padi Pooja, Ganapathi Pooja, Satyanarayana Vratham, etc.)
-- 5. 9 Sacred Ayyappa Padi Pooja Procedures (Sri Ayyappa Pooja, Irumudi, Stotras, etc.)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Ensure Supported Languages exist in `languages`
-- ------------------------------------------------------------------------------
INSERT INTO `languages` (`id`, `code`, `name`, `created_at`, `updated_at`)
VALUES
  (1, 'te', 'Telugu', NOW(), NOW()),
  (2, 'kn', 'Kannada', NOW(), NOW()),
  (3, 'en', 'English', NOW(), NOW()),
  (4, 'ta', 'Tamil', NOW(), NOW()),
  (5, 'hi', 'Hindi', NOW(), NOW())
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
  `is_active` = VALUES(`is_active`),
  `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 3. Seed 9 Devotional Services into `app_settings` (key: `category_services`)
-- ------------------------------------------------------------------------------
INSERT INTO `app_settings` (`key`, `value`, `description`, `created_at`, `updated_at`)
VALUES
  ('category_services', '[{"id":"pooja","serviceId":"pooja","title":"Pooja Vidhanam","sub":"Step-by-step sacred rituals","icon":"Flame","url":"/subcategories","artwork":"/images/categories/art-pooja-trans.png","displayOrder":1,"isActive":true},{"id":"stotras","serviceId":"stotras","title":"Divine Stotras","sub":"Sacred Hymns & Chants","icon":"BookOpen","url":"/subcategories","artwork":"/images/categories/art-stotras-trans.png","displayOrder":2,"isActive":true},{"id":"slokas","serviceId":"slokas","title":"Daily Slokas","sub":"Verses for Meditation","icon":"Sparkles","url":"/subcategories","artwork":"/images/categories/art-slokas-trans.png","displayOrder":3,"isActive":true},{"id":"bhajans","serviceId":"bhajans","title":"Bhajans & Songs","sub":"Devotional Melodies","icon":"Music","url":"/subcategories","artwork":"/images/categories/art-bhajans-trans.png","displayOrder":4,"isActive":true},{"id":"darshan","serviceId":"darshan","title":"Live Darshan","sub":"Daily Temple Streams","icon":"Tv","url":"/temples","artwork":"/images/categories/art-live-trans.png","displayOrder":5,"isActive":true},{"id":"panchangam","serviceId":"panchangam","title":"Panchangam","sub":"Auspicious Timings","icon":"Calendar","url":"/panchangam","artwork":"/images/categories/art-panchangam-trans.png","displayOrder":6,"isActive":true},{"id":"festivals","serviceId":"festivals","title":"Temple Festivals","sub":"Annual Celebrations","icon":"Sparkles","url":"/festivals","artwork":"/images/categories/art-festivals-trans.png","displayOrder":7,"isActive":true},{"id":"temples","serviceId":"temples","title":"Sacred Temples","sub":"Shrines & Pilgrimages","icon":"Landmark","url":"/temples","artwork":"/images/categories/art-temples-trans.png","displayOrder":8,"isActive":true},{"id":"annadanam","serviceId":"annadanam","title":"Annadanam Seva","sub":"Meal Offering & Seva","icon":"Heart","url":"/subcategories","artwork":"/images/categories/art-donations-trans.png","displayOrder":9,"isActive":true}]', 'Devotional Services Directory (9 Sanctum Categories)', NOW(), NOW())
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 4. Seed Root Parent Categories in `content_categories`
-- ------------------------------------------------------------------------------
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES
  (1, 'pooja-vidhanam', 1, 0, 0, NULL, NOW(), NOW()),
  (2, 'stotras', 2, 0, 0, NULL, NOW(), NOW()),
  (3, 'slokas', 3, 0, 0, NULL, NOW(), NOW()),
  (4, 'bhajans', 4, 1, 0, NULL, NOW(), NOW()),
  (5, 'live-darshan', 5, 0, 0, NULL, NOW(), NOW()),
  (6, 'temple-festivals', 6, 0, 0, NULL, NOW(), NOW()),
  (7, 'sacred-temples', 7, 0, 0, NULL, NOW(), NOW()),
  (8, 'sri-ayyappa-ashtottara', 8, 0, 0, NULL, NOW(), NOW()),
  (9, 'annadanam-seva', 9, 0, 0, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `slug` = VALUES(`slug`),
  `display_order` = VALUES(`display_order`),
  `is_audio` = VALUES(`is_audio`),
  `is_archived` = VALUES(`is_archived`),
  `updated_at` = NOW();

-- Translations for Root Categories
INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  -- 1. Pooja Vidhanam
  (1, 1, 'పూజా విధానము', 'నిత్య పూజా విధులు, వ్రతాలు మరియు పవిత్ర పూజా ప్రక్రియలు.', NOW(), NOW()),
  (1, 3, 'Pooja Vidhanam', 'Step-by-step sacred pooja procedures, vrathams, and rituals.', NOW(), NOW()),

  -- 2. Divine Stotras
  (2, 1, 'దివ్య స్తోత్రములు', 'శ్రీ అయ్యప్పస్వామి మరియు సమస్త దేవతల పవిత్ర స్తోత్రములు.', NOW(), NOW()),
  (2, 3, 'Divine Stotras', 'Sacred hymns, kavachams, and stotras praising the deities.', NOW(), NOW()),

  -- 3. Daily Slokas
  (3, 1, 'నిత్య శ్లోకములు', 'ధ్యాన శ్లోకాలు, గాయత్రీ మంత్రాలు మరియు ప్రార్థనలు.', NOW(), NOW()),
  (3, 3, 'Daily Slokas', 'Daily verses for meditation, prayer, and divine remembrance.', NOW(), NOW()),

  -- 4. Bhajans & Songs
  (4, 1, 'భజనలు & భక్తి గీతాలు', 'శబరిమల యాత్ర భజనలు మరియు భక్తి గీతములు.', NOW(), NOW()),
  (4, 3, 'Bhajans & Songs', 'Devotional bhajans, audio tracks, and lyrics.', NOW(), NOW()),

  -- 5. Live Darshan
  (5, 1, 'లైవ్ దర్శనం', 'పుణ్యక్షేత్రాల ప్రత్యక్ష దర్శన ప్రసారాలు.', NOW(), NOW()),
  (5, 3, 'Live Darshan', 'Daily live temple darshan streams from holy shrines.', NOW(), NOW()),

  -- 6. Temple Festivals
  (6, 1, 'దేవాలయ ఉత్సవాలు', 'వార్షిక బ్రహ్మోత్సవాలు, పర్వదినాలు మరియు తిథులు.', NOW(), NOW()),
  (6, 3, 'Temple Festivals', 'Annual celebrations, temple festivals, and auspicious dates.', NOW(), NOW()),

  -- 7. Sacred Temples
  (7, 1, 'పుణ్య క్షేత్రాలు', 'శ్రీ అయ్యప్ప ఆలయాలు మరియు పవిత్ర క్షేత్రాల దర్శిని.', NOW(), NOW()),
  (7, 3, 'Sacred Temples', 'Sacred shrines and temples directory across Bharat.', NOW(), NOW()),

  -- 8. Sri Ayyappa Ashtottara / Padi Pooja
  (8, 1, 'శ్రీ అయ్యప్ప పూజ & పడి పూజ', 'శ్రీ ధర్మశాస్తా అయ్యప్పస్వామి నిత్య పూజా విధానము మరియు 18 పదుల పూజ.', NOW(), NOW()),
  (8, 3, 'Sri Ayyappa Pooja & Padi Pooja', 'Sacred rituals, 18 holy steps padi pooja vidhanam, and stotras of Lord Ayyappa.', NOW(), NOW()),

  -- 9. Annadanam Seva
  (9, 1, 'అన్నదానం సేవ', 'స్వామి భక్తులకు పవిత్ర అన్నదాన సమర్పణ మరియు సేవ.', NOW(), NOW()),
  (9, 3, 'Annadanam Seva', 'Sacred food offering and seva for devotees.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 5. Seed Sacred Pooja Subcategories under `pooja-vidhanam` (parent_id: 1)
-- Matching Mobile App Screen: All, Ayyappa, Shiva, Devi, Ganesha
-- ------------------------------------------------------------------------------
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES
  (11, 'ayyappa-padi-pooja', 1, 0, 0, 1, NOW(), NOW()),
  (12, 'ganapathi-pooja', 2, 0, 0, 1, NOW(), NOW()),
  (13, 'satyanarayana-vratham', 3, 0, 0, 1, NOW(), NOW()),
  (14, 'lakshmi-pooja', 4, 0, 0, 1, NOW(), NOW()),
  (15, 'rudrabhishekam', 5, 0, 0, 1, NOW(), NOW()),
  (16, 'hanuman-pooja', 6, 0, 0, 1, NOW(), NOW()),
  (17, 'subramanya-pooja', 7, 0, 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `slug` = VALUES(`slug`),
  `display_order` = VALUES(`display_order`),
  `parent_id` = VALUES(`parent_id`),
  `updated_at` = NOW();

-- Translations for Pooja Subcategories
INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  -- 11. Ayyappa Padi Pooja
  (11, 1, 'అయ్యప్ప పడి పూజ', 'పూజా విధానం, సామగ్రి మరియు 18 పదుల పూజా క్రమము.', NOW(), NOW()),
  (11, 3, 'Ayyappa Padi Pooja', 'Pooja procedure, materials & steps for 18 holy steps padi pooja.', NOW(), NOW()),

  -- 12. Ganapathi Pooja
  (12, 1, 'గణపతి పూజ', 'సంపూర్ణ విఘ్నేశ్వర పూజా విధానం మరియు మంత్రములు.', NOW(), NOW()),
  (12, 3, 'Ganapathi Pooja', 'Complete vidhanam & mantras for Lord Ganesha.', NOW(), NOW()),

  -- 13. Satyanarayana Vratham
  (13, 1, 'సత్యనారాయణ వ్రతం', 'కథ, పూజా విధానం మరియు మహత్యము.', NOW(), NOW()),
  (13, 3, 'Satyanarayana Vratham', 'With story, procedure & benefits.', NOW(), NOW()),

  -- 14. Lakshmi Pooja
  (14, 1, 'లక్ష్మీ పూజ', 'సిరి సంపదలు, సౌభాగ్యం మరియు శాంతి కొరకు.', NOW(), NOW()),
  (14, 3, 'Lakshmi Pooja', 'For wealth, prosperity & peace.', NOW(), NOW()),

  -- 15. Rudrabhishekam
  (15, 1, 'రుద్రాభిషేకం', 'ఆరోగ్యం మరియు సర్వవిఘ్న నివారణార్థం ఏకాదశ రుద్రాభిషేకం.', NOW(), NOW()),
  (15, 3, 'Rudrabhishekam', 'For health & removal of obstacles.', NOW(), NOW()),

  -- 16. Hanuman Pooja & Sindhooram
  (16, 1, 'హనుమాన్ పూజ & సింధూరం', 'ధైర్యం, రక్షణ మరియు మనోధైర్యం ప్రసాదించే ఆంజనేయ పూజ.', NOW(), NOW()),
  (16, 3, 'Hanuman Pooja & Sindhooram', 'For courage, protection & inner strength.', NOW(), NOW()),

  -- 17. Subramanya Sashti Pooja
  (17, 1, 'సుబ్రహ్మణ్య షష్ఠి పూజ', 'విజయం, సంతాన సౌభాగ్యం మరియు సంకట నివారణార్థం.', NOW(), NOW()),
  (17, 3, 'Subramanya Sashti Pooja', 'For victory, youth & overcoming challenges.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

-- ------------------------------------------------------------------------------
-- 6. Seed the 9 Sacred Ayyappa Padi Pooja Procedure Items
-- Under parent_id: 8 ('sri-ayyappa-ashtottara') and accessible via 'ayyappa-padi-pooja'
-- Matching user mobile screenshot:
-- 1. Sri Ayyappa Pooja
-- 2. irumudi
-- 3. Ayyappaswamy Stotram
-- 4. Sri Sabarigireeshashtakam
-- 5. Hariharathmajashtakam
-- 6. Sri Dharmasastha Bhujanga Stotram
-- 7. Sri Dharmasastha Stotram (Sringeri Jagadguru Com...)
-- 8. Sri Mahasastha Anugraha Kavacham
-- 9. Sri Dharmasastha Sahasranama Stotram
-- ------------------------------------------------------------------------------
INSERT INTO `content_categories` (`id`, `slug`, `display_order`, `is_audio`, `is_archived`, `parent_id`, `created_at`, `updated_at`)
VALUES
  (61, 'sri-ayyappa-pooja', 1, 0, 0, 8, NOW(), NOW()),
  (62, 'irumudi', 2, 0, 0, 8, NOW(), NOW()),
  (63, 'ayyappaswamy-stotram', 3, 0, 0, 8, NOW(), NOW()),
  (64, 'sri-sabarigirisashtakam', 4, 0, 0, 8, NOW(), NOW()),
  (65, 'hariharatmajashtakam', 5, 0, 0, 8, NOW(), NOW()),
  (66, 'sri-dharmasastha-bhujanga-stotram', 6, 0, 0, 8, NOW(), NOW()),
  (67, 'sri-dharmasastha-stotram-sringeri', 7, 0, 0, 8, NOW(), NOW()),
  (68, 'sri-mahasastha-anugraha-kavacham', 8, 0, 0, 8, NOW(), NOW()),
  (69, 'sri-dharmasastha-sahasranama-stotram', 9, 0, 0, 8, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `slug` = VALUES(`slug`),
  `display_order` = VALUES(`display_order`),
  `parent_id` = VALUES(`parent_id`),
  `updated_at` = NOW();

-- Translations for 9 Sacred Subcategories (Telugu & English)
INSERT INTO `content_translations` (`category_id`, `language_id`, `title`, `description`, `created_at`, `updated_at`)
VALUES
  -- 1. Sri Ayyappa Pooja
  (61, 1, 'శ్రీ అయ్యప్ప పూజ', 'ధ్యానం: ధ్యాయేత్ కోటీందుశంకాశం శాస్తారం దేవమవ్యయమ్ | పూర్ణపుష్కలాసంయుక్తం రత్నాభరణభూషితమ్ ||', NOW(), NOW()),
  (61, 3, 'Sri Ayyappa Pooja', 'ధ్యానం: ధ్యాయేత్ కోటీందుశంకాశం శాస్తారం దేవమవ్యయమ్ | పూర్ణపుష్కలాసంయుక్తం రత్నాభరణభూషితమ్ || Complete daily pooja vidhanam, dhyanam, avahanam, and shodashopachara pooja.', NOW(), NOW()),

  -- 2. Irumudi
  (62, 1, 'ఇరుముడి', 'ఇరుముడి అనగా రెండు ముడులు కలిగిన పవిత్ర సంచీ. ముందు ముడి (మున్ముడి) స్వామి కోసం, వెనుక ముడి భక్తుని కోసం.', NOW(), NOW()),
  (62, 3, 'irumudi', 'ఇరుముడి అనగా రెండు ముడులు కలిగిన పవిత్ర సంచీ. Sacred two-compartment bag for pilgrimage to Sabarimala.', NOW(), NOW()),

  -- 3. Ayyappaswamy Stotram
  (63, 1, 'అయ్యప్పస్వామి స్తోత్రం', 'హరిహరసుతమీశం తారకారాధినాథం శబరిగిరినివాసం శాంతమీశం ప్రసన్నమ్ | త్రిభువనహితకృత్యం వీరమణికంఠదీపం హరిహరసుతమీడే స్వామియే శరణమిత్యే ||', NOW(), NOW()),
  (63, 3, 'Ayyappaswamy Stotram', 'హరిహరసుతమీశం తారకారాధినాథం... Sacred hymn praising the glory of Hariharasutha, the Lord of Sabarimala.', NOW(), NOW()),

  -- 4. Sri Sabarigirisashtakam
  (64, 1, 'శ్రీ శబరిగిరీశాష్టకమ్', 'యజన పూజన కామినార్ధం | నిత్య పూజిత పాద పద్మమ్ | మునివరైరభివందితం త్వాం | శబరిగిరీశమహం ప్రపద్యే ||', NOW(), NOW()),
  (64, 3, 'Sri Sabarigireeshashtakam', 'యజన పూజన కామినార్ధం... Eight sacred verses praising the glorious Lord residing upon Sabarigiri hills.', NOW(), NOW()),

  -- 5. Hariharathmajashtakam
  (65, 1, 'హరిహరాత్మజాష్టకం', 'హరివరాసనం విశ్వమోహనం హరిదధీశ్వరం ఆరాధ్యపాదుకమ్ | అరివిమర్దనం నిత్యనర్తనం హరిహరాత్మజం దేవమాశ్రయే ||', NOW(), NOW()),
  (65, 3, 'Hariharathmajashtakam', '(హరివరాసనం - నిత్యాభివందన స్తోత్రము)... The supreme divine lullaby sung each night at Sabarimala sanctum.', NOW(), NOW()),

  -- 6. Sri Dharmasastha Bhujanga Stotram
  (66, 1, 'శ్రీ ధర్మశాస్తా భుజంగ స్తోత్రం', 'కృపాలోకవీరం భవాంభోధిపోతం సురారాతిదైత్యప్రహర్తారమీశమ్ | శరణ్యాభిరామం శబర్యాలయస్థం భజే ధర్మశాస్తారమాద్యం పరేశమ్ ||', NOW(), NOW()),
  (66, 3, 'Sri Dharmasastha Bhujanga Stotram', 'కృపాలోకవీరం భవాంభోధిపోతం... Serpentine meter hymn composed in adoration of Lord Dharma Sastha.', NOW(), NOW()),

  -- 7. Sri Dharmasastha Stotram (Sringeri Jagadguru)
  (67, 1, 'శ్రీ ధర్మశాస్తా స్తోత్రం (శృంగేరి జగద్గురు విరచితం)', 'శృంగేరి శారదాపీఠ జగద్గురు శ్రీ సచ్చిదానంద శివాభినవ నృసింహభారతీ స్వామివారిచే రచింపబడిన దివ్య స్తోత్రము.', NOW(), NOW()),
  (67, 3, 'Sri Dharmasastha Stotram (Sringeri Jagadguru Composed)', '(శృంగేరి శారదాపీఠ జగద్గురు శ్రీ సచ్చిదానంద...) Divine hymn composed by Sringeri Jagadguru Sri Sacchidananda Sivabhinava Nrusimha Bharati Mahaswamigal.', NOW(), NOW()),

  -- 8. Sri Mahasastha Anugraha Kavacham
  (68, 1, 'శ్రీ మహాశాస్తా అనుగ్రహ కవచం', 'ఓం అస్య శ్రీ మహాశాస్తా అనుగ్రహ కవచ స్తోత్ర మహా మంత్రస్య, బ్రహ్మ ఋషిః, గాయత్రీ ఛందః, శ్రీ మహాశాస్తా దేవతా ||', NOW(), NOW()),
  (68, 3, 'Sri Mahasastha Anugraha Kavacham', 'Protective divine armour invoking the all-encompassing grace of Sri Dharma Sastha.', NOW(), NOW()),

  -- 9. Sri Dharmasastha Sahasranama Stotram
  (69, 1, 'శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్', 'శ్రీ ధర్మశాస్తా సహస్రనామ స్తోత్రమ్ - వేయి దివ్య నామములతో స్వామివారిని అర్చించు మహా మహిమాన్విత స్తోత్రము.', NOW(), NOW()),
  (69, 3, 'Sri Dharmasastha Sahasranama Stotram', 'The 1000 glorious holy names of Lord Ayyappa for profound spiritual liberation.', NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `updated_at` = NOW();

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- SEED COMPLETED SUCCESSFULLY!
-- All 9 Devotional Services, Sacred Root Categories, 7 Pooja Subcategories,
-- and 9 Ayyappa Padi Pooja Procedure items are now seeded into the MySQL DB.
-- ==============================================================================
