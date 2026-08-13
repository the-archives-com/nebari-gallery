import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account",
        "/accept-invite",
        "/forgot-password",
        "/update-password",
        "/login",
      ],
    },

    sitemap:
      "https://www.nebari.com.au/sitemap.xml",

    host:
      "https://www.nebari.com.au",
  };
}