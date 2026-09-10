const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite uses a WebAssembly worker on web. Metro does not include .wasm
// assets by default, so it otherwise fails while resolving wa-sqlite.wasm.
config.resolver.assetExts.push('wasm');

module.exports = config;
