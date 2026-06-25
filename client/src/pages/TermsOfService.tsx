import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-navy-deep mb-2">Terms of Service</h1>
          <p className="text-muted-brand text-sm mb-10">Last updated: June 2025</p>

          <div className="space-y-8">
            {[
              {
                title: "1. Acceptance of Terms",
                content: "By accessing or using Oak Scholars' services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
              },
              {
                title: "2. Services",
                content: "Oak Scholars provides online tutoring services connecting students with undergraduate tutors. We facilitate session bookings, payments, and communications between students and tutors. We do not guarantee specific academic outcomes.",
              },
              {
                title: "3. Bookings and Payments",
                content: "Session bookings are confirmed upon receipt of payment. All prices are in GBP and include VAT where applicable. The trial session discount (50% off) applies to first-time bookings only. Bundle sessions must be used within 6 months of purchase.",
              },
              {
                title: "4. Cancellation Policy",
                content: "Sessions cancelled with more than 24 hours' notice will receive a full refund or credit. Sessions cancelled with less than 24 hours' notice may be subject to a 50% cancellation fee. No-shows will be charged in full.",
              },
              {
                title: "5. Tutor Applications",
                content: "By submitting a tutor application, you confirm that all information provided is accurate. Oak Scholars reserves the right to accept or reject applications at its discretion. Accepted tutors will be subject to a separate tutor agreement.",
              },
              {
                title: "6. Code of Conduct",
                content: "All users must treat tutors, students, and Oak Scholars staff with respect. Harassment, discrimination, or inappropriate behaviour will result in immediate termination of services without refund.",
              },
              {
                title: "7. Intellectual Property",
                content: "All content on the Oak Scholars website, including text, graphics, and study materials, is the property of Oak Scholars Ltd and may not be reproduced without written permission.",
              },
              {
                title: "8. Limitation of Liability",
                content: "Oak Scholars' liability is limited to the amount paid for the specific session or service in question. We are not liable for any indirect, consequential, or special damages arising from use of our services.",
              },
              {
                title: "9. Governing Law",
                content: "These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
              },
              {
                title: "10. Contact",
                content: "For questions about these Terms, please contact us at hello@oakscholars.com.",
              },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="font-serif text-xl font-bold text-navy-deep mb-3">{section.title}</h2>
                <p className="text-muted-brand leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
