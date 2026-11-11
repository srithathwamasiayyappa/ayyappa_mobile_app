const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable SVG / asset extensions if needed
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
