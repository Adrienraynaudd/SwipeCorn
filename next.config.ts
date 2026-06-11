import type { NextConfig } from "next";

const withBundleAnalyser = require("@next/bundle-analyzer")({
    enable: process.env.ANALYSE ==="true",
})

const nextConfig: NextConfig = withBundleAnalyser( {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "image.tmdb.org",
                pathname: "/t/p/**",
            },
        ],
    },
});

export default nextConfig;
