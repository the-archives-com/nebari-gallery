import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nebari.com.au"),

  title: {
    default: "Studio Nebari",
    template: "%s | Studio Nebari",
  },

  applicationName: "Studio Nebari",

  description:
    "A shared gallery of photography, artwork and works in progress from personal creative Studios.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "https://www.nebari.com.au",
    siteName: "Studio Nebari",
    title: "Studio Nebari",
    description:
      "A shared gallery of photography, artwork and works in progress from personal creative Studios.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Studio Nebari",
    description:
      "A shared gallery of photography, artwork and works in progress from personal creative Studios.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  appleWebApp: {
    capable: true,
    title: "Studio Nebari",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}