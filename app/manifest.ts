import type { MetadataRoute } from "next";

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name: "Studio Nebari",
    short_name: "Nebari",
    description:
      "A quiet place for meaningful work.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5ee",
    theme_color: "#f8f5ee",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}