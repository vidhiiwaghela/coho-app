import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A1120",
};

export const metadata: Metadata = {
  title: "CoHo (Cookie) | Modern Housing Society & RWA Management",
  description:
    "Unified residential society portal for maintenance payments, document vault, dated rules database, AI-powered meeting summaries, and community notices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0A1120" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A1120] text-[#F3F5F9] antialiased selection:bg-[#EFE4CC] selection:text-[#0A1120]">
        {children}
      </body>
    </html>
  );
}
