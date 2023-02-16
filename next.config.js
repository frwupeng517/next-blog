/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    domains: ['img.mukewang.com'],
  },
};

const removeImports = require('next-remove-imports')();

module.exports = removeImports(nextConfig);
