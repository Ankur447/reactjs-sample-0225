import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'pbs.twimg.com',
        },
        {
            protocol: 'https',
            hostname: 'a.storyblok.com',
        }
    ]
}
};

export default nextConfig;
