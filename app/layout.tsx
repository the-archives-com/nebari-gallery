import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Geist,
} from "next/font/google";

import "./globals.css";


const geist = Geist({
  variable: "--font-nebari-sans",
  subsets: ["latin"],
});


const cormorant = Cormorant_Garamond({
  variable: "--font-nebari-serif",
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
  ],
});


export const metadata: Metadata = {
  title: {
    default: "Studio Nebari",
    template: "%s · Studio Nebari",
  },

  description:
    "A quiet corner for creating, observing and growing.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}