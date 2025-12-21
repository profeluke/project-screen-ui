const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure Reanimated to disable strict mode warnings
config.resolver.alias = {
  ...config.resolver.alias,
};

// Add global configuration for react-native-reanimated
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = config; 