import type { Metadata } from "next";

import { supabaseAdmin } from "../../../../../lib/supabase-admin";

type ArtworkLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ArtworkLayoutProps): Promise<Metadata> {
  const { slug, id } = await params;

  const [
    artworkResult,
    studioResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("studio_artworks")
      .select(
        "id, title, description, image_url, category, studio_slug",
      )
      .eq("id", id)
      .eq("studio_slug", slug)
      .maybeSingle(),

    supabaseAdmin
      .from("studios")
      .select(
        "slug, name, owner",
      )
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  const artwork =
    artworkResult.data;

  const studio =
    studioResult.data;

  if (!artwork || !studio) {
    return {
      title: "Artwork",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    artwork.description?.trim() ||
    `${artwork.title} from ${studio.name} at Studio Nebari.`;

  const artworkUrl =
    `/studios/${studio.slug}/artwork/${artwork.id}`;

  return {
    title:
      `${artwork.title} | ${studio.name}`,

    description,

    alternates: {
      canonical:
        artworkUrl,
    },

    openGraph: {
      type: "article",

      url:
        artworkUrl,

      title:
        `${artwork.title} | ${studio.name} | Studio Nebari`,

      description,

      images: [
        {
          url:
            artwork.image_url,

          alt:
            artwork.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title:
        `${artwork.title} | ${studio.name} | Studio Nebari`,

      description,

      images: [
        artwork.image_url,
      ],
    },
  };
}

export default function ArtworkLayout({
  children,
}: ArtworkLayoutProps) {
  return children;
}