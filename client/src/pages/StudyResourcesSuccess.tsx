import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StudyResourcesSuccess() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = "/account";
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <main className="flex items-center justify-center min-h-screen pt-16">
        <div className="max-w-lg w-full mx-auto px-6 py-24 text-center">
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            style={{ background: "linear-gradient(135deg, #281A39 0%, #3a2547 100%)" }}
          >
            <CheckCircle2 size={48} className="text-amber-400" />
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl font-bold text-[#281A39] mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Thank you for your order. Our Oak Scholars are now preparing your personalised study resource. You will receive a confirmation email shortly, followed by your download link within{" "}
            <strong className="text-[#281A39]">24–48 hours</strong>.
          </p>

          {/* Info box */}
          <div className="bg-white rounded-2xl border border-amber-200 p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <BookOpen size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#281A39] mb-1">What happens next?</p>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li>✓ A confirmation email has been sent to your inbox</li>
                  <li>✓ Our team will prepare your tailored resource pack</li>
                  <li>✓ You'll receive a download link within 24–48 hours</li>
                  <li>✓ Your order is saved in your account for future reference</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/account">
              <Button
                className="font-semibold px-8 py-3 gap-2"
                style={{ backgroundColor: "#281A39", color: "white" }}
              >
                View My Orders <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/study-resources">
              <Button
                variant="outline"
                className="font-semibold px-8 py-3 border-[#281A39] text-[#281A39]"
              >
                Browse More Resources
              </Button>
            </Link>
          </div>

          {/* Countdown redirect */}
          <p className="text-sm text-gray-400">
            Redirecting to your account in{" "}
            <span className="font-bold text-[#281A39]">{countdown}</span> seconds…
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
