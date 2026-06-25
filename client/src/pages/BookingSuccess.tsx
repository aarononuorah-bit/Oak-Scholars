import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, Calendar, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BookingSuccess() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="container py-32 max-w-2xl mx-auto">
        {/* Success card */}
        <div
          className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center animate-fade-in-up"
          style={{ animationDelay: "0ms" }}
        >
          {/* Animated tick */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: "rgba(232,168,56,0.12)" }}
          >
            <CheckCircle size={40} className="text-amber" strokeWidth={1.8} />
          </div>

          <h1 className="font-serif text-4xl font-bold text-navy-deep mb-4">
            You're all booked in!
          </h1>

          <p className="text-muted-brand text-lg leading-relaxed mb-3">
            Thank you for booking with Oak Scholars. Your payment has been received.
          </p>

          <p className="text-muted-brand leading-relaxed mb-10">
            We'll be in touch shortly to confirm your Oak Scholar and agree on session timings that work for you. Keep an eye on your inbox — we usually respond within a few hours.
          </p>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <div
              className="rounded-xl p-5 flex items-start gap-4"
              style={{ backgroundColor: "rgba(232,168,56,0.06)", border: "1px solid rgba(232,168,56,0.2)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(232,168,56,0.15)" }}
              >
                <Mail size={18} className="text-amber" />
              </div>
              <div>
                <p className="font-semibold text-navy-deep text-sm mb-1">Check your email</p>
                <p className="text-muted-brand text-xs leading-relaxed">
                  A payment receipt and booking summary have been sent to your inbox.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-5 flex items-start gap-4"
              style={{ backgroundColor: "rgba(232,168,56,0.06)", border: "1px solid rgba(232,168,56,0.2)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(232,168,56,0.15)" }}
              >
                <Calendar size={18} className="text-amber" />
              </div>
              <div>
                <p className="font-semibold text-navy-deep text-sm mb-1">Session timings</p>
                <p className="text-muted-brand text-xs leading-relaxed">
                  We'll contact you within 24 hours to agree on a time that suits you.
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                className="btn-press font-semibold flex items-center gap-2"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Go to my dashboard
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-300 text-navy-deep bg-transparent hover:bg-gray-50 font-medium"
              >
                Back to home
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle tagline */}
        <p className="text-center text-muted-brand text-sm mt-8">
          Questions? Email us at{" "}
          <a href="mailto:team@oakscholars.com" className="text-amber hover:underline font-medium">
            team@oakscholars.com
          </a>
        </p>
      </div>

      <Footer />
    </div>
  );
}
