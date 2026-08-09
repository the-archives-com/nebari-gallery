import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Local Legend",
    short_name: "Local Legend",
    description:
      "Notice places, preserve moments, and remember what made you stop.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#292524",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}