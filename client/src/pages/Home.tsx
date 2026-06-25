import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, FileText, Heart, ChevronRight, Star, GraduationCap, Users, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustBar from "@/components/TrustBar";
import CtaBanner from "@/components/CtaBanner";

// ─── Intersection Observer hook for scroll animations ─────────────────────────
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
    el.style.transition = "opacity 0.5s cubic-bezier(0.23,1,0.32,1), transform 0.5s cubic-bezier(0.23,1,0.32,1)";
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-20"
      style={{ background: "linear-gradient(160deg, #281A39 0%, #1e1230 50%, #160D22 100%)" }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      <div className="container relative z-10 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/30 rounded-full px-4 py-1.5 mb-8">
            <span className="text-amber text-xs font-semibold tracking-wider uppercase">50% off your first session</span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Your A-Level tutor<br />
            <span className="text-amber">sat the same paper</span><br />
            two years ago.
          </h1>

          <p className="text-white/70 text-xl leading-relaxed mb-10 max-w-xl">
            Oak Scholars connects ambitious students with undergraduates who recently aced the same exams. Real insight, real results — from 11+ to A-Level and IB.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/booking">
              <Button
                size="lg"
                className="btn-press font-semibold text-base px-8 py-6"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Book Your Trial Session
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8 py-6"
              >
                How It Works
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
            <div className="flex -space-x-2">
              {["O", "A", "K"].map((l, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-navy flex items-center justify-center font-bold text-sm text-white"
                  style={{ backgroundColor: i === 0 ? "#E8A838" : i === 1 ? "#2a4a8a" : "#3a1a5a" }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#E8A838" className="text-amber" />)}
              </div>
              <p className="text-white/60 text-sm">Trusted by 200+ students</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const ref = useScrollReveal();
  const steps = [
    { num: "01", title: "Choose Your Subject", desc: "Select your subject, level, and the type of support you need — from exam prep to weekly tuition." },
    { num: "02", title: "Get Matched", desc: "We match you with a tutor who recently studied the same subject at the same level. No guesswork." },
    { num: "03", title: "Book & Pay", desc: "Confirm your session time and pay securely online. Your first session is 50% off, no commitment required." },
    { num: "04", title: "Start Learning", desc: "Join your session via video call. Get personalised guidance from someone who's been exactly where you are." },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-surface">
      <div className="container" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Simple process</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep">
            From sign-up to <span className="gold-underline">session</span> in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="section-number mb-2">{step.num}</div>
              <h3 className="font-serif text-xl font-bold text-navy-deep mb-3">{step.title}</h3>
              <p className="text-muted-brand text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────
function ServicesSection() {
  const ref = useScrollReveal();
  const services = [
    {
      icon: <BookOpen size={28} />,
      title: "1:1 Tuition",
      desc: "Personalised sessions tailored to your syllabus, exam board, and learning style. Weekly or intensive options available.",
      link: "/booking",
    },
    {
      icon: <FileText size={28} />,
      title: "Study Resources",
      desc: "Revision notes, mock questions, model answers, and PowerPoints crafted by tutors who recently sat the same papers.",
      link: "/booking",
    },
    {
      icon: <Heart size={28} />,
      title: "Support & Guidance",
      desc: "Personal statement help, EPQ support, CV writing, and interview preparation for university applications.",
      link: "/booking",
    },
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">What we offer</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep">
            Everything you need to <span className="gold-underline">succeed</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-gray-100 p-8 hover:border-amber/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-amber group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
              >
                {s.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-deep mb-3">{s.title}</h3>
              <p className="text-muted-brand text-sm leading-relaxed mb-6">{s.desc}</p>
              <Link href={s.link} className="text-amber font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Subjects Section ─────────────────────────────────────────────────────────
function SubjectsSection() {
  const ref = useScrollReveal();
  const subjects = [
    "Mathematics", "Further Maths", "Physics", "Chemistry", "Biology",
    "English Literature", "English Language", "History", "Geography",
    "Economics", "Business Studies", "Computer Science", "Psychology",
    "French", "Spanish", "Latin", "Art & Design", "Music",
  ];
  const levels = ["11+", "13+", "KS3", "GCSE / IGCSE", "A-Level", "IB"];

  return (
    <section id="subjects" className="py-24 bg-surface">
      <div className="container" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Subjects & Levels</p>
            <h2 className="font-serif text-4xl font-bold text-navy-deep mb-6">
              We cover <span className="gold-underline">every subject</span><br />at every level
            </h2>
            <p className="text-muted-brand leading-relaxed mb-8">
              From 11+ preparation to A-Level and IB, our tutors cover the full curriculum. Can't see your subject? Get in touch — we'll find the right match.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {levels.map((l) => (
                <span
                  key={l}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold text-navy-deep border border-navy/20"
                  style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
                >
                  {l}
                </span>
              ))}
            </div>
            <Link href="/booking">
              <Button className="btn-press" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                Book a Session
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.map((s, i) => (
              <span
                key={s}
                className="px-3 py-2 rounded-lg text-sm font-medium text-navy-deep bg-white border border-gray-100 hover:border-amber/40 hover:bg-amber/5 transition-colors cursor-default"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ─────────────────────────────────────────────────────────
function PricingSection() {
  const ref = useScrollReveal();
  const plans = [
    {
      name: "Trial Session",
      price: "£15",
      original: "£30",
      badge: "50% off",
      desc: "Your first session at half price. No commitment required.",
      features: ["1 hour session", "Any subject", "Any level", "Video call"],
      highlight: true,
      productId: "trial",
    },
    {
      name: "Single Session",
      price: "£30",
      desc: "Pay as you go, whenever you need it.",
      features: ["1 hour session", "Any subject", "Any level", "Video call"],
      highlight: false,
      productId: "single",
    },
    {
      name: "4-Session Bundle",
      price: "£100",
      save: "Save £20",
      desc: "A month of focused learning at a discounted rate.",
      features: ["4 × 1 hour sessions", "Any subject", "Any level", "Progress tracking"],
      highlight: false,
      productId: "bundle4",
    },
    {
      name: "8-Session Bundle",
      price: "£190",
      save: "Save £50",
      desc: "Maximum progress — our best value package.",
      features: ["8 × 1 hour sessions", "Any subject", "Any level", "Progress tracking"],
      highlight: false,
      productId: "bundle8",
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Transparent pricing</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep">
            Simple, honest <span className="gold-underline">pricing</span>
          </h2>
          <p className="text-muted-brand mt-4 max-w-lg mx-auto">
            No hidden fees. No subscriptions. Just great tutoring at fair prices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.highlight
                  ? "border-2 border-amber shadow-lg relative"
                  : "border border-gray-100"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber text-navy-deep text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.badge && (
                <span className="inline-block bg-amber/10 text-amber text-xs font-semibold px-2 py-1 rounded-full mb-3 w-fit">
                  {plan.badge}
                </span>
              )}
              {plan.save && (
                <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full mb-3 w-fit">
                  {plan.save}
                </span>
              )}
              <div className="mb-1">
                <span className="font-serif text-3xl font-bold text-navy-deep">{plan.price}</span>
                {plan.original && (
                  <span className="text-muted-brand text-sm line-through ml-2">{plan.original}</span>
                )}
              </div>
              <h3 className="font-serif text-lg font-bold text-navy-deep mb-2">{plan.name}</h3>
              <p className="text-muted-brand text-sm mb-4 leading-relaxed">{plan.desc}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-navy-deep">
                    <CheckCircle size={14} className="text-amber flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/booking">
                <Button
                  className="w-full btn-press"
                  style={plan.highlight ? { backgroundColor: "#E8A838", color: "#281A39" } : {}}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  Book Now
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────
function TestimonialsSection() {
  const ref = useScrollReveal();
  const testimonials = [
    {
      quote: "My daughter went from a C to an A* in GCSE Chemistry in just 6 sessions. The tutor understood exactly what the examiner was looking for.",
      author: "Parent of GCSE Chemistry student",
      stars: 5,
    },
    {
      quote: "I was really struggling with A-Level Maths but my tutor made everything click. He'd literally done the same paper two years before. Absolute game changer.",
      author: "A-Level Maths student",
      stars: 5,
    },
    {
      quote: "The personal statement help was incredible. My son got into his first choice university. Can't recommend Oak Scholars enough.",
      author: "Parent of UCAS applicant",
      stars: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-surface">
      <div className="container" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">What students say</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep">
            Real results, <span className="gold-underline">real students</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={16} fill="#E8A838" className="text-amber" />
                ))}
              </div>
              <p className="text-navy-deep text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
              <p className="text-muted-brand text-xs font-semibold">— {t.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Team Section ─────────────────────────────────────────────────────────────
function TeamSection() {
  const ref = useScrollReveal();
  const team = [
    {
      name: "Oliver Curtis",
      role: "Co-Founder",
      bio: "Oxford undergraduate. Specialises in Mathematics and Further Maths, A-Level and GCSE.",
      initials: "OC",
      linkedin: "https://linkedin.com/in/oliver-curtis",
    },
    {
      name: "Aaron Onuorah",
      role: "Co-Founder",
      bio: "UCL undergraduate. Specialises in Sciences and Medicine preparation.",
      initials: "AO",
      linkedin: "https://linkedin.com/in/aaron-onuorah",
    },
    {
      name: "Kolade Alabi",
      role: "Co-Founder",
      bio: "Imperial undergraduate. Specialises in Economics, Business, and Humanities.",
      initials: "KA",
      linkedin: "https://linkedin.com/in/kolade-alabi",
    },
  ];

  return (
    <section id="team" className="py-24 bg-white">
      <div className="container" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">The team</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep">
            Meet the <span className="gold-underline">founders</span>
          </h2>
          <p className="text-muted-brand mt-4 max-w-lg mx-auto">
            Three undergraduates who aced their A-Levels and built the service they wished they'd had.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {team.map((member) => (
            <div key={member.name} className="text-center group">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold font-serif text-white border-4 border-amber/20 group-hover:border-amber transition-colors duration-300"
                style={{ backgroundColor: "#281A39" }}
              >
                {member.initials}
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-deep">{member.name}</h3>
              <p className="text-amber text-sm font-semibold mb-2">{member.role}</p>
              <p className="text-muted-brand text-sm leading-relaxed mb-3">{member.bio}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-brand hover:text-amber transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ServicesSection />
      <SubjectsSection />
      <PricingSection />
      <TestimonialsSection />
      <TrustBar />
      <TeamSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}
