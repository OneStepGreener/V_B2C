const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8081,
    host: '0.0.0.0', // Allow connections from any IP
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
