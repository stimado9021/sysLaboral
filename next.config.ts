// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@neondatabase/serverless'],
  // Silences the Next.js 15 Turbopack warning when using next-pwa
  turbopack: {},
}

module.exports = withPWA(nextConfig)