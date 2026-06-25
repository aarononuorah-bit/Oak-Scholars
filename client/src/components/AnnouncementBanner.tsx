import { useState } from "react";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: banner } = trpc.banners.getActive.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  if (!banner || dismissed) return null;

  const bgColors: Record<string, string> = {
    info: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-amber-500",
    promo: "bg-navy-deep",
  };

  const bg = bgColors[banner.type] || "bg-navy-deep";

  return (
    <div className={`${bg} text-white text-sm py-2.5 px-4 relative z-[60]`}>
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-center text-center">
          <span>{banner.message}</span>
          {banner.linkText && banner.linkUrl && (
            <a
              href={banner.linkUrl}
              className="underline font-semibold hover:opacity-80 transition-opacity ml-2"
            >
              {banner.linkText} →
            </a>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
