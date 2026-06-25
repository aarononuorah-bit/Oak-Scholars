import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Mail, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CONTACT_METHODS = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone call" },
  { id: "whatsapp", label: "WhatsApp" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.subject || !form.message || !preferredContactMethod) {
      toast.error("Please fill in all fields and select a preferred contact method.");
      return;
    }
    submitMutation.mutate({ ...form, preferredContactMethod });
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="container py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Get in touch</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep mb-4">
            We'd love to hear from you
          </h1>
          <p className="text-muted-brand max-w-lg mx-auto">
            Have a question about our tutors, subjects, or pricing? Drop us a message and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info cards */}
          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email Us", desc: "hello@oakscholars.com", sub: "We reply within 24 hours" },
              { icon: MessageSquare, title: "Live Chat", desc: "Available on our site", sub: "Mon–Fri, 9am–6pm" },
              { icon: Clock, title: "Response Time", desc: "Under 24 hours", sub: "Usually much faster" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(232,168,56,0.1)" }}>
                  <item.icon size={18} className="text-amber" />
                </div>
                <div>
                  <p className="font-semibold text-navy-deep text-sm">{item.title}</p>
                  <p className="text-navy-deep text-sm">{item.desc}</p>
                  <p className="text-muted-brand text-xs mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
                <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-amber" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-navy-deep mb-3">Message Sent!</h2>
                <p className="text-muted-brand">
                  Thanks, <strong>{form.name}</strong>! We've received your message and will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-navy-deep mb-1.5 block">Your Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" required />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-navy-deep mb-1.5 block">Email Address *</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-navy-deep mb-1.5 block">Phone Number *</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+44 7700 000000" required />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Preferred Contact Method *</Label>
                  <div className="flex flex-wrap gap-3">
                    {CONTACT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPreferredContactMethod(method.id)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          preferredContactMethod === method.id
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
                  <Label htmlFor="subject" className="text-sm font-semibold text-navy-deep mb-1.5 block">Subject *</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Question about A-Level Maths tutoring" required />
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm font-semibold text-navy-deep mb-1.5 block">Message *</Label>
                  <Textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us how we can help..." rows={5} required />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-press font-semibold"
                  disabled={submitMutation.isPending}
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  {submitMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
