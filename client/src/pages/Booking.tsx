import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight, ChevronLeft, CreditCard, Calendar, User, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";

const SUBJECTS = [
  "Mathematics", "Further Maths", "Physics", "Chemistry", "Biology",
  "English Literature", "English Language", "History", "Geography",
  "Economics", "Business Studies", "Computer Science", "Psychology",
  "French", "Spanish", "Latin", "Art & Design", "Music", "Other",
];

const LEVELS = ["11+", "13+", "KS3", "GCSE / IGCSE", "A-Level", "IB", "Other"];

const TIMES = [
  "Weekday mornings", "Weekday afternoons", "Weekday evenings",
  "Saturday mornings", "Saturday afternoons", "Sunday mornings", "Sunday afternoons",
  "Flexible / Discuss",
];

const PACKAGES = [
  {
    id: "trial" as const,
    name: "Trial Session",
    price: "£15",
    original: "£30",
    badge: "50% off",
    desc: "First session at half price. No commitment.",
    highlight: true,
  },
  {
    id: "single" as const,
    name: "Single Session",
    price: "£30",
    desc: "Pay as you go.",
    highlight: false,
  },
  {
    id: "bundle4" as const,
    name: "4-Session Bundle",
    price: "£100",
    save: "Save £20",
    desc: "4 sessions, one month of focused learning.",
    highlight: false,
  },
  {
    id: "bundle8" as const,
    name: "8-Session Bundle",
    price: "£190",
    save: "Save £50",
    desc: "8 sessions, maximum progress.",
    highlight: false,
  },
];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  subject: string;
  level: string;
  packageId: "trial" | "single" | "bundle4" | "bundle8" | "";
  preferredTime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
}

const STEP_LABELS = ["Subject & Level", "Choose Package", "Preferred Time", "Your Details"];
const STEP_ICONS = [BookOpen, CreditCard, Calendar, User];

export default function Booking() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null);
  const [form, setForm] = useState<FormData>({
    subject: "", level: "", packageId: "", preferredTime: "",
    firstName: "", lastName: "", email: "", phone: "", message: "", consent: false,
  });

  const [location] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") setPaymentStatus("success");
    else if (payment === "cancelled") setPaymentStatus("cancelled");
  }, [location]);

  const submitMutation = trpc.booking.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const checkoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message || "Could not create checkout session."),
  });

  const update = (field: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canAdvance = () => {
    if (step === 1) return form.subject && form.level;
    if (step === 2) return !!form.packageId;
    if (step === 3) return !!form.preferredTime;
    if (step === 4) return form.firstName && form.lastName && form.email && form.consent;
    return false;
  };

  const handleSubmit = () => {
    if (!form.packageId) return;
    // First submit the booking to DB
    submitMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      subject: form.subject,
      level: form.level,
      sessionType: form.packageId,
      preferredTime: form.preferredTime,
      message: form.message || undefined,
    });
  };

  const handleStripeCheckout = () => {
    if (!form.packageId) return;
    checkoutMutation.mutate({
      productId: form.packageId,
      origin: window.location.origin,
      customerEmail: form.email || undefined,
      customerName: form.firstName ? `${form.firstName} ${form.lastName}` : undefined,
    });
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container py-32 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Payment Successful!</h1>
          <p className="text-muted-brand mb-8">Your session has been booked and paid. We'll be in touch within 24 hours to confirm your tutor and session time.</p>
          <Button style={{ backgroundColor: "#E8A838", color: "#0F1B35" }} onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container py-32 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-amber" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Booking Received!</h1>
            <p className="text-muted-brand mb-2">
              Thanks, <strong>{form.firstName}</strong>! We've received your booking request for <strong>{form.subject}</strong>.
            </p>
            <p className="text-muted-brand text-sm mb-8">
              We'll match you with a tutor and confirm your session within 24 hours. Check your email for a confirmation.
            </p>

            {form.packageId && (
              <div className="mb-8">
                <p className="text-sm text-muted-brand mb-3">Ready to pay now?</p>
                <Button
                  onClick={handleStripeCheckout}
                  disabled={checkoutMutation.isPending}
                  className="btn-press font-semibold"
                  style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}
                >
                  <CreditCard size={16} className="mr-2" />
                  {checkoutMutation.isPending ? "Redirecting..." : "Pay with Stripe"}
                </Button>
              </div>
            )}

            <div className="mt-4">
              <PushNotificationPrompt />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="container py-24 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-navy-deep mb-3">Book a Session</h1>
          <p className="text-muted-brand">Your first session is 50% off. No commitment required.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10">
          {STEP_LABELS.map((label, i) => {
            const num = (i + 1) as Step;
            const Icon = STEP_ICONS[i];
            const active = step === num;
            const done = step > num;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i < STEP_LABELS.length - 1 ? "flex-1" : ""}`}>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      done ? "bg-green-500 text-white" : active ? "text-white" : "bg-gray-100 text-gray-400"
                    }`}
                    style={active ? { backgroundColor: "#E8A838", color: "#0F1B35" } : {}}
                  >
                    {done ? <CheckCircle size={18} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-navy-deep" : "text-muted-brand"}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded-full ${done ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {/* Step 1: Subject & Level */}
          {step === 1 && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">What do you need help with?</h2>
              <div className="mb-6">
                <Label className="text-sm font-semibold text-navy-deep mb-3 block">Subject</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => update("subject", s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        form.subject === s
                          ? "border-amber text-navy-deep"
                          : "border-gray-200 text-muted-brand hover:border-amber/40"
                      }`}
                      style={form.subject === s ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-3 block">Level</Label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => update("level", l)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                        form.level === l
                          ? "border-amber text-navy-deep"
                          : "border-gray-200 text-muted-brand hover:border-amber/40"
                      }`}
                      style={form.level === l ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Package */}
          {step === 2 && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">Choose your package</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => update("packageId", pkg.id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                      form.packageId === pkg.id
                        ? "border-amber shadow-md"
                        : "border-gray-100 hover:border-amber/40"
                    }`}
                    style={form.packageId === pkg.id ? { backgroundColor: "rgba(232,168,56,0.05)" } : {}}
                  >
                    {pkg.badge && (
                      <span className="inline-block bg-amber text-navy-deep text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                        {pkg.badge}
                      </span>
                    )}
                    {pkg.save && (
                      <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                        {pkg.save}
                      </span>
                    )}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-serif text-2xl font-bold text-navy-deep">{pkg.price}</span>
                      {pkg.original && <span className="text-muted-brand text-sm line-through">{pkg.original}</span>}
                    </div>
                    <p className="font-semibold text-navy-deep text-sm">{pkg.name}</p>
                    <p className="text-muted-brand text-xs mt-1">{pkg.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preferred Time */}
          {step === 3 && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">When works best for you?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => update("preferredTime", t)}
                    className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                      form.preferredTime === t
                        ? "border-amber text-navy-deep"
                        : "border-gray-100 text-muted-brand hover:border-amber/40"
                    }`}
                    style={form.preferredTime === t ? { backgroundColor: "rgba(232,168,56,0.05)" } : {}}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Contact Details */}
          {step === 4 && (
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">Your details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-navy-deep mb-1.5 block">First Name *</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Jane" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-navy-deep mb-1.5 block">Last Name *</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Smith" />
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="email" className="text-sm font-semibold text-navy-deep mb-1.5 block">Email Address *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
              </div>
              <div className="mb-4">
                <Label htmlFor="phone" className="text-sm font-semibold text-navy-deep mb-1.5 block">Phone Number (optional)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+44 7700 900000" />
              </div>
              <div className="mb-6">
                <Label htmlFor="message" className="text-sm font-semibold text-navy-deep mb-1.5 block">Anything else? (optional)</Label>
                <Textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Upcoming exam dates, specific topics, learning goals..." rows={3} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                  className="mt-0.5 accent-amber"
                />
                <span className="text-sm text-muted-brand">
                  I agree to the{" "}
                  <a href="/terms" className="text-amber underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-amber underline">Privacy Policy</a>.
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canAdvance()}
                className="btn-press flex items-center gap-2"
                style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}
              >
                Continue
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canAdvance() || submitMutation.isPending}
                className="btn-press flex items-center gap-2"
                style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Booking"}
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
