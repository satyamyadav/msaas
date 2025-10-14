import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

import { SiteFooter } from "@components/sections/site-footer";
import { SiteHeader } from "@components/sections/site-header";
import { ThemeProvider } from "@components/theme-provider";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UrlCraft | Branded Link Shortening for Modern Teams",
  description:
    "UrlCraft helps growth teams shorten, track, and optimize every branded link with real-time analytics and collaboration tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
