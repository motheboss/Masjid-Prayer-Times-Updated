import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, Amiri } from "next/font/google";
import "./globals.css";

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
});

const arabic = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Masjid Prayer Display",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} ${arabic.variable}`}>
        {children}
      </body>
    </html>
  );
}
