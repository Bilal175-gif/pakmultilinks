import type { MetadataRoute } from "next";
import { getSiteOrigin, isPublicSiteConfigured } from "@/lib/seo";

const disallowedPaths = [
  "/admin",
  "/account",
  "/api",
  "/checkout",
  "/order-confirmation",
  "/login",
  "/register",
  "/forgot-password",
];

const aiBots = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  if (!isPublicSiteConfigured()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: ["/", "/llms.txt", "/shop", "/brand", "/product", "/rate-list", "/about", "/contact", "/faq", "/blog"],
        disallow: disallowedPaths,
      })),
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
