import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/scroll-to-top";
import PageTransition from "@/components/page-transition";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Imperfect Bakers",
  description: "A boutique cooking school where kids and adults build culinary confidence through joyful, hands-on kitchen experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ScrollToTop />
        <Nav />
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        <Footer />
      </body>
    </html>
  );
}
