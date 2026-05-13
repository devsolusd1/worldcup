import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://cupcoins.fun";
const SITE_NAME = "CUP Coins";
const SITE_DESCRIPTION =
  "Country meme coins for the 2026 World Cup. 48 nations, one ticker suffix: CUP. Live market data, launched on Raydium Launchlab.";

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
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050a08",
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
