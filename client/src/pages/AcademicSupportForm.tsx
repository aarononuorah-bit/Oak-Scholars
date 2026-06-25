import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Award, FileText, Briefcase, MessageSquare, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SERVICE_OPTIONS = [
  { id: "personal-statement", label: "Personal Statement Help", icon: <FileText size={18} /> },
  { id: "epq", label: "EPQ Support", icon: <Award size={18} /> },
  { id: "cv", label: "CV Writing", icon: <Briefcase size={18} /> },
  { id: "interview", label: "Interview Preparation", icon: <MessageSquare size={18} /> },
];

const YEAR_GROUPS = ["Year 10", "Year 11", "Year 12", "Year 13", "Gap Year", "Other"];

type Step = 1 | 2 | 3;

export default function AcademicSupportForm() {
  const [step, setStep] = useState<Step>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [preferredContactMethod, setPreferredContactMethod] = useState<"email" | "phone" | "whatsapp" | "">("" as "");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    yearGroup: "",
    targetUniversity: "",
    targetCourse: "",
    deadline: "",
    message: "",
  });

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service you need help with.");
      return;
    }
    if (!form.phone) {
      toast.error("Please provide a phone number.");
      return;
    }
    if (!preferredContactMethod) {
      toast.error("Please select a preferred contact method.");
      return;
    }
    const serviceLabels = selectedServices
      .map((id) => SERVICE_OPTIONS.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(", ");

    contactMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferredContactMethod: preferredContactMethod,
      subject: `Academic Support Enquiry — ${serviceLabels}`,
      message: [
        `Services requested: ${serviceLabels}`,
        `Year group: ${form.yearGroup || "Not specified"}`,
        `Target university: ${form.targetUniversity || "Not specified"}`,
        `Target course: ${form.targetCourse || "Not specified"}`,
        `Deadline / urgency: ${form.deadline || "Not specified"}`,
        `Phone: ${form.phone || "Not provided"}`,
        "",
        form.message ? `Additional info:\n${form.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(232,168,56,0.1)" }}>
              <CheckCircle size={32} className="text-amber" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-navy-deep mb-3">Enquiry received!</h2>
            <p className="text-muted-brand mb-6">
              Thank you, {form.name.split(" ")[0]}. We'll be in touch within 24 hours to discuss how we can help with your application.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/support-guidance">
                <Button variant="outline" className="border-navy/20 text-navy-deep">Back to Support</Button>
              </Link>
              <Link href="/">
                <Button style={{ backgroundColor: "#E8A838", color: "#281A39" }}>Go to Homepage</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-16"
        style={{ background: "linear-gradient(160deg, #281A39 0%, #160D22 100%)" }}
      >
        <div className="container">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-px bg-amber" />
            <span className="text-amber text-xs font-semibold tracking-widest uppercase">Academic Support</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Let's strengthen your <em className="text-amber not-italic">application</em>
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Tell us what you need help with and we'll match you with the right mentor. We'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-surface">
        <div className="container max-w-2xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= s ? "bg-amber text-navy-deep" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step > s ? <CheckCircle size={16} /> : s}
                </div>
                {s < 3 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all duration-300 ${
                    step > s ? "bg-amber" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-fade-in">
            {step === 1 && (
              <div className="space-y-6 animate-slide-in-right">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">What are your goals?</h2>
                  <p className="text-muted-brand text-sm mb-6">Select the services you're interested in.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICE_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          selectedServices.includes(s.id)
                            ? "border-amber bg-amber/10 text-navy-deep"
                            : "border-gray-200 text-muted-brand hover:border-amber/40"
                        }`}
                      >
                        <span className={selectedServices.includes(s.id) ? "text-amber" : "text-gray-400"}>{s.icon}</span>
                        {s.label}
                        {selectedServices.includes(s.id) && <CheckCircle size={14} className="text-amber ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (selectedServices.length === 0) {
                        toast.error("Please select at least one service.");
                        return;
                      }
                      setStep(2);
                    }}
                    style={{ backgroundColor: "#281A39", color: "white" }}
                  >
                    Next Step <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-slide-in-right">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">Application Details</h2>
                  <p className="text-muted-brand text-sm mb-6">Tell us a bit about where you're heading.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Year Group</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
                        value={form.yearGroup}
                        onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                      >
                        <option value="">Select year group</option>
                        {YEAR_GROUPS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Deadline / Urgency</label>
                      <Input
                        placeholder="e.g. Oct 15"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Target University</label>
                      <Input
                        placeholder="e.g. Oxford"
                        value={form.targetUniversity}
                        onChange={(e) => setForm({ ...form, targetUniversity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Target Course</label>
                      <Input
                        placeholder="e.g. Law"
                        value={form.targetCourse}
                        onChange={(e) => setForm({ ...form, targetCourse: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={() => setStep(1)}>Back</Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)}
                    style={{ backgroundColor: "#281A39", color: "white" }}
                  >
                    Next Step <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-slide-in-right">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">Final Details</h2>
                  <p className="text-muted-brand text-sm mb-6">How should we reach you?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Full Name <span className="text-amber">*</span></label>
                      <Input
                        required
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Email Address <span className="text-amber">*</span></label>
                      <Input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Phone Number <span className="text-amber">*</span></label>
                      <Input
                        required
                        type="tel"
                        placeholder="+44 7700 000000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-deep mb-1.5">Preferred Contact <span className="text-amber">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {["email", "phone", "whatsapp"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPreferredContactMethod(m as any)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                              preferredContactMethod === m ? "border-amber bg-amber/10 text-navy-deep" : "border-gray-200 text-muted-brand"
                            }`}
                          >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-navy-deep mb-1.5">Anything else?</label>
                    <Textarea
                      rows={3}
                      placeholder="Any specific areas you'd like help with..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={() => setStep(2)}>Back</Button>
                  <Button
                    type="submit"
                    className="btn-press font-semibold"
                    style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Enquiry"}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-muted-brand">
              We'll respond within 24 hours. Your information is kept confidential.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
