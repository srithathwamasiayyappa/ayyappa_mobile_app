const fs = require('fs');
const path = require('path');

const templesDataPath = path.resolve(__dirname, '../apps/mobile/src/data/templesData.ts');
const content = fs.readFileSync(templesDataPath, 'utf8');

const match = content.match(/export const MASTER_TEMPLES: TempleItem\[\] = (\[[\s\S]*?\]);\s*$/);
if (!match) {
  console.error('Could not find MASTER_TEMPLES in templesData.ts');
  process.exit(1);
}

// Strip typescript imports/types
const cleanJs = match[1]
  .replace(/import .*/g, '')
  .replace(/as const/g, '');

const temples = eval(cleanJs);

let sql = '-- ================================================================\n';
sql += '-- Saranam Ayyappa: Temples Table Creation & Seed Data\n';
sql += '-- ================================================================\n\n';

sql += 'CREATE TABLE IF NOT EXISTS `temples` (\n';
sql += '  `id` INT NOT NULL AUTO_INCREMENT,\n';
sql += '  `slug` VARCHAR(100) NOT NULL,\n';
sql += '  `name` VARCHAR(255) NOT NULL,\n';
sql += '  `local_names_json` TEXT NULL,\n';
sql += '  `deity_id` VARCHAR(50) NOT NULL,\n';
sql += '  `deity_name` VARCHAR(100) NULL,\n';
sql += '  `city` VARCHAR(100) NOT NULL,\n';
sql += '  `district` VARCHAR(100) NULL,\n';
sql += '  `state` VARCHAR(100) NOT NULL,\n';
sql += '  `country` VARCHAR(100) NOT NULL DEFAULT "India",\n';
sql += '  `address` VARCHAR(500) NULL,\n';
sql += '  `pincode` VARCHAR(20) NULL,\n';
sql += '  `latitude` DOUBLE NULL,\n';
sql += '  `longitude` DOUBLE NULL,\n';
sql += '  `thumbnail_url` VARCHAR(500) NULL,\n';
sql += '  `hero_image_url` VARCHAR(500) NULL,\n';
sql += '  `about` TEXT NOT NULL,\n';
sql += '  `history` TEXT NULL,\n';
sql += '  `speciality_json` TEXT NULL,\n';
sql += '  `timings_json` TEXT NULL,\n';
sql += '  `contact_json` TEXT NULL,\n';
sql += '  `live_stream_id` VARCHAR(100) NULL,\n';
sql += '  `has_live_darshan` TINYINT(1) NOT NULL DEFAULT 0,\n';
sql += '  `crop_index` INT NOT NULL DEFAULT 0,\n';
sql += '  `is_active` TINYINT(1) NOT NULL DEFAULT 1,\n';
sql += '  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),\n';
sql += '  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),\n';
sql += '  PRIMARY KEY (`id`),\n';
sql += '  UNIQUE KEY `temples_slug_key` (`slug`),\n';
sql += '  KEY `temples_deity_id_idx` (`deity_id`),\n';
sql += '  KEY `temples_state_idx` (`state`),\n';
sql += '  KEY `temples_is_active_idx` (`is_active`)\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';

function escapeSql(val) {
  if (val === undefined || val === null) return 'NULL';
  const str = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${str}'`;
}

for (const t of temples) {
  const localNames = escapeSql(JSON.stringify(t.localNames || {}));
  const speciality = escapeSql(JSON.stringify(t.speciality || []));
  const timings = escapeSql(JSON.stringify(t.timings || {}));
  const contact = escapeSql(JSON.stringify(t.contact || {}));

  sql += `INSERT INTO \`temples\` (\`slug\`, \`name\`, \`local_names_json\`, \`deity_id\`, \`deity_name\`, \`city\`, \`district\`, \`state\`, \`country\`, \`address\`, \`pincode\`, \`latitude\`, \`longitude\`, \`thumbnail_url\`, \`hero_image_url\`, \`about\`, \`history\`, \`speciality_json\`, \`timings_json\`, \`contact_json\`, \`live_stream_id\`, \`has_live_darshan\`, \`crop_index\`, \`is_active\`)
VALUES (${escapeSql(t.id)}, ${escapeSql(t.name)}, ${localNames}, ${escapeSql(t.deityId)}, ${escapeSql(t.deityName)}, ${escapeSql(t.city)}, ${escapeSql(t.district)}, ${escapeSql(t.state)}, ${escapeSql(t.country || 'India')}, ${escapeSql(t.address)}, ${escapeSql(t.pincode)}, ${t.latitude || 'NULL'}, ${t.longitude || 'NULL'}, ${escapeSql(t.thumbnailUrl)}, ${escapeSql(t.heroImageUrl)}, ${escapeSql(t.about)}, ${escapeSql(t.history)}, ${speciality}, ${timings}, ${contact}, ${escapeSql(t.liveStreamId)}, ${t.hasLiveDarshan ? 1 : 0}, ${t.cropIndex ?? 0}, 1)
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`local_names_json\` = VALUES(\`local_names_json\`), \`about\` = VALUES(\`about\`);\n\n`;
}

const outputPath = path.resolve(__dirname, 'seed_temples.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated ${outputPath} with ${temples.length} temples successfully!`);
