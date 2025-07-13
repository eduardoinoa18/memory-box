const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for production
config.transformer = {
    ...config.transformer,
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
        keep_fnames: true,
        mangle: {
            keep_fnames: true,
        },
        // Enable tree shaking
        unused: true,
    },
};

// Enable tree shaking for better bundle size
config.resolver = {
    ...config.resolver,
    alias: {
        // Add any aliases here if needed
    },
};

module.exports = config;
