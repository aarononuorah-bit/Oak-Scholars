import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CtaBanner() {
  return (
    <section className="bg-navy py-20">
      <div className="container text-center">
        <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-4">Ready to start?</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
          Your A-grades are closer<br />than you think.
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
          Book your first session today — 50% off, no commitment required. Get matched with a tutor who recently aced the same exams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button
              size="lg"
              className="btn-press font-semibold text-base px-8"
              style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}
            >
              Book Your Trial — 50% Off
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8"
            >
              Ask a Question
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
