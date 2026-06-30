import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function CtaBanner() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-24 overflow-hidden reveal-on-scroll"
      style={{ background: "linear-gradient(135deg, #281A39 0%, #160D22 100%)" }}
    >
      {/* Decorative background circles */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-15 pointer-events-none blur-3xl animate-pulse"
        style={{ background: "radial-gradient(circle, #E8A838 0%, transparent 70%)", animationDuration: '4s' }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl animate-pulse"
        style={{ background: "radial-gradient(circle, #E8A838 0%, transparent 70%)", animationDuration: '6s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full opacity-[0.03] pointer-events-none"
        style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 50%)" }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container relative z-10 text-center">
        <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-4">
          Ready to start?
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Your A-grades are closer<br className="hidden sm:block" /> than you think.
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Book your first session today — 50% off, no commitment required. Get matched with an Oak Scholar who recently aced the same exams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button
              size="lg"
              className="btn-press font-semibold text-base px-8 gap-2"
              style={{ backgroundColor: "#E8A838", color: "#281A39" }}
            >
              Book Your Trial — 50% Off
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8 gap-2 transition-all duration-200"
            >
              <MessageCircle size={18} />
              Ask a Question
            </Button>
          </Link>
        </div>

        {/* Trust micro-copy */}
        <p className="text-white/30 text-xs mt-8">
          Secure payment via Stripe · Cancel anytime
        </p>
      </div>
    </section>
  );
}
