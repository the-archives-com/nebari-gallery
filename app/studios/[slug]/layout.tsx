import type { Metadata } from "next";

import { supabaseAdmin } from "../../../lib/supabase-admin";

type StudioLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: StudioLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: studio } =
    await supabaseAdmin
      .from("studios")
      .select(
        "slug, name, owner, description",
      )
      .eq("slug", slug)
      .maybeSingle();

  if (!studio) {
    return {
      title: "Studio",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    studio.description?.trim() ||
    `Explore photography, artwork and works in progress from 
${studio.owner || studio.name} at Studio Nebari.`;

  return {
    title: studio.name,

    description,

    alternates: {
      canonical:
        `/studios/${studio.slug}`,
    },

    openGraph: {
      type: "website",
      url:
        `/studios/${studio.slug}`,
      title:
        `${studio.name} | Studio Nebari`,
      description,
    },

    twitter: {
      card: "summary_large_image",
      title:
        `${studio.name} | Studio Nebari`,
      description,
    },
  };
}

export default async function StudioLayout({
  children,
}: StudioLayoutProps) {
  return children;
}
