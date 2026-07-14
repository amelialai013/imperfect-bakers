import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans } from "next/font/google";
import Script from "next/script";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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
    <html lang="en" className={`${inter.variable} ${dmSans.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/* Sets --full-vw to the scrollbar-corrected viewport width, used by the
            private-bookings CTA sections to align their edge padding exactly with
            the footer's content column — plain 100vw overcounts by the scrollbar's
            width, which mx-auto centering (footer) doesn't. beforeInteractive so it
            runs before first paint and there's no flash of misaligned padding. */}
        <Script id="full-vw" strategy="beforeInteractive">
          {`
            (function () {
              function setFullVw() {
                document.documentElement.style.setProperty('--full-vw', document.documentElement.clientWidth + 'px');
              }
              setFullVw();
              window.addEventListener('resize', setFullVw);
            })();
          `}
        </Script>
        <ScrollToTop />
        <Nav />
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        <Footer />
      </body>
    </html>
  );
}
