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
