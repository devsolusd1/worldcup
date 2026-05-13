import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://worldcupraydium.fun";
const SITE_NAME = "World Cup Raydium";
const SITE_DESCRIPTION =
  "48 country meme coins for the 2026 FIFA World Cup, launched on Raydium Launchlab. Every mint address ends in CUP.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 48 country coins for the 2026 World Cup`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Solana",
    "memecoin",
    "World Cup",
    "Copa do Mundo",
    "2026",
    "Launchlab",
    "Raydium",
    "CUP",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    site: "@WorldCupRay",
    creator: "@WorldCupRay",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#04080c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
