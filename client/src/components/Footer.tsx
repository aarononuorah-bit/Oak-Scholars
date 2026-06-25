import { Link } from "wouter";
import { Mail, MapPin, Phone } from "lucide-react";

const LOGO_URL = "https://framerusercontent.com/images/V6mG3N1n6Kz8Z2z5H8f0y3w.png";

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      {/* Top divider accent */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(to right, transparent, #E8A838, transparent)" }} />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand + contact */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={LOGO_URL} alt="Oak Scholars" className="h-8 w-auto object-contain" />
              <span className="font-serif font-bold text-xl text-amber uppercase tracking-wide whitespace-nowrap">
                Oak Scholars
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              Expert support for ambitious students from 11+ through A-Level and IB. Run by undergraduates who recently aced the same exams.
            </p>

            {/* Contact details */}
            <ul className="space-y-2 mb-6">
              <li>
                <a
                  href="mailto:hello@oakscholars.co.uk"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-amber transition-colors duration-200 group"
                >
                  <Mail size={14} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  hello@oakscholars.co.uk
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-white/60">
                  <MapPin size={14} className="flex-shrink-0" />
                  United Kingdom — Online sessions nationwide
                </span>
              </li>
            </ul>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                {
                  label: "Instagram",
                  href: "https://instagram.com/oakscholars",
                  icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
                },
                {
                  label: "TikTok",
                  href: "https://tiktok.com/@oakscholars",
                  icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>,
                },
                {
                  label: "LinkedIn",
                  href: "https://linkedin.com/company/oakscholars",
                  icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-amber hover:border-amber/40 hover:bg-amber/10 transition-all duration-200 hover:-translate-y-0.5"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-5 text-base">Services</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "1:1 Tuition", href: "/#services" },
                { label: "Study Resources", href: "/study-resources" },
                { label: "Academic Support", href: "/support-guidance" },
                { label: "Wellbeing Support", href: "/support-guidance#wellbeing" },
                { label: "Pricing", href: "/#pricing" },
                { label: "Book a Session", href: "/booking" },
                { label: "Become an Oak Scholar", href: "/tutor-apply" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-amber transition-colors duration-200 hover:translate-x-0.5 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-amber">›</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-5 text-base">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Our Team", href: "/#team" },
                { label: "Our Philosophy", href: "/philosophy" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-amber transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-amber">›</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Quick contact CTA */}
            <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-white/80 text-sm font-semibold mb-1">Got a question?</p>
              <p className="text-white/50 text-xs mb-3">We typically reply within a few hours.</p>
              <a
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber hover:text-amber/80 transition-colors duration-200"
              >
                <Mail size={12} />
                Get in touch →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Oak Scholars Ltd. All rights reserved.
          </p>
          <p className="text-white/40 text-xs text-center">
            Empowering the next generation of learners through peer-led mentorship.
          </p>
          <div className="flex items-center gap-1 text-white/30 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
