import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",

  description:
    "Explore selected photography, artwork and works in progress from creative Studios across Studio Nebari.",

  alternates: {
    canonical: "/gallery",
  },

  openGraph: {
    title: "Gallery | Studio Nebari",
    description:
      "Explore selected photography, artwork and works in progress from creative Studios across Studio Nebari.",
    url: "/gallery",
  },

  twitter: {
    card: "summary_large_image",
    title: "Gallery | Studio Nebari",
    description:
      "Explore selected photography, artwork and works in progress from creative Studios across Studio Nebari.",
  },
};

export default function GalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}