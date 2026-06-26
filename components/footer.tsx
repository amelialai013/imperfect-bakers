import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0e1f18] text-white border-t-2 border-[#c9a96e]">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white text-sm font-bold"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                IB
              </span>
              <span className="font-bold text-lg tracking-wide"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Imperfect Bakers
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Building confidence in the kitchen, one imperfect masterpiece at a time. Because the best food is made with love — and a little chaos.
            </p>
            <p className="mt-6 text-xs tracking-widest uppercase text-[#c9a96e]">@imperfectbakers</p>
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
                { label: "Our Classes",       href: "/classes" },
                { label: "Book a Class",      href: "/book-a-class" },
                { label: "Register Interest", href: "/interest" },
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
            <h4 className="text-xs tracking-[0.2em] uppercase text-white/40 mb-5">Get in Touch</h4>
            <a
              href="mailto:imperfectbakers@outlook.com"
              className="text-sm text-white/60 hover:text-white transition-colors block mb-4 break-all"
            >
              imperfectbakers@outlook.com
            </a>
            <div className="w-8 h-px bg-[#c9a96e] mb-4" />
            <p className="text-xs text-white/40 leading-relaxed">
              Follow along on social for behind-the-scenes kitchen moments.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 Imperfect Bakers. All rights reserved.</p>
          <p className="text-xs text-white/20">Made with love in Melbourne</p>
        </div>
      </div>
    </footer>
  );
}
