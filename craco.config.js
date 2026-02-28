module.exports = {
  webpack: {
    configure: (webpackConfig) => {

      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Can't resolve 'fs'/
      ];

      return webpackConfig;
    },
  },
};