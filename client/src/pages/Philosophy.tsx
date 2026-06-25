import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, GraduationCap, CheckCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CtaBanner from "@/components/CtaBanner";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition =
      "opacity 0.5s cubic-bezier(0.23,1,0.32,1), transform 0.5s cubic-bezier(0.23,1,0.32,1)";
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const pillars = [
  {
    icon: <BookOpen size={28} />,
    title: "Academic Excellence",
    desc: "Our core offering remains top-tier, personalised tuition from Oak Scholars who recently excelled in the very exams our students are preparing for. We focus on understanding individual learning styles and tailoring our approach to maximise impact.",
    features: [
      "Tutors who sat the same exam",
      "Tailored to your exam board",
      "1:1 personalised sessions",
      "Flexible scheduling",
    ],
  },
  {
    icon: <GraduationCap size={28} />,
    title: "Career Readiness",
    desc: "Academic achievements are a stepping stone. To truly equip students for their future, we offer comprehensive support in CV writing, interview preparation, and personal statement crafting — giving our students a distinct advantage.",
    features: [
      "Personal statement guidance",
      "CV writing & review",
      "Interview preparation",
      "University application support",
    ],
  },
  {
    icon: <Heart size={28} />,
    title: "Wellbeing Support",
    desc: "The mental and emotional health of our students is paramount. We provide a safe and confidential space for students to discuss challenges, manage stress, and build coping mechanisms. A healthy mind is the foundation for success.",
    features: [
      "Confidential 1:1 sessions",
      "Stress & anxiety strategies",
      "Exam pressure coping tools",
      "Non-judgemental mentorship",
    ],
  },
];

export default function Philosophy() {
  const pillarsRef = useScrollReveal();
  const storyRef = useScrollReveal();
  const valuesRef = useScrollReveal();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-20 flex items-center min-h-[70vh]"
        style={{
          background: "linear-gradient(160deg, #281A39 0%, #1e1230 50%, #160D22 100%)",
        }}
      >
        {/* Hero image overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-amber" />
              <span className="text-amber text-xs font-semibold tracking-widest uppercase">
                Our Philosophy
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Education that goes{" "}
              <em className="text-amber not-italic">beyond the grade.</em>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-2xl">
              We founded Oak Scholars because we lived the gap between conventional tutoring and what students truly need. Our approach is holistic, empathetic, and built by people who've been exactly where you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="btn-press font-semibold text-base px-8 py-3"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  Book a Trial — 50% Off
                </Button>
              </Link>
              <a href="#pillars">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8 py-3"
                >
                  Our Three Pillars
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Origin Story ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container" ref={storyRef}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/3" }}>
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                alt="Students collaborating and studying together"
                className="w-full h-full object-cover object-center"
                style={{ transform: "scale(0.92)", transformOrigin: "center" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(40,26,57,0.5) 0%, transparent 60%)",
                }}
              />
              <div
                className="absolute bottom-4 left-4 right-4 rounded-xl p-4"
                style={{
                  backgroundColor: "rgba(40,26,57,0.92)",
                  border: "1px solid rgba(232,168,56,0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p className="text-amber text-xs font-semibold tracking-widest uppercase mb-1">
                  Founded by undergraduates
                </p>
                <p className="text-white/90 text-sm leading-relaxed italic">
                  "We understood firsthand the gap between conventional academic support and what students truly need."
                </p>
              </div>
            </div>

            {/* Copy */}
            <div>
              <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">
                Our story
              </p>
              <h2 className="font-serif text-4xl font-bold text-navy-deep mb-6">
                Bridging the <span className="gold-underline">gap</span>
              </h2>
              <p className="text-muted-brand leading-relaxed mb-5">
                At Oak Scholars, our journey began with a simple yet profound realisation: the traditional tutoring landscape often falls short. As three undergraduates who recently navigated the complexities of A-Levels and university applications, we understood firsthand the gap between conventional academic support and what students truly need to thrive.
              </p>
              <p className="text-muted-brand leading-relaxed mb-5">
                We observed that many tutoring services focus solely on grades, overlooking the broader challenges students face. The pressure to perform, the anxiety of exams, and the daunting prospect of future careers can be overwhelming. We believed there was a better way.
              </p>
              <p className="text-muted-brand leading-relaxed">
                Our Oak Scholars are not just subject matter experts — they are recent graduates who have walked in your shoes, offering not only academic guidance but also invaluable mentorship and genuine understanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Three Pillars ─────────────────────────────────────────────────────── */}
      <section id="pillars" className="py-24 bg-surface">
        <div className="container" ref={pillarsRef}>
          <div className="text-center mb-16">
            <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">
              What we stand for
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep">
              Our three <span className="gold-underline">pillars</span>
            </h2>
            <p className="text-muted-brand text-lg max-w-2xl mx-auto mt-5">
              Every student deserves the tools and support necessary to unlock their full potential. Success extends beyond exam results — it encompasses confidence, resilience, and preparedness for life's next big steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-gray-100 bg-white p-8 hover:border-amber/30 hover:shadow-xl transition-all duration-300 flex flex-col animate-fade-in-up opacity-0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-amber"
                  style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
                >
                  {pillar.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-deep mb-3">
                  {pillar.title}
                </h3>
                <p className="text-muted-brand text-sm leading-relaxed mb-5 flex-1">
                  {pillar.desc}
                </p>
                <ul className="space-y-2">
                  {pillar.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-navy-deep">
                      <CheckCircle size={14} className="text-amber flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Values ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container" ref={valuesRef}>
          <div className="text-center mb-14">
            <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">
              What drives us
            </p>
            <h2 className="font-serif text-4xl font-bold text-navy-deep">
              Values we never <span className="gold-underline">compromise on</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                num: "01",
                title: "Empathy first",
                desc: "We remember what it felt like. Every session is built on genuine understanding — not just subject knowledge.",
              },
              {
                num: "02",
                title: "Holistic support",
                desc: "Grades matter, but so does the person behind them. We nurture the whole student — academically, professionally, and personally.",
              },
              {
                num: "03",
                title: "Peer-led mentorship",
                desc: "Our Oak Scholars sat the same exams recently. That lived experience makes the difference between advice and genuine guidance.",
              },
            ].map((v) => (
              <div key={v.title} className="text-center px-4">
                <div className="section-number mb-2">{v.num}</div>
                <h3 className="font-serif text-xl font-bold text-navy-deep mb-3">{v.title}</h3>
                <p className="text-muted-brand text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Closing statement */}
          <div
            className="mt-16 rounded-2xl p-10 text-center max-w-3xl mx-auto"
            style={{
              backgroundColor: "rgba(232,168,56,0.08)",
              border: "1px solid rgba(232,168,56,0.2)",
            }}
          >
            <p className="font-serif text-2xl font-bold text-navy-deep mb-4">
              "We are dedicated to fostering not just scholars, but well-rounded individuals ready to confidently pursue their aspirations."
            </p>
            <p className="text-muted-brand text-sm">— The Oak Scholars founding team</p>
            <div className="mt-6">
              <Link href="/booking">
                <Button
                  className="btn-press font-semibold px-8"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  Start Your Journey <ChevronRight size={16} className="ml-1 inline" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </div>
  );
}
