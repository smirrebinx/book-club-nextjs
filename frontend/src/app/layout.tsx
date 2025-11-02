import { Geist, Geist_Mono, Merriweather, Playfair_Display } from "next/font/google";

import Navbar from "@/components/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { ToastProvider } from "@/components/Toast";

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

const merriweather = Merriweather({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProviderWrapper>
          <ToastProvider>
            <Navbar />
            {children}
          </ToastProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
