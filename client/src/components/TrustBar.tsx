const stats = [
  { value: "200+", label: "Students Tutored" },
  { value: "95%", label: "Grade Improvement" },
  { value: "4.9★", label: "Average Rating" },
  { value: "50%", label: "Off First Session" },
];

export default function TrustBar() {
  return (
    <div className="bg-navy py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-12">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-serif text-4xl font-bold text-amber">{stat.value}</div>
              <div className="text-white/60 text-sm mt-1 uppercase tracking-widest font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="pt-10 border-t border-white/10">
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase text-center mb-8">Our Scholars come from the UK's top institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using text-based logos for placeholders, can be replaced with SVG logos later */}
            <div className="text-white font-serif text-xl font-bold">OXFORD</div>
            <div className="text-white font-serif text-xl font-bold">CAMBRIDGE</div>
            <div className="text-white font-serif text-xl font-bold">LSE</div>
            <div className="text-white font-serif text-xl font-bold">IMPERIAL</div>
            <div className="text-white font-serif text-xl font-bold">UCL</div>
            <div className="text-white font-serif text-xl font-bold">DURHAM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
