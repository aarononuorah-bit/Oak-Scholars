const stats = [
  { value: "200+", label: "Students Tutored" },
  { value: "95%", label: "Grade Improvement" },
  { value: "4.9★", label: "Average Rating" },
  { value: "50%", label: "Off First Session" },
];

export default function TrustBar() {
  return (
    <div className="bg-navy py-8">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-serif text-3xl font-bold text-amber">{stat.value}</div>
              <div className="text-white/60 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
