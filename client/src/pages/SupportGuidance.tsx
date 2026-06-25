import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  FileText, Briefcase, MessageSquare, Award,
  Heart, Shield, Users, Smile,
  CheckCircle, ChevronRight
} from "lucide-react";
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
    el.style.transition = "opacity 0.5s cubic-bezier(0.23,1,0.32,1), transform 0.5s cubic-bezier(0.23,1,0.32,1)";
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const academicServices = [
  {
    icon: <FileText size={28} />,
    title: "Personal Statement Help",
    desc: "Craft a compelling personal statement that stands out. We guide you through structure, content, and tone — from first draft to final submission.",
    features: [
      "1:1 drafting sessions",
      "Feedback on every draft",
      "UCAS word count guidance",
      "Subject-specific advice",
    ],
    price: "From £30 per session",
  },
  {
    icon: <Award size={28} />,
    title: "EPQ Support",
    desc: "Get expert guidance on your Extended Project Qualification — from choosing a title to structuring your report and preparing your presentation.",
    features: [
      "Title brainstorming & approval",
      "Research methodology support",
      "Report structure & writing",
      "Presentation preparation",
    ],
    price: "From £30 per session",
  },
  {
    icon: <Briefcase size={28} />,
    title: "CV Writing",
    desc: "Build a professional CV that highlights your achievements, skills, and experience. Tailored for sixth-form, university, or early-career applications.",
    features: [
      "CV structure & formatting",
      "Highlighting key achievements",
      "Tailored to your target role",
      "Cover letter guidance",
    ],
    price: "From £25 per session",
  },
  {
    icon: <MessageSquare size={28} />,
    title: "Interview Preparation",
    desc: "Practise with mock interviews and get detailed feedback. We cover university admissions interviews, scholarship panels, and job interviews.",
    features: [
      "Mock interview sessions",
      "Detailed feedback & coaching",
      "Common question frameworks",
      "Body language & confidence tips",
    ],
    price: "From £30 per session",
  },
];

const wellbeingServices = [
  {
    icon: <Heart size={28} />,
    title: "Mental Health & Stress Support",
    desc: "A safe, non-judgmental space to talk through exam stress, anxiety, or anything weighing on your mind. Our mentors listen and help you find strategies that work.",
    features: [
      "Confidential 1:1 sessions",
      "Stress & anxiety management",
      "Exam pressure coping strategies",
      "Signposting to further support",
    ],
  },
  {
    icon: <Shield size={28} />,
    title: "Bullying & Social Challenges",
    desc: "If you're experiencing bullying, social exclusion, or difficult relationships at school, we can help you navigate it with confidence and clarity.",
    features: [
      "Safe, confidential conversations",
      "Practical coping strategies",
      "Building confidence & resilience",
      "Guidance on when to involve others",
    ],
  },
  {
    icon: <Users size={28} />,
    title: "General Wellbeing Check-ins",
    desc: "Sometimes you just need someone to talk to. Our regular wellbeing check-ins give students a consistent, supportive presence outside of school.",
    features: [
      "Regular 1:1 check-in sessions",
      "Goal setting & accountability",
      "Positive mindset coaching",
      "Flexible scheduling",
    ],
  },
  {
    icon: <Smile size={28} />,
    title: "Transition & Life Skills",
    desc: "Support for major transitions — moving to sixth form, starting university, or managing new responsibilities. We help students build the life skills they need to thrive.",
    features: [
      "Transition planning sessions",
      "Time management & organisation",
      "Independence & self-advocacy",
      "Building healthy routines",
    ],
  },
];

export default function SupportGuidance() {
  const academicRef = useScrollReveal();
  const wellbeingRef = useScrollReveal();
  const approachRef = useScrollReveal();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-20 flex items-center"
        style={{ background: "linear-gradient(160deg, #281A39 0%, #1e1230 50%, #160D22 100%)" }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-amber" />
              <span className="text-amber text-xs font-semibold tracking-widest uppercase">Support & Guidance</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Beyond the classroom,{" "}
              <em className="text-amber not-italic">we've got you.</em>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-2xl">
              Oak Scholars offers two distinct strands of support: academic guidance to help you reach your goals, and wellbeing support for everything life throws at you outside of education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#academic">
                <Button size="lg" className="btn-press font-semibold text-base px-8 py-3" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                  Academic Support
                </Button>
              </a>
              <a href="#wellbeing">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8 py-3">
                  Wellbeing Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Academic Support ────────────────────────────────────────── */}
      <section id="academic" className="py-24 bg-white">
        <div className="container" ref={academicRef}>
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber" style={{ backgroundColor: "rgba(232,168,56,0.1)" }}>
                <Award size={20} />
              </div>
              <p className="text-amber text-sm font-semibold tracking-widest uppercase">Academic Support</p>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep mb-4">
              Academic <span className="gold-underline">Support</span>
            </h2>
            <p className="text-muted-brand text-lg max-w-2xl">
              From personal statements to interview prep — everything you need to put your best foot forward in applications and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {academicServices.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-gray-100 p-8 hover:border-amber/30 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-amber"
                    style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy-deep">{s.title}</h3>
                    <span className="text-amber text-sm font-semibold">{s.price}</span>
                  </div>
                </div>
                <p className="text-muted-brand text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-navy-deep">
                      <CheckCircle size={14} className="text-amber flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/academic-support">
                  <Button className="w-full btn-press font-semibold" style={{ backgroundColor: "#281A39", color: "white" }}>
                    Enquire Now <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Wellbeing Support ───────────────────────────────────────── */}
      <section id="wellbeing" className="py-24 bg-surface">
        <div className="container" ref={wellbeingRef}>
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber" style={{ backgroundColor: "rgba(232,168,56,0.1)" }}>
                <Heart size={20} />
              </div>
              <p className="text-amber text-sm font-semibold tracking-widest uppercase">Wellbeing Support</p>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep mb-4">
              Wellbeing <span className="gold-underline">Support</span>
            </h2>
            <p className="text-muted-brand text-lg max-w-2xl">
              School can be tough — and not always for academic reasons. Our wellbeing sessions offer a safe, confidential space for students to talk through anything that's on their mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {wellbeingServices.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-gray-100 bg-white p-8 hover:border-amber/30 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-amber"
                    style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy-deep">{s.title}</h3>
                    <span className="text-green-600 text-sm font-semibold">Confidential & supportive</span>
                  </div>
                </div>
                <p className="text-muted-brand text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-navy-deep">
                      <CheckCircle size={14} className="text-amber flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/wellbeing-support">
                  <Button className="w-full btn-press font-semibold" style={{ backgroundColor: "#281A39", color: "white" }}>
                    Enquire Now <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Reassurance note */}
          <div className="mt-12 rounded-2xl p-8 text-center max-w-2xl mx-auto" style={{ backgroundColor: "rgba(232,168,56,0.08)", border: "1px solid rgba(232,168,56,0.2)" }}>
            <Heart size={28} className="text-amber mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-navy-deep mb-2">You don't have to face it alone</h3>
            <p className="text-muted-brand text-sm leading-relaxed mb-4">
              All wellbeing sessions are completely confidential. Our mentors are trained to listen without judgement and help you find a way forward — whatever you're going through.
            </p>
            <Link href="/wellbeing-support">
              <Button className="btn-press font-semibold" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                Reach Out Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Our Approach ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container" ref={approachRef}>
          <div className="text-center mb-12">
            <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Our approach</p>
            <h2 className="font-serif text-4xl font-bold text-navy-deep">
              Why students trust <span className="gold-underline">Oak Scholars</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Peer-led support", desc: "Our mentors are current undergraduates who've been through the same pressures — they genuinely understand what you're facing." },
              { title: "Completely confidential", desc: "Everything discussed in your sessions stays between you and your mentor. We create a safe space, always." },
              { title: "No judgement", desc: "Whether it's academic struggles or personal challenges, we meet every student exactly where they are." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "rgba(232,168,56,0.1)" }}>
                  <CheckCircle size={20} className="text-amber" />
                </div>
                <h3 className="font-serif text-lg font-bold text-navy-deep mb-2">{item.title}</h3>
                <p className="text-muted-brand text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </div>
  );
}
