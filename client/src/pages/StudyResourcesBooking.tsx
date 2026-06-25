import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, BookOpen, CheckCircle2, FileText, HelpCircle, Presentation, ClipboardList } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const RESOURCE_TYPES = [
  { id: "revision-notes", label: "Revision Notes", icon: FileText, price: "£15", desc: "Concise, exam-focused notes covering key topics" },
  { id: "mock-questions", label: "Mock Questions", icon: ClipboardList, price: "£15", desc: "Past-paper style questions with mark schemes" },
  { id: "model-answers", label: "Model Answers", icon: CheckCircle2, price: "£15", desc: "Full worked answers with examiner commentary" },
  { id: "powerpoint", label: "PowerPoint Pack", icon: Presentation, price: "£20", desc: "Visual slide decks for topic-by-topic learning" },
  { id: "other", label: "Other", icon: HelpCircle, price: "POA", desc: "Something specific in mind? Tell us what you need" },
];

const SUBJECTS = [
  "Mathematics", "Further Maths", "Physics", "Chemistry", "Biology",
  "Economics", "Business Studies", "Computer Science", "Psychology",
  "English Literature", "English Language", "History", "Geography",
  "French", "Spanish", "Latin", "Art & Design", "Music",
];

const LEVELS = ["11+", "13+", "GCSE / IGCSE", "A-Level", "IB"];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  resourceType: string;
  resourceTypeOther: string;
  subject: string;
  subjectOther: string;
  level: string;
  quantity: string;
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: "email" | "phone" | "whatsapp" | "";
  notes: string;
}

const EMPTY: FormData = {
  resourceType: "",
  resourceTypeOther: "",
  subject: "",
  subjectOther: "",
  level: "",
  quantity: "1",
  name: "",
  email: "",
  phone: "",
  preferredContactMethod: "",
  notes: "",
};

export default function StudyResourcesBooking() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const set = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const selectedResource = RESOURCE_TYPES.find((r) => r.id === form.resourceType);

  const canNext = () => {
    if (step === 1) return !!form.resourceType && (form.resourceType !== "other" || form.resourceTypeOther.trim().length > 0);
    if (step === 2) return !!form.level && !!form.subject && (form.subject !== "other" || form.subjectOther.trim().length > 0);
    if (step === 3) return form.name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.phone.trim().length > 0 && form.preferredContactMethod;
    return false;
  };

  const handleSubmit = () => {
    if (!form.phone) {
      toast.error("Please provide a phone number.");
      return;
    }
    if (!form.preferredContactMethod) {
      toast.error("Please select a preferred contact method.");
      return;
    }
    const resourceLabel = form.resourceType === "other" ? form.resourceTypeOther : selectedResource?.label ?? form.resourceType;
    const subjectLabel = form.subject === "other" ? form.subjectOther : form.subject;
    const message = [
      `Resource Type: ${resourceLabel}`,
      `Subject: ${subjectLabel}`,
      `Level: ${form.level}`,
      `Quantity: ${form.quantity}`,
      `Phone: ${form.phone}`,
      `Preferred Contact: ${form.preferredContactMethod}`,
      form.notes ? `Additional Notes: ${form.notes}` : null,
    ].filter(Boolean).join("\n");

    contactMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferredContactMethod: form.preferredContactMethod,
      subject: `Study Resources Request — ${resourceLabel} (${subjectLabel})`,
      message,
    });
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: "#F8F6F1" }}>
          <div className="max-w-md w-full mx-auto px-4 text-center py-24">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(232,168,56,0.15)" }}>
              <CheckCircle2 size={40} style={{ color: "#E8A838" }} />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: "#281A39" }}>Request Received!</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thanks for your order, <strong>{form.name}</strong>. We'll review your request and get back to you at <strong>{form.email}</strong> within 24 hours with your resource and payment details.
            </p>
            <Link href="/">
              <Button className="btn-press font-semibold" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20" style={{ backgroundColor: "#F8F6F1" }}>
        {/* Header */}
        <section className="py-14" style={{ background: "linear-gradient(135deg, #281A39 0%, #160D22 100%)" }}>
          <div className="container text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen size={20} style={{ color: "#E8A838" }} />
              <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: "#E8A838" }}>Study Resources</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">Order Your Resources</h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Tailored revision materials crafted by students who sat the same exams — delivered straight to your inbox.
            </p>
          </div>
        </section>

        {/* Progress bar */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="container py-4">
            <div className="flex items-center gap-2 max-w-lg mx-auto">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= s
                        ? "text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    style={step >= s ? { backgroundColor: "#281A39" } : {}}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div className="flex-1 h-1 mx-1 rounded" style={{ backgroundColor: step > s ? "#E8A838" : "#E5E7EB" }} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 max-w-lg mx-auto">
              <span>Resource</span>
              <span>Subject & Level</span>
              <span>Your Details</span>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        <div className="container py-12">
          <div className="max-w-2xl mx-auto">

            {/* ─── Step 1: Resource Type ─────────────────────────────── */}
            {step === 1 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "#281A39" }}>What type of resource do you need?</h2>
                <p className="text-gray-500 mb-8">Select the format that works best for you. Prices are per pack.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {RESOURCE_TYPES.map((rt) => {
                    const Icon = rt.icon;
                    const selected = form.resourceType === rt.id;
                    return (
                      <button
                        key={rt.id}
                        onClick={() => set("resourceType", rt.id)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all ${
                          selected ? "border-amber shadow-md" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        style={selected ? { borderColor: "#E8A838", backgroundColor: "rgba(232,168,56,0.05)" } : {}}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: selected ? "rgba(232,168,56,0.15)" : "#F3F4F6" }}>
                            <Icon size={20} style={{ color: selected ? "#E8A838" : "#6B7280" }} />
                          </div>
                          <span className="text-sm font-bold" style={{ color: "#E8A838" }}>{rt.price}</span>
                        </div>
                        <p className="font-semibold mb-1" style={{ color: "#281A39" }}>{rt.label}</p>
                        <p className="text-sm text-gray-500">{rt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Other text input */}
                {form.resourceType === "other" && (
                  <div className="mt-4">
                    <Label className="mb-2 block font-medium" style={{ color: "#281A39" }}>Please describe what you need</Label>
                    <Textarea
                      placeholder="e.g. A summary sheet of key formulas for A-Level Maths..."
                      value={form.resourceTypeOther}
                      onChange={(e) => set("resourceTypeOther", e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ─── Step 2: Subject & Level ───────────────────────────── */}
            {step === 2 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "#281A39" }}>Which subject and level?</h2>
                <p className="text-gray-500 mb-8">Choose the subject and education level for your resource.</p>

                <div className="mb-8">
                  <Label className="mb-3 block font-semibold" style={{ color: "#281A39" }}>Subject</Label>
                  <div className="flex flex-wrap gap-2">
                    {[...SUBJECTS, "Other"].map((s) => {
                      const val = s === "Other" ? "other" : s;
                      const selected = form.subject === val;
                      return (
                        <button
                          key={s}
                          onClick={() => set("subject", val)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                            selected ? "text-white" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                          style={selected ? { backgroundColor: "#281A39", borderColor: "#281A39" } : {}}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  {form.subject === "other" && (
                    <div className="mt-3">
                      <Input
                        placeholder="Enter your subject..."
                        value={form.subjectOther}
                        onChange={(e) => set("subjectOther", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <Label className="mb-3 block font-semibold" style={{ color: "#281A39" }}>Education Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => {
                      const selected = form.level === l;
                      return (
                        <button
                          key={l}
                          onClick={() => set("level", l)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                            selected ? "text-white" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                          style={selected ? { backgroundColor: "#281A39", borderColor: "#281A39" } : {}}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block font-semibold" style={{ color: "#281A39" }}>How many packs do you need?</Label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => set("quantity", String(Math.max(1, Number(form.quantity) - 1)))}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold hover:border-gray-400 transition-colors"
                    >−</button>
                    <span className="text-xl font-bold w-8 text-center" style={{ color: "#281A39" }}>{form.quantity}</span>
                    <button
                      onClick={() => set("quantity", String(Number(form.quantity) + 1))}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold hover:border-gray-400 transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 3: Contact Details ───────────────────────────── */}
            {step === 3 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "#281A39" }}>Your contact details</h2>
                <p className="text-gray-500 mb-8">We'll send your resource and invoice to this email address.</p>

                <div className="space-y-5">
                  <div>
                    <Label className="mb-2 block font-medium" style={{ color: "#281A39" }}>Full Name *</Label>
                    <Input
                      placeholder="e.g. Sarah Johnson"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium" style={{ color: "#281A39" }}>Email Address *</Label>
                    <Input
                      type="email"
                      placeholder="e.g. sarah@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium" style={{ color: "#281A39" }}>Phone Number *</Label>
                    <Input
                      type="tel"
                      placeholder="e.g. +44 7700 000000"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium" style={{ color: "#281A39" }}>Preferred Contact Method *</Label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "email", label: "Email" },
                        { id: "phone", label: "Phone call" },
                        { id: "whatsapp", label: "WhatsApp" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => set("preferredContactMethod", method.id)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            form.preferredContactMethod === method.id
                              ? "border-amber bg-amber/10 text-navy-deep"
                              : "border-gray-200 text-muted-brand hover:border-amber/40"
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium" style={{ color: "#281A39" }}>Additional Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                    <Textarea
                      placeholder="Any specific topics, exam boards, or requirements you'd like us to focus on..."
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 4: Confirm ───────────────────────────────────── */}
            {step === 4 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "#281A39" }}>Review your order</h2>
                <p className="text-gray-500 mb-8">Please check everything looks right before submitting.</p>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Resource Type</span>
                    <span className="font-semibold" style={{ color: "#281A39" }}>
                      {form.resourceType === "other" ? form.resourceTypeOther : selectedResource?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Subject</span>
                    <span className="font-semibold" style={{ color: "#281A39" }}>
                      {form.subject === "other" ? form.subjectOther : form.subject}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Level</span>
                    <span className="font-semibold" style={{ color: "#281A39" }}>{form.level}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Quantity</span>
                    <span className="font-semibold" style={{ color: "#281A39" }}>{form.quantity} pack{Number(form.quantity) > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Name</span>
                    <span className="font-semibold" style={{ color: "#281A39" }}>{form.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Email</span>
                    <span className="font-semibold" style={{ color: "#281A39" }}>{form.email}</span>
                  </div>
                  {form.notes && (
                    <div className="pt-4 border-t border-gray-100">
                      <span className="text-gray-500 text-sm block mb-1">Notes</span>
                      <p className="text-sm" style={{ color: "#281A39" }}>{form.notes}</p>
                    </div>
                  )}
                </div>

                <div className="bg-amber/10 rounded-xl p-4 text-sm text-gray-600 border border-amber/20">
                  <strong style={{ color: "#281A39" }}>What happens next?</strong> We'll review your request and reply within 24 hours with your tailored resource and a payment link. No upfront payment required.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-10">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </Button>
              ) : (
                <Link href="/study-resources">
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft size={16} /> Back to Resources
                  </Button>
                </Link>
              )}

              {step < 4 ? (
                <Button
                  disabled={!canNext()}
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  className="btn-press gap-2 font-semibold"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  Continue <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={contactMutation.isPending}
                  className="btn-press gap-2 font-semibold"
                  style={{ backgroundColor: "#281A39", color: "white" }}
                >
                  {contactMutation.isPending ? "Sending…" : "Submit Request"}
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
