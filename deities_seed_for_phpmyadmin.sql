-- ========================================================
-- SARANAM AYYAPPA: DEITIES (GODS / GODDESSES) SEED SQL
-- Execute in phpMyAdmin SQL tab on your database server
-- ========================================================

CREATE TABLE IF NOT EXISTS `deities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `telugu_name` varchar(255) DEFAULT NULL,
  `tamil_name` varchar(255) DEFAULT NULL,
  `kannada_name` varchar(255) DEFAULT NULL,
  `hindi_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'popular',
  `image_url` varchar(500) DEFAULT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `aliases` text DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `deities_category_idx` (`category`),
  KEY `deities_is_featured_idx` (`is_featured`),
  KEY `deities_is_active_idx` (`is_active`),
  KEY `deities_order_index_idx` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `deities` (`id`, `slug`, `name`, `telugu_name`, `tamil_name`, `kannada_name`, `hindi_name`, `description`, `category`, `image_url`, `image_name`, `aliases`, `is_featured`, `order_index`, `is_active`) VALUES
(1, 'ayyappa', 'Lord Ayyappa', 'అయ్యప్ప స్వామి', 'ஐயப்பன்', 'ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿ', 'अय्यप्पा स्वामी', 'Lord Ayyappa, the presiding deity of Sabarimala, worshipped by millions of devotees embarking on sacred 41-day Mandala Vratham.', 'popular', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_ayyappa.png', 'lord_ayyappa.png', 'ayyappa, manikanta, shabarimala, shasta, swamy, hariharasuta', 1, 1, 1),
(2, 'ganesha', 'Lord Ganesha', 'గణపతి / వినాయక', 'விநாயகர்', 'ಗಣೇಶ', 'गणेश भगवान', 'Lord Ganesha, the remover of all obstacles (Vighnaharta) and embodiment of wisdom, worshipped first before beginning all sacred tasks.', 'popular', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_ganesha.png', 'lord_ganesha.png', 'ganesh, ganapathi, vinayaka, vighneshwara, pillayar, lambodara', 1, 2, 1),
(3, 'murugan', 'Lord Murugan', 'మురుగన్ / సుబ్రహ్మణ్య', 'முருகன்', 'ಮುರುಗನ್', 'मुरुगन / कार्तिकेय', 'Lord Murugan, commander of the divine army and embodiment of courage, power, and youthful wisdom.', 'popular', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_murugan.png', 'lord_murugan.png', 'muruga, subrahmanya, kartikeya, skanda, velan, kumara', 1, 3, 1),
(4, 'shiva', 'Lord Shiva', 'పరమ శివుడు', 'சிவன்', 'ಶಿವ', 'शिव शंकर', 'Lord Shiva, Mahadeva, the supreme ascetic and supreme transformer who protects devotees and bestows inner peace.', 'shiva', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_shiva.png', 'lord_shiva.png', 'shiva, mahadev, shankara, bholenath, ishwara, rudra, nataraja', 1, 4, 1),
(5, 'vishnu', 'Lord Vishnu', 'మహా విష్ణువు', 'விஷ்ணு', 'ಮಹಾ ವಿಷ್ಣು', 'भगवान विष्णु', 'Lord Vishnu, the preserver and sustainer of the universe, residing in Vaikuntha and protecting righteousness (Dharma).', 'vishnu', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_vishnu.png', 'lord_vishnu.png', 'vishnu, narayana, hari, perumal, govinda, jagannath', 1, 5, 1),
(6, 'devi', 'Goddess Devi', 'దేవి / అమ్మవారు', 'அம்மன் / தேவி', 'ದೇವಿ', 'देवी मां', 'Supreme Mother Goddess, embodiment of primordial divine cosmic energy (Adi Parashakti) and maternal compassion.', 'devi', 'https://backendapis.saranamayyappa.in/uploads/deities/goddess_devi.png', 'goddess_devi.png', 'devi, amman, shakti, mata, parvati, goddess, amba', 1, 6, 1),
(7, 'venkateswara', 'Lord Venkateswara', 'శ్రీ వేంకటేశ్వర స్వామి', 'வெங்கடேஸ்வரர்', 'ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ', 'श्री वेंकटेश्वर', 'Lord of the Seven Hills (Tirumala), Kaliyuga Pratyaksha Daivam who bestows salvation and answers devotees’ prayers.', 'vishnu', 'https://backendapis.saranamayyappa.in/uploads/deities/venkateswara.jpg', 'venkateswara.jpg', 'balaji, govinda, tirupati, srinivasa, venkanna, ezhumalayan', 0, 7, 1),
(8, 'krishna', 'Lord Krishna', 'శ్రీ కృష్ణుడు', 'கிருஷ்ணர்', 'ಕೃಷ್ಣ', 'भगवान कृष्ण', 'Lord Krishna, the universal teacher of the Bhagavad Gita and divine embodiment of unconditional love and joy.', 'vishnu', 'https://backendapis.saranamayyappa.in/uploads/deities/krishna.jpg', 'krishna.jpg', 'krishna, gopala, kanha, vasudeva, madhava, mukunda', 0, 8, 1),
(9, 'rama', 'Sri Rama', 'శ్రీ సీతారామ చంద్రులు', 'ஸ்ரீ ராமர்', 'ಶ್ರೀ ರಾಮ', 'श्री राम', 'Maryada Purushottama Sri Rama, the epitome of righteousness, truth, and ideal conduct.', 'vishnu', 'https://backendapis.saranamayyappa.in/uploads/deities/rama.jpg', 'rama.jpg', 'ram, rama, raghava, sitaram, maryada purushottam, kalyana rama', 0, 9, 1),
(10, 'hanuman', 'Lord Hanuman', 'హనుమాన్ స్వామి', 'ஹனுமான்', 'ಹನುಮಂತ', 'हनुमान जी', 'Sankat Mochan Lord Hanuman, supreme devotee of Sri Rama and embodiment of immense strength, humility, and unwavering devotion.', 'others', 'https://backendapis.saranamayyappa.in/uploads/deities/hanuman.jpg', 'hanuman.jpg', 'hanuman, anjaneya, maruti, bajrangbali, pavanputra, sankatmochan', 0, 10, 1),
(11, 'durga', 'Goddess Durga', 'దుర్గా భవానీ', 'துர்கா தேவி', 'ದುರ್ಗಾ ದೇವಿ', 'दुर्गा माता', 'Goddess Durga, Mahishasuramardini, the invincible protector who destroys evil and safeguards the righteous.', 'devi', 'https://backendapis.saranamayyappa.in/uploads/deities/durga.jpg', 'durga.jpg', 'durga, sherawali, bhavani, mahishasuramardini, chandi, jagadamba', 0, 11, 1),
(12, 'parvati', 'Goddess Parvati', 'పార్వతీ దేవి', 'பார்வதி', 'ಪಾರ್ವತಿ', 'पार्वती माता', 'Goddess Parvati, gentle and nurturing consort of Lord Shiva and divine mother of Ganesha and Murugan.', 'shiva', 'https://backendapis.saranamayyappa.in/uploads/deities/goddess_devi.png', 'goddess_devi.png', 'parvati, gouri, girija, uma, shiva parvati, annapurna', 0, 12, 1),
(13, 'lakshmi', 'Goddess Lakshmi', 'మహాలక్ష్మి దేవి', 'லட்சுமி தேவி', 'ಲಕ್ಷ್ಮೀ ದೇವಿ', 'महालक्ष्मी', 'Goddess Lakshmi, bestower of wealth, prosperity, auspiciousness, and spiritual abundance.', 'devi', 'https://backendapis.saranamayyappa.in/uploads/deities/goddess_devi.png', 'goddess_devi.png', 'lakshmi, laxmi, sri, padma, dhanalakshmi, chanchala', 0, 13, 1),
(14, 'saraswati', 'Goddess Saraswati', 'సరస్వతీ దేవి', 'சரஸ்வதி', 'ಸರಸ್ವತಿ', 'मां सरस्वती', 'Goddess Saraswati, deity of wisdom, arts, music, education, and eloquence.', 'devi', 'https://backendapis.saranamayyappa.in/uploads/deities/goddess_devi.png', 'goddess_devi.png', 'saraswati, sharada, vidya, veena vani, vagdevi', 0, 14, 1),
(15, 'kali', 'Maa Kali', 'కాళికా దేవి', 'காளி மாதா', 'ಕಾಳಿ ದೇವಿ', 'काली माता', 'Maa Kali, the fierce form of Adi Shakti who annihilates ego, darkness, and negative forces.', 'devi', 'https://backendapis.saranamayyappa.in/uploads/deities/durga.jpg', 'durga.jpg', 'kali, mahakali, kalika, bhadrakali, chamunda', 0, 15, 1),
(16, 'narasimha', 'Lord Narasimha', 'లక్ష్మీ నరసింహ స్వామి', 'நரசிம்மர்', 'ನರಸಿಂಹ', 'नरसिंह भगवान', 'Lord Narasimha, ferocious yet deeply compassionate protector of his devotee Prahlada.', 'vishnu', 'https://backendapis.saranamayyappa.in/uploads/deities/venkateswara.jpg', 'venkateswara.jpg', 'narasimha, simhadri, panchamukha, prahlada varada', 0, 16, 1),
(17, 'saibaba', 'Shirdi Sai Baba', 'షిర్డీ సాయి బాబా', 'சாயி பாபா', 'ಸಾಯಿ ಬಾಬಾ', 'साईं बाबा', 'Shirdi Sai Baba, saint and avatar who preached Shraddha (faith) and Saburi (patience) and unity of all humanity.', 'others', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_ayyappa.png', 'lord_ayyappa.png', 'saibaba, sai, shirdi, sadguru, samartha sadguru', 0, 17, 1),
(18, 'dattatreya', 'Lord Dattatreya', 'శ్రీ దత్తాత్రేయ స్వామి', 'தத்தாத்ரேயர்', 'ದತ್ತಾತ್ರೇಯ', 'दत्तात्रेय भगवान', 'Lord Dattatreya, divine synthesis of Brahma, Vishnu, and Shiva (Trimurti) and primordial teacher (Adi Guru).', 'others', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_shiva.png', 'lord_shiva.png', 'datta, dattatreya, guru datta, avadhuta', 0, 18, 1),
(19, 'surya', 'Surya Bhagavan', 'సూర్య భగవాన్', 'சூரிய பகவான்', 'ಸೂರ್ಯ ಭಗವಾನ್', 'सूर्य देव', 'Pratyaksha Daivam Surya Bhagavan, the life-giving sun god who dispels ignorance and nourishes all living beings.', 'others', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_vishnu.png', 'lord_vishnu.png', 'surya, sun, aditya, bhaskar, ravaye, pratyaksha daivam', 0, 19, 1),
(20, 'bhairava', 'Kala Bhairava', 'కాల భైరవ స్వామి', 'கால பைரவர்', 'ಕಾಲ ಭೈರವ', 'काल भैरव', 'Kala Bhairava, fierce guardian deity (Kshetrapala) who controls time and dispels fear and enemies.', 'shiva', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_shiva.png', 'lord_shiva.png', 'bhairava, kala bhairava, batuk bhairav, kshetrapala', 0, 20, 1),
(21, 'subrahmanya', 'Sri Subrahmanya Swamy', 'శ్రీ సుబ్రహ్మణ్య స్వామి', 'சுப்பிரமணியர்', 'ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ', 'सुब्रह्मण्य स्वामी', 'Sri Subrahmanya Swamy, son of Shiva and Parvati, riding the celestial peacock and wielding the sacred Vel.', 'popular', 'https://backendapis.saranamayyappa.in/uploads/deities/lord_murugan.png', 'lord_murugan.png', 'subrahmanya, saravana, kartikeya, dhandayuthapani', 0, 21, 1)
ON DUPLICATE KEY UPDATE `slug`=VALUES(`slug`), `name`=VALUES(`name`), `telugu_name`=VALUES(`telugu_name`), `tamil_name`=VALUES(`tamil_name`), `kannada_name`=VALUES(`kannada_name`), `hindi_name`=VALUES(`hindi_name`), `description`=VALUES(`description`), `category`=VALUES(`category`), `image_url`=VALUES(`image_url`), `image_name`=VALUES(`image_name`), `aliases`=VALUES(`aliases`), `is_featured`=VALUES(`is_featured`), `order_index`=VALUES(`order_index`), `is_active`=VALUES(`is_active`);
