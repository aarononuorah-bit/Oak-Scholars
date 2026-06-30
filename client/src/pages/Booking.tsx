import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight, ChevronLeft, CreditCard, Calendar, User, BookOpen, X, Lock, AlertCircle, CalendarCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import Step3Availability from "@/components/Step3Availability";
import PageMeta from "@/components/PageMeta";

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
  { id: "trial" as const, name: "Trial Session", price: "£15", original: "£30", badge: "50% off", desc: "First session at half price. No commitment.", highlight: true },
  { id: "single" as const, name: "Single Session", price: "£30", desc: "Pay as you go.", highlight: false },
  { id: "bundle4" as const, name: "4-Session Bundle", price: "£100", save: "Save £20", desc: "4 sessions, one month of focused learning.", highlight: false },
  { id: "bundle8" as const, name: "8-Session Bundle", price: "£190", save: "Save £50", desc: "8 sessions, maximum progress.", highlight: false },
];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  subject: string; level: string; packageId: "trial" | "single" | "bundle4" | "bundle8" | ""; preferredTime: string;
  firstName: string; lastName: string; email: string; phone: string; preferredContactMethod: "email" | "phone" | "whatsapp" | "";
  message: string; consent: boolean; marketingOptIn: boolean;
}

const STEP_LABELS = ["Subject & Level", "Choose Package", "Preferred Time", "Your Details"];
const STEP_ICONS = [BookOpen, CreditCard, Calendar, User];

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
    subject: "", level: "", packageId: "", preferredTime: "", firstName: "", lastName: "", email: "", phone: "", preferredContactMethod: "", message: "", consent: false, marketingOptIn: false,
  });
  const [subjectSearch, setSubjectSearch] = useState("");
  const [location] = useLocation();

  // Check if user is logged in
  const { data: user } = trpc.auth.me.useQuery();
  const { data: trialEligibility } = trpc.account.trialEligibility.useQuery(undefined, {
    enabled: !!user,
  });

  const availablePackages = trialEligibility?.eligible === false 
    ? PACKAGES.filter(p => p.id !== "trial") 
    : PACKAGES;

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        firstName: f.firstName || user.name?.split(" ")[0] || "",
        lastName: f.lastName || user.name?.split(" ").slice(1).join(" ") || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

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
    onSuccess: (data) => { if (data.url) window.location.href = data.url; },
    onError: (err) => toast.error(err.message || "Could not create checkout session."),
  });

  const update = (field: keyof FormData, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

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
      firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, preferredContactMethod: form.preferredContactMethod,
      subject: form.subject, level: form.level, sessionType: form.packageId, preferredTime: form.preferredTime, message: form.message || undefined,
    });
  };

  const handleStripeCheckout = () => {
    if (!form.packageId) return;
    checkoutMutation.mutate({
      productId: form.packageId, origin: window.location.origin, customerEmail: form.email || undefined, customerName: form.firstName ? `${form.firstName} ${form.lastName}` : undefined,
      rewardId: rewardInfo?.id, rewardType: rewardInfo?.type,
    });
  };

  const advanceStep = () => { if (canAdvance() && step < 4) setStep((s) => (s + 1) as Step); };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container py-32 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(34,197,94,0.1)", animation: "scaleIn 400ms cubic-bezier(0.23,1,0.32,1) both" }}>
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Payment Successful!</h1>
          <p className="text-muted-brand mb-8 leading-relaxed">Your session has been booked and paid. We'll be in touch within 24 hours to confirm your Oak Scholar and session time.</p>
          <Button className="btn-press" style={{ backgroundColor: "#E8A838", color: "#281A39" }} onClick={() => window.location.href = "/"}>Back to Home</Button>
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
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center" style={{ animation: "scaleIn 400ms cubic-bezier(0.23,1,0.32,1) both" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(232,168,56,0.1)" }}>
              <CheckCircle size={32} className="text-amber" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Booking Received!</h1>
            <p className="text-muted-brand mb-2">Thanks, <strong>{form.firstName}</strong>! We've received your booking request for <strong>{form.subject}</strong>.</p>
            <p className="text-muted-brand text-sm mb-8">We'll match you with an Oak Scholar and confirm your session within 24 hours. Check your email for a confirmation.</p>
            {form.packageId && (
              <div className="mb-8">
                <p className="text-sm text-muted-brand mb-3">Ready to pay now?</p>
                <Button onClick={handleStripeCheckout} disabled={checkoutMutation.isPending} className="btn-press font-semibold" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                  <CreditCard size={16} className="mr-2" />
                  {checkoutMutation.isPending ? "Redirecting..." : "Pay with Stripe"}
                </Button>
              </div>
            )}
            <div className="mt-4"><PushNotificationPrompt /></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <PageMeta
        title="Book a Tutoring Session"
        description="Book your first 1:1 tutoring session with Oak Scholars at 50% off. Expert tutors for 11+, GCSE, A-Level and IB. No commitment required."
        url="/booking"
      />
      <Navbar />

      <div className="container py-24 max-w-2xl mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="font-serif text-4xl font-bold text-navy-deep mb-3">Book a Session</h1>
          <p className="text-muted-brand">Your first session is 50% off. No commitment required.</p>
        </div>

        {paymentStatus === "cancelled" && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in mx-auto max-w-lg">
            <div className="mt-0.5"><AlertCircle size={18} className="text-red-500" /></div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-red-800">Payment Cancelled</h3>
              <p className="text-xs text-red-600 mt-1">Your checkout session was abandoned or cancelled. Don't worry, you can try completing your booking again when you're ready.</p>
            </div>
          </div>
        )}

        <div className="mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="relative flex justify-between items-center max-w-lg mx-auto">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            <div className="absolute top-5 left-0 h-0.5 bg-amber transition-all duration-500 -translate-y-1/2 z-0" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            {[
              { id: 1, label: "Subject", icon: BookOpen }, { id: 2, label: "Package", icon: CreditCard },
              { id: 3, label: "Time", icon: Calendar }, { id: 4, label: "Details", icon: User }
            ].map((s) => {
              const Icon = s.icon; const active = step === s.id; const done = step > s.id;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-4 ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-[#281A39] border-[#281A39] text-white shadow-md" : "bg-white border-gray-100 text-gray-400"}`}>
                    {done ? <CheckCircle size={18} /> : <Icon size={16} />}
                  </div>
                  <span className={`absolute -bottom-7 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${active ? "text-navy-deep" : done ? "text-green-600" : "text-gray-400"}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ animation: "fadeInUp 400ms cubic-bezier(0.23,1,0.32,1) 150ms both" }}>
          <div className="p-8">
            <StepContent stepKey={step}>
              {step === 1 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">What do you need help with?</h2>
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <Label className="text-sm font-semibold text-navy-deep block">Subject</Label>
                      <div className="relative w-full sm:w-64">
                        <Input type="text" placeholder="Search subjects..." value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} className="h-9 text-sm pr-8" />
                        {subjectSearch && <button onClick={() => setSubjectSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-brand hover:text-navy-deep transition-colors"><X size={14} /></button>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                      {SUBJECTS.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).map((s) => (
                        <button key={s} onClick={() => update("subject", s)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${form.subject === s ? "border-amber text-navy-deep shadow-sm scale-105" : "border-gray-100 text-muted-brand hover:border-amber/40 hover:scale-105"}`} style={form.subject === s ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-navy-deep mb-3 block">Level</Label>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((l) => (
                        <button key={l} onClick={() => update("level", l)} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${form.level === l ? "border-amber text-navy-deep scale-105" : "border-gray-200 text-muted-brand hover:border-amber/40 hover:scale-105"}`} style={form.level === l ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">Choose your package</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availablePackages.map((pkg) => (
                      <button key={pkg.id} onClick={() => update("packageId", pkg.id)} className={`text-left p-5 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${form.packageId === pkg.id ? "border-amber shadow-md" : "border-gray-100 hover:border-amber/40 hover:shadow-sm"}`} style={form.packageId === pkg.id ? { backgroundColor: "rgba(232,168,56,0.05)" } : {}}>
                        {pkg.badge && <span className="inline-block bg-amber text-navy-deep text-xs font-bold px-2 py-0.5 rounded-full mb-2">{pkg.badge}</span>}
                        {pkg.save && <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mb-2">{pkg.save}</span>}
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-serif text-2xl font-bold text-navy-deep">{rewardInfo ? `£${Math.round(parseInt(pkg.price.replace("£", "")) * 0.8)}` : pkg.price}</span>
                          {(pkg.original || rewardInfo) && <span className="text-muted-brand text-sm line-through">{rewardInfo ? pkg.price : pkg.original}</span>}
                        </div>
                        <p className="font-semibold text-navy-deep text-sm">{pkg.name}</p>
                        <p className="text-muted-brand text-xs mt-1">{pkg.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <Step3Availability
                  user={user}
                  form={form}
                  update={update}
                />
              )}

              {step === 4 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">Your details</h2>
                  
                  {!user && (
                    <div className="mb-6 p-4 bg-amber/10 border border-amber/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-navy-deep">Already an Oak Scholar?</h3>
                        <p className="text-xs text-muted-brand mt-1">Log in to automatically fill your details.</p>
                      </div>
                      <Link href="/login">
                        <Button variant="outline" className="text-xs h-8 border-amber/50 hover:bg-amber/20 text-navy-deep">Log In</Button>
                      </Link>
                    </div>
                  )}

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
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" disabled={!!user} />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="phone" className="text-sm font-semibold text-navy-deep mb-1.5 block">Phone Number *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+44 7700 900000" />
                  </div>
                  <div className="mb-6">
                    <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Preferred Contact Method *</Label>
                    <div className="flex flex-wrap gap-3">
                      {[{ id: "email", label: "Email" }, { id: "phone", label: "Phone call" }, { id: "whatsapp", label: "WhatsApp" }].map((method) => (
                        <button key={method.id} type="button" onClick={() => update("preferredContactMethod", method.id)} className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${form.preferredContactMethod === method.id ? "border-amber bg-amber/10 text-navy-deep scale-105" : "border-gray-200 text-muted-brand hover:border-amber/40"}`}>{method.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="message" className="text-sm font-semibold text-navy-deep mb-1.5 block">Anything else? (optional)</Label>
                    <Textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Upcoming exam dates, specific topics, learning goals..." rows={3} />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-0.5 accent-amber" />
                      <span className="text-sm text-muted-brand group-hover:text-navy-deep transition-colors duration-200">
                        I agree to the <a href="/terms" className="text-amber underline hover:text-amber/80">Terms of Service</a> and <a href="/privacy" className="text-amber underline hover:text-amber/80">Privacy Policy</a>. *
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </StepContent>
          </div>

          <div className="flex justify-between items-center px-8 py-5 border-t border-gray-100 bg-gray-50/50">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1) as Step)} disabled={step === 1} className="flex items-center gap-2 transition-all duration-200"><ChevronLeft size={16} /> Back</Button>
            
            {step < 4 ? (
              <Button onClick={advanceStep} disabled={!canAdvance()} className={`btn-press flex items-center gap-2 transition-all duration-200 ${!canAdvance() ? "opacity-50 cursor-not-allowed" : ""}`} style={{ backgroundColor: "#E8A838", color: "#281A39" }}>Continue <ChevronRight size={16} /></Button>
            ) : user ? (
              <Button onClick={handleSubmit} disabled={!canAdvance() || submitMutation.isPending || checkoutMutation.isPending} className="btn-press flex items-center gap-2" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                {submitMutation.isPending || checkoutMutation.isPending ? (<><span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Redirecting...</>) : (<>Book & Pay <ChevronRight size={16} /></>)}
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs font-medium text-red-500 whitespace-nowrap hidden sm:inline">An account is required to book.</span>
                <Link href={`/register?redirect=/booking`}>
                  <Button className="btn-press" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>Create Account to Book</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
