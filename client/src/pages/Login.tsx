import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const utils = trpc.useUtils();

  // Load saved email if Remember Me was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("oak_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    // Show error toast if redirected back from Google with an error
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "google_cancelled") toast.error("Google sign-in was cancelled.");
    else if (err === "google_no_email") toast.error("Google did not provide an email address. Please use email/password instead.");
    else if (err === "google_state_invalid") toast.error("Sign-in session expired. Please try again.");
    else if (err === "google_failed") toast.error("Google sign-in failed. Please try again or use email/password.");
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      if (rememberMe) {
        localStorage.setItem("oak_remembered_email", email);
      } else {
        localStorage.removeItem("oak_remembered_email");
      }
      await utils.auth.me.invalidate();
      toast.success("Welcome back!");
      navigate("/account");
    },
    onError: (err) => {
      toast.error(err.message || "Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    loginMutation.mutate({ email, password });
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
            Sign in to Oak Scholars
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Access your account and manage your sessions</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#281A39] text-lg">Welcome back</CardTitle>
            <CardDescription>Enter your email and password to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social sign-in */}
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
                <span className="bg-white px-3 text-gray-400">or sign in with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="border-gray-300 focus:border-[#281A39] focus:ring-[#281A39]"
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-300"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#281A39] hover:bg-[#3d2857] text-white font-semibold py-2.5 transition-all duration-200 active:scale-[0.97]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#E8A838] hover:text-[#c8881a] font-semibold underline-offset-2 hover:underline">
                Create one
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
