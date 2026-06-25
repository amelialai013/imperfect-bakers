import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#2d5a3d] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 font-bold text-xl mb-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-base">
              🍳
            </span>
            Imperfect Bakers
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Building confidence in the kitchen, one messy masterpiece at a time. Because the best food is made with love — and a little bit of chaos.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/classes" className="hover:text-white transition-colors">Our Classes</Link></li>
            <li><Link href="/book-a-class" className="hover:text-white transition-colors">Book a Class</Link></li>
            <li><Link href="/interest" className="hover:text-white transition-colors">Register Interest</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-4">Get in Touch</h3>
          <p className="text-sm text-white/80 mb-2">imperfectbakers@outlook.com</p>
          <p className="text-sm text-white/80">
            Follow us on social media!{" "}
            <span className="text-white font-medium">@imperfectbakers</span>
          </p>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs text-white/50">
        Made with ❤️ by Imperfect Bakers © 2026
      </div>
    </footer>
  );
}
