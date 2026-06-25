import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-3">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-navy-deep mb-2">Privacy Policy</h1>
          <p className="text-muted-brand text-sm mb-10">Last updated: June 2025</p>

          <div className="prose prose-sm max-w-none text-navy-deep space-y-8">
            {[
              {
                title: "1. Who We Are",
                content: "Oak Scholars is an online tutoring service operated by Oak Scholars Ltd. We are committed to protecting your personal information and your right to privacy. If you have any questions about this policy, please contact us at team@oakscholars.com.",
              },
              {
                title: "2. Information We Collect",
                content: "We collect information you provide directly to us, including: name, email address, phone number, academic level and subjects of interest, when you book a session, submit a contact form, or apply to become a tutor. We also collect CV files uploaded during tutor applications, which are stored securely.",
              },
              {
                title: "3. How We Use Your Information",
                content: "We use the information we collect to: match you with appropriate tutors, send booking confirmations and session reminders, respond to your enquiries, process payments through Stripe, and improve our services. We do not sell your personal data to third parties.",
              },
              {
                title: "4. Cookies",
                content: "We use essential cookies to operate our website and analytics cookies to understand how visitors use our site. You can control cookie preferences through our cookie consent banner. Declining non-essential cookies will not affect your ability to use our core services.",
              },
              {
                title: "5. Push Notifications",
                content: "If you opt in to push notifications, we will send you session reminders and service updates. You can withdraw consent at any time by disabling notifications in your browser settings or through our website.",
              },
              {
                title: "6. Data Retention",
                content: "We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Booking and contact records are retained for 3 years. You may request deletion of your data at any time by contacting team@oakscholars.com.",
              },
              {
                title: "7. Your Rights",
                content: "Under UK GDPR, you have the right to: access your personal data, correct inaccurate data, request deletion, object to processing, and data portability. To exercise any of these rights, contact us at team@oakscholars.com.",
              },
              {
                title: "8. Security",
                content: "We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Payment information is processed securely by Stripe and is never stored on our servers.",
              },
              {
                title: "9. Contact Us",
                content: "If you have questions about this Privacy Policy or our data practices, please contact us at team@oakscholars.com or write to us at Oak Scholars Ltd, United Kingdom.",
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
