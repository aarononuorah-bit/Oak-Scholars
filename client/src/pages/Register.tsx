import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Register() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
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
    registerMutation.mutate({ name, email, password, referralCode });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2] px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src="/manus-storage/oak-scholars-logo_7b2e4f1a.png"
              alt="Oak Scholars"
              className="h-12 mx-auto mb-4 cursor-pointer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </Link>
          <h1 className="text-2xl font-bold text-[#281A39]" style={{ fontFamily: "Playfair Display, serif" }}>
            Create your account
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Join Oak Scholars and start your learning journey</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#281A39] text-lg">Get started</CardTitle>
            <CardDescription>Fill in your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social sign-up */}
            <div className="space-y-2 mb-5">
              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-md py-2.5 px-4 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150 active:scale-[0.97]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </a>
            </div>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#281A39] font-medium">
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="border-gray-300 focus:border-[#281A39] focus:ring-[#281A39]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#281A39] font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-gray-300 focus:border-[#281A39] focus:ring-[#281A39]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#281A39] font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="border-gray-300 focus:border-[#281A39] focus:ring-[#281A39]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[#281A39] font-medium">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="border-gray-300 focus:border-[#281A39] focus:ring-[#281A39]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="referralCode" className="text-[#281A39] font-medium flex justify-between">
                  Referral code <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="OAK-XXXX-XXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="border-gray-300 focus:border-[#281A39] focus:ring-[#281A39]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E8A838] hover:bg-[#c8881a] text-[#281A39] font-semibold py-2.5 transition-all duration-200 active:scale-[0.97]"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#281A39] hover:text-[#3d2857] font-semibold underline-offset-2 hover:underline">
                Sign in
              </Link>
            </div>

            <div className="mt-3 text-center">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
                &larr; Back to Oak Scholars
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
