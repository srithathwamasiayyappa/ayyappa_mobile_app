// cPanel CloudLinux Passenger Entry Point
// Saranam Ayyappa Backend API
const path = require('path');
const fs = require('fs');

// Ensure working directory is always application directory so .env is reliably resolved
try {
  process.chdir(__dirname);
} catch (e) {}

// Pre-load .env explicitly with absolute path before booting NestJS
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {}

if (fs.existsSync(path.join(__dirname, 'dist', 'main.js'))) {
  require('./dist/main.js');
} else if (fs.existsSync(path.join(__dirname, 'dist', 'src', 'main.js'))) {
  require('./dist/src/main.js');
} else {
  console.error('Cannot find dist/main.js in', __dirname);
}
