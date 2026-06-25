import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, Users, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

type AccountType = "student" | "parent";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a letter", ok: /[a-zA-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {checks.map((c) => (
        <li key={c.label} className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${c.ok ? "text-green-600" : "text-gray-400"}`}>
          {c.ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
          {c.label}
        </li>
      ))}
    </ul>
  );
}

export default function Register() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("student");
  const utils = trpc.useUtils();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Account created! Welcome to Oak Scholars.");
      navigate("/account");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    registerMutation.mutate({ name, email, password, referralCode, accountType });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "linear-gradient(160deg, #281A39 0%, #1e1230 50%, #160D22 100%)" }}
    >
      {/* Background dot pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="w-full max-w-md relative z-10"
        style={{ animation: "fadeInUp 400ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 group mb-4">
              <img
                src="/manus-storage/oak-logo_feb9f1bb.webp"
                alt="Oak Scholars"
                className="h-10 cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="font-serif font-bold text-xl text-amber uppercase tracking-wide">Oak Scholars</span>
            </div>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/60 mt-1 text-sm">Join Oak Scholars and start your learning journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: "linear-gradient(to right, transparent, #E8A838, transparent)" }} />

          <div className="p-8">
            {/* Account type selector */}
            <div className="mb-5">
              <Label className="text-navy-deep font-semibold text-sm mb-3 block">I am joining as a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("student")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${
                    accountType === "student"
                      ? "border-amber bg-amber/5 text-navy-deep shadow-sm"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <GraduationCap className={`w-6 h-6 transition-colors duration-200 ${accountType === "student" ? "text-amber" : "text-gray-400"}`} />
                  <span className="text-sm font-semibold">Student</span>
                  <span className="text-xs text-center leading-tight opacity-70">I want to be tutored</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("parent")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${
                    accountType === "parent"
                      ? "border-navy bg-navy/5 text-navy-deep shadow-sm"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Users className={`w-6 h-6 transition-colors duration-200 ${accountType === "parent" ? "text-navy" : "text-gray-400"}`} />
                  <span className="text-sm font-semibold">Parent</span>
                  <span className="text-xs text-center leading-tight opacity-70">Managing my child's learning</span>
                </button>
              </div>
            </div>

            {/* Google sign-up */}
            <a
              href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 active:scale-[0.98] mb-5"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-navy-deep font-semibold text-sm">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="transition-all duration-200 focus:border-amber focus:ring-amber/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-navy-deep font-semibold text-sm">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="transition-all duration-200 focus:border-amber focus:ring-amber/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-navy-deep font-semibold text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="pr-10 transition-all duration-200 focus:border-amber focus:ring-amber/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-navy-deep font-semibold text-sm">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`pr-10 transition-all duration-200 focus:border-amber focus:ring-amber/20 ${
                      confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-400" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <XCircle size={11} /> Passwords do not match
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="referralCode" className="text-navy-deep font-semibold text-sm flex justify-between">
                  Referral code <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="OAK-XXXX-XXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="transition-all duration-200 focus:border-amber focus:ring-amber/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-press font-semibold py-2.5 transition-all duration-200"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-amber hover:text-amber/80 font-semibold underline-offset-2 hover:underline transition-colors duration-200">
                Sign in
              </Link>
            </div>

            <div className="mt-3 text-center">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200">
                ← Back to Oak Scholars
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
