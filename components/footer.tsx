import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white border-t-2 border-[#006644]">
      <div className="max-w-7xl mx-auto px-8 pt-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#006644] text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
                  <line x1="12" y1="3" x2="12" y2="5" />
                  <path d="M6 8 Q12 5 18 8" />
                  <rect x="5" y="8" width="14" height="10" rx="2" />
                  <line x1="5" y1="11" x2="3" y2="11" />
                  <line x1="19" y1="11" x2="21" y2="11" />
                </svg>
              </span>
              <span className="font-bold text-lg tracking-tight"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Imperfect Bakers
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Building confidence in the kitchen, one imperfect masterpiece at a time. Because the best food is made with love — and a little chaos.
            </p>
            <p className="mt-6 text-xs tracking-widest uppercase text-white">@imperfectbakers</p>
          </div>

          {/* Spacer */}
          <div className="md:col-span-1" />

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs tracking-[0.2em] uppercase text-white/40 mb-5">Navigate</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Home",              href: "/" },
                { label: "About",             href: "/about" },
                { label: "Our classes",       href: "/classes" },
                { label: "Book a class",      href: "/book-a-class" },
                { label: "Register interest", href: "/interest" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-xs tracking-[0.2em] uppercase text-white/40 mb-5">Get in touch</h4>
            <a
              href="mailto:imperfectbakers@outlook.com"
              className="text-sm text-white/60 hover:text-white transition-colors block mb-4 break-all"
            >
              imperfectbakers@outlook.com
            </a>
            <p className="text-xs text-white/40 leading-relaxed">
              Follow along on social for behind-the-scenes kitchen moments.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 Imperfect Bakers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
