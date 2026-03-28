import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tax Wizard — Indian Income Tax Calculator FY 2026-27",
  description:
    "Compare Old vs New tax regimes instantly. Smart Indian income tax calculator for FY 2026-27 with detailed slab breakdown, 87A rebate, and regime recommendation.",
  keywords: [
    "income tax calculator",
    "india tax",
    "old regime",
    "new regime",
    "FY 2026-27",
    "tax wizard",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-body">{children}</body>
    </html>
  );
}
