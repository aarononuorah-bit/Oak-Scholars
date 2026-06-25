import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const { data: banner } = trpc.banners.getActive.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (banner && !dismissed) {
      // Small delay for smooth entrance
      const t = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(t);
    }
  }, [banner, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 300);
  };

  if (!banner || dismissed) return null;

  const bgColors: Record<string, string> = {
    info: "#281A39",
    success: "#16a34a",
    warning: "#d97706",
    promo: "#160D22",
  };

  const bg = bgColors[banner.type] || "#160D22";

  return (
    <div
      className="text-white text-sm py-2.5 px-4 relative z-[60] overflow-hidden transition-all duration-300 ease-out"
      style={{
        backgroundColor: bg,
        maxHeight: visible ? "60px" : "0px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-center text-center">
          <Megaphone size={14} className="flex-shrink-0 opacity-70" />
          <span>{banner.message}</span>
          {banner.linkText && banner.linkUrl && (
            <a
              href={banner.linkUrl}
              className="underline font-semibold hover:opacity-80 transition-opacity ml-2 whitespace-nowrap"
            >
              {banner.linkText} →
            </a>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/70 hover:text-white transition-all duration-200 hover:scale-110 flex-shrink-0 p-1 rounded-full hover:bg-white/10"
          aria-label="Dismiss announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
