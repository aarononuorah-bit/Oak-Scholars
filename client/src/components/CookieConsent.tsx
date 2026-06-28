import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";

const COOKIE_KEY = "oak_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Slight delay so it doesn't flash immediately on page load
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value: "accepted" | "declined") => {
    setAnimateOut(true);
    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, value);
      setVisible(false);
      setAnimateOut(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed z-[60] transition-all duration-300"
      style={{
        bottom: "1.25rem",
        left: "1rem",
        right: "1rem",
        maxWidth: "420px",
        // On larger screens, pin to bottom-left
        ...(typeof window !== "undefined" && window.innerWidth >= 640 ? { right: "auto" } : {}),
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        animation: animateOut
          ? "cookieSlideDown 300ms cubic-bezier(0.23,1,0.32,1) forwards"
          : "cookieSlideUp 400ms cubic-bezier(0.23,1,0.32,1) forwards",
      }}
    >
      <div
        className="rounded-xl shadow-2xl p-3.5 sm:p-4"
        style={{ backgroundColor: "#281A39", border: "1px solid rgba(232,168,56,0.2)" }}
      >
        <div className="flex items-start gap-3">
          <Cookie size={18} className="text-amber flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold mb-0.5">Cookie Notice</p>
            <p className="text-white/60 text-xs leading-relaxed">
              We use cookies to improve your experience on Oak Scholars.{" "}
              <Link href="/privacy" className="text-amber underline hover:opacity-80 transition-opacity">
                Privacy Policy
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => dismiss("declined")}
              className="border-white/20 text-white/70 bg-transparent hover:bg-white/10 text-xs h-8 px-3 transition-all duration-200"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => dismiss("accepted")}
              className="text-xs font-semibold btn-press h-8 px-3"
              style={{ backgroundColor: "#E8A838", color: "#281A39" }}
            >
              Accept
            </Button>
            <button
              onClick={() => dismiss("declined")}
              className="text-white/40 hover:text-white/70 transition-colors duration-200 p-1"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cookieSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
