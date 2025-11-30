/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Permettre les WebSocket
    webpack: (config) => {
        config.externals.push({
            'ws': 'ws'
        });
        return config;
    }
};

module.exports = nextConfig;
