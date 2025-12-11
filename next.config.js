/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['undici', 'cheerio'],
    experimental: {
        serverComponentsExternalPackages: ['cheerio'],
    },
};

module.exports = nextConfig;
