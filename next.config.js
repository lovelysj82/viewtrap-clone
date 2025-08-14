/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'yt3.ggpht.com'],
  },
  env: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig