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
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {universities.map((uni, i) => (
              <div
                key={uni}
                className="relative group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span
                  className="font-serif text-lg md:text-xl font-bold tracking-wider transition-all duration-300 text-white/30 group-hover:text-amber/80"
                >
                  {uni}
                </span>
                {/* Subtle underline on hover */}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-amber/60 group-hover:w-full transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
