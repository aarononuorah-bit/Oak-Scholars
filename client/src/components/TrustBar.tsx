import { useEffect, useRef } from "react";

const stats = [
  { value: "200+", label: "Students Tutored" },
  { value: "95%", label: "Grade Improvement" },
  { value: "4.9★", label: "Average Rating" },
  { value: "50%", label: "Off First Session" },
];

const universities = ["OXFORD", "CAMBRIDGE", "LSE", "IMPERIAL", "UCL", "DURHAM"];

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);

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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-navy py-16 overflow-hidden">
      <div className="container">
        {/* Stats grid */}
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-14 reveal-stagger"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="group">
              <div
                className="font-serif text-4xl md:text-5xl font-bold text-amber mb-1 transition-transform duration-300 group-hover:scale-110"
              >
                {stat.value}
              </div>
              <div className="text-white/60 text-xs mt-1 uppercase tracking-widest font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* University trust logos */}
        <div className="pt-10 border-t border-white/10">
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase text-center mb-8">
            Our Scholars come from the UK's top institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {universities.map((uni, i) => (
              <div
                key={uni}
                className="relative group cursor-default"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span
                  className="font-serif text-lg md:text-2xl font-bold tracking-widest transition-all duration-500 text-white/20 group-hover:text-amber group-hover:drop-shadow-[0_0_15px_rgba(232,168,56,0.3)]"
                >
                  {uni}
                </span>
                {/* Subtle glow effect on hover */}
                <div className="absolute -inset-2 bg-amber/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
