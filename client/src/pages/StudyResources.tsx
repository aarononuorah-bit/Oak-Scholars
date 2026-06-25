import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, ClipboardList, Presentation, CheckCircle, ChevronRight, Download, Star } from "lucide-react";
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

const resourceTypes = [
  {
    icon: <FileText size={32} />,
    title: "Revision Notes",
    desc: "Concise, exam-focused notes written by Oak Scholars who recently sat the same papers. Covers key concepts, definitions, and common exam traps.",
    price: "£15",
    unit: "per subject pack",
    features: [
      "Topic-by-topic breakdown",
      "Key terms & definitions",
      "Common exam mistakes flagged",
      "Aligned to your exam board",
    ],
  },
  {
    icon: <ClipboardList size={32} />,
    title: "Mock Questions",
    desc: "Practice questions modelled on real past papers, with mark schemes included. Perfect for timed practice and building exam confidence.",
    price: "£15",
    unit: "per question pack",
    features: [
      "Past-paper style questions",
      "Full mark schemes included",
      "Graded by difficulty",
      "Exam board specific",
    ],
  },
  {
    icon: <BookOpen size={32} />,
    title: "Model Answers",
    desc: "Annotated model answers showing exactly what top-grade responses look like. Understand what examiners are looking for and why marks are awarded.",
    price: "£15",
    unit: "per answer pack",
    features: [
      "Full mark model answers",
      "Examiner annotations",
      "Grade boundary guidance",
      "Technique tips included",
    ],
  },
  {
    icon: <Presentation size={32} />,
    title: "PowerPoint Packs",
    desc: "Visually engaging slide decks covering full topics or individual chapters. Ideal for self-study, revision sessions, or as a teaching aid.",
    price: "£20",
    unit: "per presentation",
    features: [
      "Fully designed slides",
      "Diagrams & visual aids",
      "Summary slides per topic",
      "Printable PDF version",
    ],
  },
];

const subjects = [
  "Mathematics", "Further Maths", "Physics", "Chemistry", "Biology",
  "English Literature", "English Language", "History", "Geography",
  "Economics", "Business Studies", "Computer Science", "Psychology",
];

const levels = ["GCSE / IGCSE", "A-Level", "IB", "KS3"];

export default function StudyResources() {
  const heroRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useScrollReveal();
  const howRef = useScrollReveal();
  const subjectsRef = useScrollReveal();

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
        <div className="container relative z-10" ref={heroRef}>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-amber" />
              <span className="text-amber text-xs font-semibold tracking-widest uppercase">Study Resources</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Revision materials written by{" "}
              <em className="text-amber not-italic">people who aced it.</em>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-2xl">
              Every resource is created by current undergraduates who recently sat the same exams. No generic textbook content — just targeted, exam-ready materials from £15 per pack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#resources">
                <Button size="lg" className="btn-press font-semibold text-base px-8 py-3" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                  Browse Resources
                </Button>
              </a>
              <Link href="/study-resources/order">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8 py-3">
                  Request a Custom Pack
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-surface">
        <div className="container" ref={howRef}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { num: "01", title: "Choose Your Resource", desc: "Pick the type of material and subject you need — revision notes, mock questions, model answers, or PowerPoints." },
              { num: "02", title: "We Prepare Your Pack", desc: "Our Oak Scholars prepare your materials tailored to your specific exam board and level." },
              { num: "03", title: "Download & Study", desc: "Receive your resource pack by email, ready to use straight away for your revision." },
            ].map((step) => (
              <div key={step.num}>
                <div className="text-4xl font-serif font-bold text-amber/20 mb-2">{step.num}</div>
                <h3 className="font-serif text-lg font-bold text-navy-deep mb-2">{step.title}</h3>
                <p className="text-muted-brand text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Resource Types & Pricing ─────────────────────────────────────────── */}
      <section id="resources" className="py-24 bg-white">
        <div className="container" ref={resourcesRef}>
          <div className="text-center mb-16">
            <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">What's available</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep">
              Four types of <span className="gold-underline">resource</span>
            </h2>
            <p className="text-muted-brand mt-4 max-w-lg mx-auto">
              All materials are exam-board aligned and written by Oak Scholars who recently sat the same papers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resourceTypes.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-gray-100 p-8 hover:border-amber/30 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start gap-5 mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-amber"
                    style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy-deep mb-1">{r.title}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-2xl font-bold text-amber">{r.price}</span>
                      <span className="text-muted-brand text-sm">{r.unit}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-brand text-sm leading-relaxed mb-6">{r.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-navy-deep">
                      <CheckCircle size={15} className="text-amber flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/study-resources/order">
                  <Button className="w-full btn-press font-semibold" style={{ backgroundColor: "#281A39", color: "white" }}>
                    <Download size={16} className="mr-2" />
                    Order This Pack
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Subjects & Levels ────────────────────────────────────────────────── */}
      <section className="py-24 bg-surface">
        <div className="container" ref={subjectsRef}>
          <div className="text-center mb-12">
            <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Coverage</p>
            <h2 className="font-serif text-4xl font-bold text-navy-deep">
              Subjects & <span className="gold-underline">levels covered</span>
            </h2>
            <p className="text-muted-brand mt-4 max-w-lg mx-auto">
              Resources are available for all major subjects at GCSE, A-Level, and IB. Don't see yours? Contact us and we'll create it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-4xl mx-auto">
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-deep mb-4">Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span key={s} className="px-3 py-2 rounded-lg text-sm font-medium text-navy-deep bg-white border border-gray-100 hover:border-amber/40 hover:bg-amber/5 transition-colors">
                    {s}
                  </span>
                ))}
                <span className="px-3 py-2 rounded-lg text-sm font-medium text-amber border border-amber/30 bg-amber/5">
                  + more on request
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-deep mb-4">Levels</h3>
              <div className="flex flex-wrap gap-2">
                {levels.map((l) => (
                  <span key={l} className="px-4 py-2 rounded-full text-sm font-semibold text-navy-deep border border-navy/20" style={{ backgroundColor: "rgba(232,168,56,0.1)" }}>
                    {l}
                  </span>
                ))}
              </div>
              <div className="mt-8 p-5 rounded-xl border border-amber/20 bg-amber/5">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-amber" />
                  <span className="font-semibold text-navy-deep text-sm">Custom Packs Available</span>
                </div>
                <p className="text-muted-brand text-sm leading-relaxed">
                  Need a resource tailored to a specific topic, chapter, or exam board? Get in touch and we'll create a bespoke pack just for you.
                </p>
                <Link href="/study-resources/order">
                  <Button variant="outline" size="sm" className="mt-3 border-amber/30 text-amber hover:bg-amber/10">
                    Request a Custom Pack <ChevronRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </div>
  );
}
