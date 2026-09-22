import type { Metadata, Viewport } from "next";
import fs from "fs";
import path from "path";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0E1420",
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
  // Inline the real animated SVG logo from public/coho-splash-logo.svg
  const splashLogoSvg = fs.readFileSync(
    path.join(process.cwd(), "public", "coho-splash-logo.svg"),
    "utf8"
  );

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0E1420" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0E1420] text-[#F5F1E8] antialiased selection:bg-[#E8B565] selection:text-[#0E1420]">
        {/* Animated CoHo Splash Screen (Mobile-App Shell, instant HTML paint before JS bundle loads) */}
        <div id="splash" aria-hidden="true">
          <div className="splash-frame">
            <div
              className="center"
              dangerouslySetInnerHTML={{ __html: splashLogoSvg }}
            />

            <div className="footer">
              <div className="splash-loader">
                <div className="splash-loader-bar" />
              </div>
              <div className="splash-tagline">Your society, together</div>
            </div>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}
