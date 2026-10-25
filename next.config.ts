import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.8"],
  experimental: {
    useTypeScriptCli: false,
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prodimages.metro-online.pk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "metro-online.pk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "0zoebkg72rblccp0.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/product/ok-water-350ml-x12",
        destination: "/product/ok-water?variant=ok-wtr-350",
        permanent: true,
      },
      {
        source: "/product/ok-water-1-5l-x6",
        destination: "/product/ok-water?variant=ok-wtr-1500",
        permanent: true,
      },
      {
        source: "/product/ok-water-500ml-x12",
        destination: "/product/ok-water?variant=ok-wtr-500",
        permanent: true,
      },
      {
        source: "/product/fine-life-tea-85g",
        destination: "/product/fine-life-tea?variant=flt-85",
        permanent: true,
      },
      {
        source: "/product/fine-life-tea-170g",
        destination: "/product/fine-life-tea?variant=flt-170",
        permanent: true,
      },
      {
        source: "/product/fine-life-tea-430g",
        destination: "/product/fine-life-tea?variant=flt-430",
        permanent: true,
      },
      {
        source: "/product/fine-life-tea-900g",
        destination: "/product/fine-life-tea?variant=flt-900",
        permanent: true,
      },
      {
        source: "/product/ok-detergent-180g",
        destination: "/product/ok-detergent?variant=ok-det-180",
        permanent: true,
      },
      {
        source: "/product/ok-detergent-500g",
        destination: "/product/ok-detergent?variant=ok-det-500",
        permanent: true,
      },
      {
        source: "/product/ok-detergent-1kg",
        destination: "/product/ok-detergent?variant=ok-det-1000",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
