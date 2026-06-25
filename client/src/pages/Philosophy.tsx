import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Philosophy() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <section className="py-24 bg-surface">
        <div className="container max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy-deep mb-8">
            Our Philosophy
          </h1>

          <p className="text-muted-brand leading-relaxed mb-6">
            At Oak Scholars, our journey began with a simple yet profound realization: the traditional tutoring landscape often falls short. As three undergraduates who recently navigated the complexities of A-Levels and university applications, we understood firsthand the gap between conventional academic support and what students truly need to thrive. We founded Oak Scholars not just as a tutoring service, but as a commitment to a more holistic and empathetic approach to education.
          </p>

          <h2 className="font-serif text-3xl font-bold text-navy-deep mb-6">
            Our Rationale: Bridging the Gap
          </h2>

          <p className="text-muted-brand leading-relaxed mb-6">
            We observed that many tutoring services focus solely on grades, overlooking the broader challenges students face. The pressure to perform, the anxiety of exams, and the daunting prospect of future careers can be overwhelming. We believed there was a better way – a way to provide academic excellence while nurturing the student as a whole. Our tutors are not just subject matter experts; they are recent graduates who have walked in your shoes, offering not only academic guidance but also invaluable mentorship and understanding.
          </p>

          <h2 className="font-serif text-3xl font-bold text-navy-deep mb-6">
            Empowering Every Student to Succeed
          </h2>

          <p className="text-muted-brand leading-relaxed mb-6">
            Our philosophy is rooted in the conviction that every student deserves the tools and support necessary to unlock their full potential. Success, to us, extends beyond exam results. It encompasses confidence, resilience, and preparedness for life's next big steps. That's why Oak Scholars goes beyond 1:1 tuition:
          </p>

          <ul className="list-disc list-inside text-muted-brand space-y-3 mb-6">
            <li>
              <strong className="text-navy-deep">Academic Excellence</strong>: Our core offering remains top-tier, personalized tuition from tutors who have recently excelled in the very exams our students are preparing for. We focus on understanding individual learning styles and tailoring our approach to maximize impact.
            </li>
            <li>
              <strong className="text-navy-deep">Career Readiness</strong>: We recognize that academic achievements are a stepping stone. To truly equip students for their future, we offer comprehensive support in areas like <strong className="text-navy-deep">CV writing, interview preparation, and personal statement crafting</strong>. These skills are crucial for university applications and early career development, giving our students a distinct advantage.
            </li>
            <li>
              <strong className="text-navy-deep">Wellbeing Support</strong>: The mental and emotional health of our students is paramount. We provide a safe and confidential space for students to discuss challenges, manage stress, and build coping mechanisms. We believe that a healthy mind is the foundation for academic and personal success.
            </li>
          </ul>

          <p className="text-muted-brand leading-relaxed mb-6">
            By integrating these pillars of support, Oak Scholars aims to create a nurturing environment where students feel understood, empowered, and genuinely prepared for whatever comes next. We are dedicated to fostering not just scholars, but well-rounded individuals ready to confidently pursue their aspirations.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
