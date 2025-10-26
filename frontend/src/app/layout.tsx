import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";

import type { Metadata } from "next";

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
  title: "Barnfria bokklubben",
  description: "Barnfria bokklubben. Här kan du se vilka böcker vi har läst, lägga till egna boktips och rösta på nästa bok att läsa. Information om kommande bokträffar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
