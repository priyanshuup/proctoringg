/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  compress: false,
  poweredByHeader: false,
  generateEtags: true,
  distDir: '.next',
  httpAgentOptions: {
    keepAlive: true,
  },
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  images: {
    loader: 'custom',
  },
  basePath:'',
  assetPrefix:'', // Removed the trailing slash
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {
      '/': { page: '/' },
    }
  },
  webpack: (config, options) => {
    config.module.rules.push({ test: /human.esm.js/, type: 'javascript/esm' });
    return config
  },
};
