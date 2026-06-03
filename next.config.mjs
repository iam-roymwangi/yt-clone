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
    outputFileTracingExcludes: {
      "*": ["./public/videos/**"],
    },
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
