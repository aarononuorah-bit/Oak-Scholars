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
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/manus-storage/hero-bg_d17613f1.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-amber" />
              <span className="text-amber text-xs font-semibold tracking-widest uppercase">Online Tutoring</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Your tutor sat{" "}
              <em className="text-amber not-italic">the same exam</em>{" "}
              two years ago.
            </h1>

            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Oak Scholars connects students with current undergraduates who recently aced the same papers. 1:1 online tutoring from 11+ through A-Level — tailored to you, priced fairly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="btn-press font-semibold text-base px-8 py-3"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  Book a Trial — 50% Off
                </Button>
              </Link>
              <a href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8 py-3"
                >
                  View Pricing
                </Button>
              </a>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 pt-8 border-t border-white/10">
              <div>
                <p className="font-serif text-3xl font-bold text-amber">50%</p>
                <p className="text-white/60 text-xs mt-0.5">Off first lesson</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-white">£30</p>
                <p className="text-white/60 text-xs mt-0.5">Per session from</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-white">12+</p>
                <p className="text-white/60 text-xs mt-0.5">Subjects covered</p>
              </div>
            </div>
          </div>

          {/* Right — tutoring image with review card */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/3" }}>
              <img
                src="/manus-storage/study-session_3a51259f.webp"
                alt="A university student tutoring a secondary school student"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(40,26,57,0.6) 0%, transparent 50%)" }} />
            </div>
            {/* Review card — overlaid at bottom-left */}
            <div
              className="absolute bottom-4 left-4 right-4 rounded-xl p-4"
              style={{ backgroundColor: "rgba(40,26,57,0.92)", border: "1px solid rgba(232,168,56,0.2)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-amber text-xs font-semibold tracking-widest uppercase mb-2">Recent Parent Review</p>
              <p className="text-white/90 text-sm leading-relaxed italic">
                "He really took time to understand strengths and weaknesses."
              </p>
              <p className="text-white/50 text-xs mt-2">— GCSE Chemistry Parent</p>
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
              className="relative animate-fade-in-up opacity-0"
              style={{ animationDelay: `${i * 100}ms` }}
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
      cta: "Book a session",
    },
    {
      icon: <FileText size={28} />,
      title: "Study Resources",
      desc: "Revision notes, mock questions, model answers, and PowerPoints crafted by tutors who recently sat the same papers. From £15 per pack.",
      link: "/study-resources",
      cta: "View resources",
    },
    {
      icon: <GraduationCap size={28} />,
      title: "Academic Support",
      desc: "Personal statement help, EPQ support, CV writing, and interview preparation to strengthen your university application.",
      link: "/support-guidance",
      cta: "Find out more",
    },
    {
      icon: <Heart size={28} />,
      title: "Wellbeing Support",
      desc: "A safe space for students dealing with stress, anxiety, bullying, or any challenges outside of the classroom. You're not alone.",
      link: "/support-guidance#wellbeing",
      cta: "Find out more",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <Link
              key={s.title}
              href={s.link}
              className="group rounded-2xl border border-gray-100 p-8 hover:border-amber/30 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col no-underline animate-fade-in-up opacity-0 hover-lift"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-amber group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
              >
                {s.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-deep mb-3">{s.title}</h3>
              <p className="text-muted-brand text-sm leading-relaxed mb-6 flex-1">{s.desc}</p>
              <span className="text-amber font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                {s.cta} <ChevronRight size={16} />
              </span>
            </Link>
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
      price: "£200",
      save: "Save £40",
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
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-xl animate-fade-in-up opacity-0 hover-lift ${
                plan.highlight
                  ? "border-2 border-amber shadow-lg relative"
                  : "border border-gray-100"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
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
                  className="w-full btn-press transition-smooth hover:scale-105"
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
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up opacity-0 hover-lift"
              style={{ animationDelay: `${i * 100}ms` }}
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
      bio: "Co-founder of Oak Scholars, passionate about making high-quality tutoring accessible to every student.",
      initials: "OC",
      linkedin: "https://www.linkedin.com/in/oliver-curtis-122b48373/",
    },
    {
      name: "Aaron Onuorah",
      role: "Co-Founder",
      bio: "Philosophy & Theology undergraduate at the University of Nottingham. FIMS Intern at Hamilton Lane and Brokerage Young Leader.",
      initials: "AO",
      linkedin: "https://www.linkedin.com/in/aaron-onuorah",
    },
    {
      name: "Kolade Alabi",
      role: "Co-Founder",
      bio: "Undergraduate at Nottingham Trent University. Entrepreneur and co-founder of Oak Scholars, driven to connect passionate tutors with students.",
      initials: "KA",
      linkedin: "https://www.linkedin.com/in/kolade-alabi-34557a258/",
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
