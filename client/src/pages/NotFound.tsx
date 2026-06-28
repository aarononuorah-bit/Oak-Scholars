import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, ArrowRight, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const QUICK_LINKS = [
  { label: "Book a Session", href: "/booking", icon: BookOpen },
  { label: "Study Resources", href: "/study-resources", icon: Search },
  { label: "Home", href: "/", icon: Home },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-xl w-full text-center">
          {/* Big 404 */}
          <div
            className="font-serif font-bold leading-none mb-6 select-none"
            style={{
              fontSize: "clamp(6rem, 20vw, 12rem)",
              background: "linear-gradient(135deg, #281A39 0%, #E8A838 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </div>

          {/* Oak Scholars acorn icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #281A39 0%, #3a2547 100%)" }}
            >
              <BookOpen size={28} className="text-amber-400" />
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold text-[#281A39] mb-3">
            Page not found
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md mx-auto">
            Looks like this page has gone off to study somewhere else. Let's get you back on track.
          </p>

          {/* Quick links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  className="w-full sm:w-auto font-semibold gap-2 px-6 py-3"
                  style={
                    href === "/booking"
                      ? { backgroundColor: "#281A39", color: "white" }
                      : { backgroundColor: "white", color: "#281A39", border: "1px solid #e5e7eb" }
                  }
                >
                  <Icon size={16} />
                  {label}
                  {href === "/booking" && <ArrowRight size={14} />}
                </Button>
              </Link>
            ))}
          </div>

          {/* Subtle help text */}
          <p className="text-sm text-gray-400">
            If you believe this is an error, please{" "}
            <Link href="/contact" className="text-[#281A39] font-semibold underline underline-offset-2 hover:text-amber-600 transition-colors">
              contact us
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
