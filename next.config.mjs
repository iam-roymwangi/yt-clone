/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "youtubei.js",
      "youtube-ext",
      "youtube-search-api",
      "@distube/ytdl-core",
      "yt-search",
      "cheerio",
    ],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
