import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const COOKIE_KEY = "oak_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div
        className="max-w-2xl mx-auto rounded-xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ backgroundColor: "#281A39", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex-1">
          <p className="text-white text-sm leading-relaxed">
            We use cookies to improve your experience.{" "}
            <Link href="/privacy" className="text-amber underline hover:opacity-80">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={decline}
            className="border-white/30 text-white bg-transparent hover:bg-white/10 text-xs"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="text-xs font-semibold btn-press"
            style={{ backgroundColor: "#E8A838", color: "#281A39" }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
