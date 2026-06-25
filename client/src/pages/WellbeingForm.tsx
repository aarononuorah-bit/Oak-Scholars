import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Heart, Shield, Users, Smile } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUPPORT_TYPES = [
  { id: "mental-health", label: "Mental Health & Stress", icon: <Heart size={18} /> },
  { id: "bullying", label: "Bullying & Social Challenges", icon: <Shield size={18} /> },
  { id: "wellbeing", label: "General Wellbeing Check-ins", icon: <Users size={18} /> },
  { id: "transitions", label: "Transition & Life Skills", icon: <Smile size={18} /> },
];

const YEAR_GROUPS = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13", "Other"];

const CONTACT_PREFS = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone call" },
  { id: "whatsapp", label: "WhatsApp" },
];

export default function WellbeingForm() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [contactPref, setContactPref] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    yearGroup: "",
    message: "",
    parentName: "",
    isParent: false,
  });

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      toast.error("Please select at least one area you'd like support with.");
      return;
    }
    if (!form.phone) {
      toast.error("Please provide a phone number.");
      return;
    }
    const typeLabels = selectedTypes
      .map((id) => SUPPORT_TYPES.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(", ");

    contactMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferredContactMethod: contactPref,
      subject: `Wellbeing Support Enquiry — ${typeLabels}`,
      message: [
        `Support areas: ${typeLabels}`,
        `Year group: ${form.yearGroup || "Not specified"}`,
        `Preferred contact: ${contactPref || "Not specified"}`,
        `Phone: ${form.phone || "Not provided"}`,
        form.isParent ? `Enquiring as: Parent/Guardian (${form.parentName || "name not provided"})` : "Enquiring as: Student",
        "",
        form.message ? `Additional context:\n${form.message}` : "",
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
              <Heart size={32} className="text-amber" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-navy-deep mb-3">We've got your message</h2>
            <p className="text-muted-brand mb-6">
              Thank you for reaching out, {form.name.split(" ")[0]}. Someone from our team will be in touch within 24 hours — you're not alone in this.
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
            <span className="text-amber text-xs font-semibold tracking-widest uppercase">Wellbeing Support</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            You don't have to face it <em className="text-amber not-italic">alone</em>
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            This form is completely confidential. Tell us a little about what you're going through and we'll reach out within 24 hours.
          </p>
        </div>
      </section>

      {/* Reassurance strip */}
      <div className="py-4 text-center text-sm font-medium" style={{ backgroundColor: "rgba(232,168,56,0.1)", color: "#281A39" }}>
        🔒 Everything you share is completely confidential and handled with care.
      </div>

      {/* Form */}
      <section className="py-16 bg-surface">
        <div className="container max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">

            {/* Who is enquiring */}
            <div>
              <label className="block font-semibold text-navy-deep mb-3">Who is making this enquiry?</label>
              <div className="flex gap-3">
                {[
                  { val: false, label: "I'm a student" },
                  { val: true, label: "I'm a parent / guardian" },
                ].map((opt) => (
                  <button
                    key={String(opt.val)}
                    type="button"
                    onClick={() => setForm({ ...form, isParent: opt.val })}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      form.isParent === opt.val
                        ? "border-amber bg-amber/10 text-navy-deep"
                        : "border-gray-200 text-muted-brand hover:border-amber/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Support type */}
            <div>
              <label className="block font-semibold text-navy-deep mb-3">
                What would you like support with? <span className="text-amber">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORT_TYPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleType(s.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      selectedTypes.includes(s.id)
                        ? "border-amber bg-amber/10 text-navy-deep"
                        : "border-gray-200 text-muted-brand hover:border-amber/40"
                    }`}
                  >
                    <span className={selectedTypes.includes(s.id) ? "text-amber" : "text-gray-400"}>{s.icon}</span>
                    {s.label}
                    {selectedTypes.includes(s.id) && <CheckCircle size={14} className="text-amber ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy-deep mb-1.5">
                  {form.isParent ? "Student's Name" : "Your Name"} <span className="text-amber">*</span>
                </label>
                <Input
                  required
                  placeholder="Full name"
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
              {form.isParent && (
                <div>
                  <label className="block text-sm font-semibold text-navy-deep mb-1.5">Your Name (Parent/Guardian)</label>
                  <Input
                    placeholder="Parent or guardian's name"
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  />
                </div>
              )}
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
            </div>

            {/* Preferred contact */}
            <div>
              <label className="block font-semibold text-navy-deep mb-3">Preferred way to be contacted</label>
              <div className="flex flex-wrap gap-3">
                {CONTACT_PREFS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setContactPref(p.id)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      contactPref === p.id
                        ? "border-amber bg-amber/10 text-navy-deep"
                        : "border-gray-200 text-muted-brand hover:border-amber/40"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-deep mb-1.5">
                Would you like to share anything else? <span className="text-muted-brand font-normal">(optional)</span>
              </label>
              <Textarea
                rows={4}
                placeholder="You don't have to share anything you're not comfortable with. Any context you can give helps us match you with the right person..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full btn-press font-semibold text-base"
              style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              disabled={contactMutation.isPending}
            >
              {contactMutation.isPending ? "Sending..." : "Send My Enquiry"}
            </Button>

            <p className="text-center text-xs text-muted-brand">
              All enquiries are treated with complete confidentiality. We'll respond within 24 hours.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
