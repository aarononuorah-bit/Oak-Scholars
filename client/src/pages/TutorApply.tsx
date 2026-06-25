import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight, ChevronLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUBJECTS = [
  "Mathematics", "Further Maths", "Physics", "Chemistry", "Biology",
  "English Literature", "English Language", "History", "Geography",
  "Economics", "Business Studies", "Computer Science", "Psychology",
  "French", "Spanish", "Latin", "Art & Design", "Music",
];

const LEVELS = ["11+", "13+", "KS3", "GCSE / IGCSE", "A-Level", "IB"];

const AVAILABILITY = [
  "Weekday mornings", "Weekday afternoons", "Weekday evenings",
  "Saturday mornings", "Saturday afternoons", "Sunday mornings", "Sunday afternoons",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "Recent Graduate"];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  firstName: string; lastName: string; email: string; phone: string;
  university: string; degreeSubject: string; yearOfStudy: string;
  subjects: string[]; levels: string[];
  experience: string; availability: string[]; coverLetter: string;
  cvFile: File | null; cvFileKey: string; cvFileUrl: string;
  consent: boolean;
}

export default function TutorApply() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "", phone: "",
    university: "", degreeSubject: "", yearOfStudy: "",
    subjects: [], levels: [],
    experience: "", availability: [], coverLetter: "",
    cvFile: null, cvFileKey: "", cvFileUrl: "",
    consent: false,
  });

  const uploadCvMutation = trpc.tutor.uploadCv.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({ ...f, cvFileKey: data.key, cvFileUrl: data.url }));
      toast.success("CV uploaded successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "CV upload failed.");
      setForm((f) => ({ ...f, cvFile: null }));
    },
  });

  const submitMutation = trpc.tutor.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Submission failed. Please try again."),
  });

  const update = (field: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleArray = (field: "subjects" | "levels" | "availability", value: string) => {
    setForm((f) => {
      const arr = f[field] as string[];
      return { ...f, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("CV must be under 5MB."); return; }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { toast.error("Please upload a PDF or Word document."); return; }

    setUploadingCv(true);
    update("cvFile", file);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const base64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
      await uploadCvMutation.mutateAsync({ fileName: file.name, fileBase64: base64, mimeType: file.type });
    } finally {
      setUploadingCv(false);
    }
  };

  const canAdvance = () => {
    if (step === 1) return form.firstName && form.lastName && form.email && form.phone && form.university && form.degreeSubject && form.yearOfStudy;
    if (step === 2) return form.subjects.length > 0 && form.levels.length > 0;
    if (step === 3) return form.experience.length >= 20;
    if (step === 4) return form.consent;
    return false;
  };

  const handleSubmit = () => {
    if (!form.phone) {
      toast.error("Please provide a phone number.");
      return;
    }
    submitMutation.mutate({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, phone: form.phone,
      university: form.university, degreeSubject: form.degreeSubject,
      yearOfStudy: form.yearOfStudy,
      subjects: form.subjects.join(", "),
      levels: form.levels.join(", "),
      experience: form.experience,
      availability: form.availability.join(", ") || undefined,
      cvFileKey: form.cvFileKey || undefined,
      cvFileUrl: form.cvFileUrl || undefined,
      coverLetter: form.coverLetter || undefined,
    });
  };

  const STEP_LABELS = ["Personal Info", "Subjects", "Experience", "Final Details"];

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container py-32 max-w-lg mx-auto text-center">
          <div className="bg-white rounded-2xl p-10 border border-gray-100">
            <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-amber" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Application Submitted!</h1>
            <p className="text-muted-brand mb-2">
              Thanks, <strong>{form.firstName}</strong>! We've received your application and will review it within 3–5 working days.
            </p>
            <p className="text-muted-brand text-sm">Check your email for a confirmation message.</p>
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
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Join the team</p>
          <h1 className="font-serif text-4xl font-bold text-navy-deep mb-3">Become an Oak Scholars Tutor</h1>
          <p className="text-muted-brand">Earn £25–£40/hr tutoring students in subjects you excelled at.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEP_LABELS.map((label, i) => {
            const num = (i + 1) as Step;
            const active = step === num;
            const done = step > num;
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      done ? "bg-green-500 text-white" : active ? "text-navy-deep" : "bg-gray-100 text-gray-400"
                    }`}
                    style={active ? { backgroundColor: "#E8A838" } : {}}
                  >
                    {done ? <CheckCircle size={16} /> : num}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${active ? "text-navy-deep font-semibold" : "text-muted-brand"}`}>
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

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">Tell us about yourself</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Jane" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Smith" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Email Address *</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@university.ac.uk" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Phone Number *</Label>
                <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+44 7700 900000" required />
              </div>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">University *</Label>
                <Input value={form.university} onChange={(e) => update("university", e.target.value)} placeholder="University of Oxford" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Degree Subject *</Label>
                  <Input value={form.degreeSubject} onChange={(e) => update("degreeSubject", e.target.value)} placeholder="Mathematics" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Year of Study *</Label>
                  <select
                    value={form.yearOfStudy}
                    onChange={(e) => update("yearOfStudy", e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Subjects */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">What can you teach?</h2>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-3 block">Subjects * (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArray("subjects", s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        form.subjects.includes(s) ? "border-amber text-navy-deep" : "border-gray-200 text-muted-brand hover:border-amber/40"
                      }`}
                      style={form.subjects.includes(s) ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-3 block">Levels * (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => toggleArray("levels", l)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                        form.levels.includes(l) ? "border-amber text-navy-deep" : "border-gray-200 text-muted-brand hover:border-amber/40"
                      }`}
                      style={form.levels.includes(l) ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">Your experience</h2>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">
                  Tutoring / Teaching Experience * <span className="text-muted-brand font-normal">(min. 20 characters)</span>
                </Label>
                <Textarea
                  value={form.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  placeholder="Describe any tutoring, mentoring, or teaching experience you have. Include subjects, levels, and outcomes..."
                  rows={5}
                />
                <p className="text-xs text-muted-brand mt-1">{form.experience.length} characters</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-3 block">Availability (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleArray("availability", a)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        form.availability.includes(a) ? "border-amber text-navy-deep" : "border-gray-200 text-muted-brand hover:border-amber/40"
                      }`}
                      style={form.availability.includes(a) ? { backgroundColor: "rgba(232,168,56,0.1)" } : {}}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: CV & Cover Letter */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">Final details</h2>

              {/* CV Upload */}
              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Upload CV (optional)</Label>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                {form.cvFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-amber/30 bg-amber/5">
                    <CheckCircle size={18} className="text-amber" />
                    <span className="text-sm text-navy-deep flex-1 truncate">{form.cvFile.name}</span>
                    {uploadingCv && <span className="text-xs text-muted-brand">Uploading...</span>}
                    <button onClick={() => { update("cvFile", null); update("cvFileKey", ""); update("cvFileUrl", ""); }}>
                      <X size={16} className="text-muted-brand hover:text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-amber/40 transition-colors"
                  >
                    <Upload size={24} className="text-muted-brand" />
                    <span className="text-sm text-muted-brand">Click to upload PDF or Word doc (max 5MB)</span>
                  </button>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold text-navy-deep mb-1.5 block">Cover Letter (optional)</Label>
                <Textarea
                  value={form.coverLetter}
                  onChange={(e) => update("coverLetter", e.target.value)}
                  placeholder="Tell us why you'd be a great Oak Scholars tutor..."
                  rows={4}
                />
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
                  I confirm the information I've provided is accurate.
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
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Continue
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canAdvance() || submitMutation.isPending || uploadingCv}
                className="btn-press flex items-center gap-2"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Application"}
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
