const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Only watch the mobile app project directory
// (Prevents Metro FallbackWatcher from crawling monorepo root, node_modules/.pnpm android builds, api, admin-panel, etc.)
config.watchFolders = [projectRoot];

// 2. Exclude native build outputs, android, ios, and gradle directories from resolver
config.resolver.blockList = [
  /.*[/\\]android[/\\]app[/\\]build[/\\].*/,
  /.*[/\\]android[/\\]\.gradle[/\\].*/,
  /.*[/\\]ios[/\\]build[/\\].*/,
  /.*[/\\]\.expo[/\\].*/,
];

// 3. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Enable SVG / module extensions
config.resolver.sourceExts.push('mjs', 'cjs');

// Enable audio and media asset extensions
config.resolver.assetExts.push('mp3', 'mpeg', 'wav', 'm4a');

// Prevent OneDrive / Windows EBUSY and UNKNOWN (-4094) file lock crashes
config.maxWorkers = 2;

module.exports = config;
