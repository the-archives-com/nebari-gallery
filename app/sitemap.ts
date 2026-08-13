import type { MetadataRoute } from "next";

import { supabaseAdmin } from "../lib/supabase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    "https://www.nebari.com.au";

  /*
   * Main public Nebari pages
   */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/gallery`,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/studios`,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },

    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  /*
   * Public Studio pages
   */
  const {
    data: studios,
    error: studioError,
  } = await supabaseAdmin
    .from("studios")
    .select(
      "slug, created_at",
    )
    .order("created_at", {
      ascending: false,
    });

  if (studioError) {
    console.error(
      "Could not add Studios to sitemap:",
      studioError,
    );
  }

  const studioPages: MetadataRoute.Sitemap =
    (studios ?? []).map(
      (studio) => ({
        url:
          `${baseUrl}/studios/${studio.slug}`,

        lastModified:
          studio.created_at
            ? new Date(
                studio.created_at,
              )
            : undefined,

        changeFrequency:
          "weekly",

        priority: 0.8,
      }),
    );

  /*
   * Individual artwork pages
   */
  const {
    data: artworks,
    error: artworkError,
  } = await supabaseAdmin
    .from("studio_artworks")
    .select(
      "id, studio_slug, created_at",
    )
    .order("created_at", {
      ascending: false,
    });

  if (artworkError) {
    console.error(
      "Could not add artwork to sitemap:",
      artworkError,
    );
  }

  const artworkPages: MetadataRoute.Sitemap =
    (artworks ?? []).map(
      (artwork) => ({
        url:
          `${baseUrl}/studios/${artwork.studio_slug}/artwork/${artwork.id}`,

        lastModified:
          artwork.created_at
            ? new Date(
                artwork.created_at,
              )
            : undefined,

        changeFrequency:
          "monthly",

        priority: 0.7,
      }),
    );

  return [
    ...staticPages,
    ...studioPages,
    ...artworkPages,
  ];
}