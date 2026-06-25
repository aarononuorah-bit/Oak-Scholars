import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight, ChevronLeft, CreditCard, Calendar, User, BookOpen, X, Lock } from "lucide-react";
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
  preferredContactMethod: "email" | "phone" | "whatsapp" | "";
  message: string;
  consent: boolean;
  marketingOptIn: boolean;
}

const STEP_LABELS = ["Subject & Level", "Choose Package", "Preferred Time", "Your Details"];
const STEP_ICONS = [BookOpen, CreditCard, Calendar, User];

// Animated step wrapper
function StepContent({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 300ms cubic-bezier(0.23,1,0.32,1), transform 300ms cubic-bezier(0.23,1,0.32,1)";
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
  }, [stepKey]);
  return <div ref={ref}>{children}</div>;
}

export default function Booking() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null);
  const [rewardInfo, setRewardInfo] = useState<{ id: number; type: "referrer" | "referee" } | null>(null);
  const [form, setForm] = useState<FormData>({
    subject: "", level: "", packageId: "", preferredTime: "",
    firstName: "", lastName: "", email: "", phone: "", preferredContactMethod: "", message: "", consent: false, marketingOptIn: false,
  });
  const [subjectSearch, setSubjectSearch] = useState("");

  const [location] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") setPaymentStatus("success");
    else if (payment === "cancelled") setPaymentStatus("cancelled");

    const rewardId = params.get("rewardId");
    const rewardType = params.get("rewardType") as "referrer" | "referee" | null;
    if (rewardId && rewardType) {
      setRewardInfo({ id: parseInt(rewardId), type: rewardType });
      toast.info("Referral discount applied!");
    }
  }, [location]);

  const submitMutation = trpc.booking.submit.useMutation({
    onSuccess: () => {
      if (form.packageId) {
        checkoutMutation.mutate({
          productId: form.packageId,
          origin: window.location.origin,
          customerEmail: form.email || undefined,
          customerName: form.firstName ? `${form.firstName} ${form.lastName}` : undefined,
          rewardId: rewardInfo?.id,
          rewardType: rewardInfo?.type,
        });
      } else {
        setSubmitted(true);
      }
    },
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
    if (step === 4) return form.firstName && form.lastName && form.email && form.phone && form.preferredContactMethod && form.consent;
    return false;
  };

  const handleSubmit = () => {
    if (!form.packageId) return;
    if (!form.phone) { toast.error("Please provide a phone number."); return; }
    if (!form.preferredContactMethod) { toast.error("Please select a preferred contact method."); return; }
    submitMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      preferredContactMethod: form.preferredContactMethod,
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
      rewardId: rewardInfo?.id,
      rewardType: rewardInfo?.type,
    });
  };

  const advanceStep = () => {
    if (canAdvance() && step < 4) setStep((s) => (s + 1) as Step);
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container py-32 text-center max-w-lg mx-auto">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(34,197,94,0.1)", animation: "scaleIn 400ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Payment Successful!</h1>
          <p className="text-muted-brand mb-8 leading-relaxed">
            Your session has been booked and paid. We'll be in touch within 24 hours to confirm your Oak Scholar and session time.
          </p>
          <Button
            className="btn-press"
            style={{ backgroundColor: "#E8A838", color: "#281A39" }}
            onClick={() => window.location.href = "/"}
          >
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
          <div
            className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center"
            style={{ animation: "scaleIn 400ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(232,168,56,0.1)" }}
            >
              <CheckCircle size={32} className="text-amber" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Booking Received!</h1>
            <p className="text-muted-brand mb-2">
              Thanks, <strong>{form.firstName}</strong>! We've received your booking request for <strong>{form.subject}</strong>.
            </p>
            <p className="text-muted-brand text-sm mb-8">
              We'll match you with an Oak Scholar and confirm your session within 24 hours. Check your email for a confirmation.
            </p>
            {form.packageId && (
              <div className="mb-8">
                <p className="text-sm text-muted-brand mb-3">Ready to pay now?</p>
                <Button
                  onClick={handleStripeCheckout}
                  disabled={checkoutMutation.isPending}
                  className="btn-press font-semibold"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
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

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="container py-24 max-w-2xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="font-serif text-4xl font-bold text-navy-deep mb-3">Book a Session</h1>
          <p className="text-muted-brand">Your first session is 50% off. No commitment required.</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%`, backgroundColor: "#E8A838" }}
            />
          </div>

          <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, i) => {
              const num = (i + 1) as Step;
              const Icon = STEP_ICONS[i];
              const active = step === num;
              const done = step > num;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-400 ease-out ${
                        done
                          ? "bg-green-500 text-white shadow-md"
                          : active
                            ? "text-navy-deep shadow-lg scale-110"
                            : "bg-gray-100 text-gray-400"
                      }`}
                      style={active ? { backgroundColor: "#E8A838" } : {}}
                    >
                      {done ? <CheckCircle size={18} /> : <Icon size={16} />}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block text-center leading-tight max-w-[80px] transition-colors duration-300 ${
                      active ? "text-navy-deep font-semibold" : done ? "text-green-600" : "text-muted-brand"
                    }`}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mx-2 rounded-full transition-all duration-500"
                      style={{ backgroundColor: done ? "#22c55e" : "#e5e7eb" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          style={{ animation: "fadeInUp 400ms cubic-bezier(0.23,1,0.32,1) 150ms both" }}
        >
          <div className="p-8">
            <StepContent stepKey={step}>
              {/* Step 1: Subject & Level */}
              {step === 1 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">What do you need help with?</h2>
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <Label className="text-sm font-semibold text-navy-deep block">Subject</Label>
                      <div className="relative w-full sm:w-64">
                        <Input
                          type="text"
                          placeholder="Search subjects..."
                          value={subjectSearch}
                          onChange={(e) => setSubjectSearch(e.target.value)}
                          className="h-9 text-sm pr-8"
                        />
                        {subjectSearch && (
                          <button
                            onClick={() => setSubjectSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-brand hover:text-navy-deep transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                      {SUBJECTS.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).map((s) => (
                        <button
                          key={s}
                          onClick={() => update("subject", s)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                            form.subject === s
                              ? "border-amber text-navy-deep shadow-sm scale-105"
                              : "border-gray-100 text-muted-brand hover:border-amber/40 hover:scale-105"
                          }`}
                          style={form.subject === s ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}
                        >
                          {s}
                        </button>
                      ))}
                      {SUBJECTS.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).length === 0 && (
                        <p className="text-sm text-muted-brand py-2 italic">No subjects matching "{subjectSearch}"</p>
                      )}
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
                              ? "border-amber text-navy-deep scale-105"
                              : "border-gray-200 text-muted-brand hover:border-amber/40 hover:scale-105"
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
                        className={`text-left p-5 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${
                          form.packageId === pkg.id
                            ? "border-amber shadow-md"
                            : "border-gray-100 hover:border-amber/40 hover:shadow-sm"
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
                          <span className="font-serif text-2xl font-bold text-navy-deep">
                            {rewardInfo ? `£${Math.round(parseInt(pkg.price.replace("£", "")) * 0.8)}` : pkg.price}
                          </span>
                          {(pkg.original || rewardInfo) && (
                            <span className="text-muted-brand text-sm line-through">
                              {rewardInfo ? pkg.price : pkg.original}
                            </span>
                          )}
                          {rewardInfo && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-1">
                              20% OFF
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-navy-deep text-sm">{pkg.name}</p>
                        <p className="text-muted-brand text-xs mt-1">{pkg.desc}</p>
                        {form.packageId === pkg.id && (
                          <div className="mt-3 flex items-center gap-1 text-amber text-xs font-semibold">
                            <CheckCircle size={12} />
                            Selected
                          </div>
                        )}
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
                        className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                          form.preferredTime === t
                            ? "border-amber text-navy-deep shadow-sm"
                            : "border-gray-100 text-muted-brand hover:border-amber/40 hover:shadow-sm"
                        }`}
                        style={form.preferredTime === t ? { backgroundColor: "rgba(232,168,56,0.05)" } : {}}
                      >
                        <div className="flex items-center justify-between">
                          {t}
                          {form.preferredTime === t && <CheckCircle size={14} className="text-amber flex-shrink-0" />}
                        </div>
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
                    <Label htmlFor="phone" className="text-sm font-semibold text-navy-deep mb-1.5 block">Phone Number *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+44 7700 900000" />
                  </div>
                  <div className="mb-6">
                    <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Preferred Contact Method *</Label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: "email", label: "Email" },
                        { id: "phone", label: "Phone call" },
                        { id: "whatsapp", label: "WhatsApp" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => update("preferredContactMethod", method.id)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                            form.preferredContactMethod === method.id
                              ? "border-amber bg-amber/10 text-navy-deep scale-105"
                              : "border-gray-200 text-muted-brand hover:border-amber/40"
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="message" className="text-sm font-semibold text-navy-deep mb-1.5 block">Anything else? (optional)</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Upcoming exam dates, specific topics, learning goals..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => update("consent", e.target.checked)}
                        className="mt-0.5 accent-amber"
                      />
                      <span className="text-sm text-muted-brand group-hover:text-navy-deep transition-colors duration-200">
                        I agree to the{" "}
                        <a href="/terms" className="text-amber underline hover:text-amber/80">Terms of Service</a>
                        {" "}and{" "}
                        <a href="/privacy" className="text-amber underline hover:text-amber/80">Privacy Policy</a>. *
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.marketingOptIn}
                        onChange={(e) => update("marketingOptIn", e.target.checked)}
                        className="mt-0.5 accent-amber"
                      />
                      <span className="text-sm text-muted-brand group-hover:text-navy-deep transition-colors duration-200">
                        Keep me updated on flash sales, community events, and study tips.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </StepContent>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center px-8 py-5 border-t border-gray-100 bg-gray-50/50">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              disabled={step === 1}
              className="flex items-center gap-2 transition-all duration-200"
            >
              <ChevronLeft size={16} />
              Back
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-brand">
              <Lock size={12} />
              Secure & encrypted
            </div>

            {step < 4 ? (
              <Button
                onClick={advanceStep}
                disabled={!canAdvance()}
                className={`btn-press flex items-center gap-2 transition-all duration-200 ${!canAdvance() ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                title={!canAdvance() ? "Please complete all required fields" : ""}
              >
                Continue
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canAdvance() || submitMutation.isPending || checkoutMutation.isPending}
                className="btn-press flex items-center gap-2"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                {submitMutation.isPending || checkoutMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Book & Pay
                    <ChevronRight size={16} />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Trust signals below form */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-muted-brand animate-fade-in" style={{ animationDelay: "300ms" }}>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-green-500" />
            No commitment required
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-amber" />
            Secure payment via Stripe
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-green-500" />
            Matched within 24 hours
          </span>
        </div>
      </div>

      <Footer />
    </div>
  );
}
