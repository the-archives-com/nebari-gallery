import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studios",

  description:
    "Discover personal creative Studios at Studio Nebari and see recent photography, artwork and projects in progress.",

  alternates: {
    canonical: "/studios",
  },

  openGraph: {
    title: "Studios | Studio Nebari",
    description:
      "Discover personal creative Studios at Studio Nebari and see recent photography, artwork and projects in progress.",
    url: "/studios",
  },

  twitter: {
    card: "summary_large_image",
    title: "Studios | Studio Nebari",
    description:
      "Discover personal creative Studios at Studio Nebari and see recent photography, artwork and projects in progress.",
  },
};

export default function StudiosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}