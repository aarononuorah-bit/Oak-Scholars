import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, User, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CtaBanner from "@/components/CtaBanner";
import PageMeta from "@/components/PageMeta";

// Blog articles data (same as Blog.tsx)
const articles = [
  {
    id: 1,
    title: "5 Proven Exam Techniques to Boost Your Grade",
    excerpt: "Master the art of exam strategy with evidence-based techniques used by top-performing students. Learn how to manage time, tackle difficult questions, and maximise marks.",
    content: `Exams can feel overwhelming, but with the right techniques, you can significantly improve your performance. Here are five proven strategies used by high-achieving students:

1. **Active Recall Practice**: Instead of re-reading notes, test yourself regularly. This strengthens memory and identifies weak areas early. Use past papers, flashcards, or quiz apps to practise retrieval.

2. **Spaced Repetition**: Review material at increasing intervals (1 day, 3 days, 1 week, 2 weeks). This technique, backed by cognitive science, helps move information into long-term memory.

3. **Time Management During Exams**: Allocate time proportionally to question marks. For a 2-hour exam worth 120 marks, spend roughly 1 minute per mark. Read all questions first to plan your approach.

4. **Strategic Answering**: Start with questions you're confident about to build momentum and secure marks. Return to harder questions with remaining time, rather than getting stuck early.

5. **Deliberate Practice**: Focus on weak areas rather than repeating what you already know. Work through challenging past paper questions and learn from mistakes.

The key is consistency. Begin revision 8–10 weeks before your exams, and practise these techniques regularly. Your Oak Scholar can help you refine your exam strategy and tackle subject-specific challenges.`,
    author: "Sarah Chen",
    date: "2024-01-15",
    category: "Exam Tips",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1434582881033-282a0be020b5?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Crafting a Standout Personal Statement for University",
    excerpt: "Your personal statement is your chance to shine. Discover how to tell your story, showcase your passion, and stand out to admissions tutors.",
    content: `Your personal statement is one of the most important parts of your university application. Admissions tutors read thousands of statements, so yours needs to stand out. Here's how:

1. **Show, Don't Tell**: Instead of saying "I'm passionate about Biology," describe a specific moment that sparked your interest. Did you conduct an experiment that fascinated you? Did a documentary change your perspective?

2. **Be Authentic**: Admissions tutors can spot generic statements from a mile away. Write in your own voice. Share genuine experiences, challenges you've overcome, and what you've learned.

3. **Link to Your Course**: Explain why you want to study your chosen subject at university. Reference specific modules, research areas, or career goals. Show you've thought seriously about your future.

4. **Highlight Relevant Experience**: Mention work experience, volunteering, internships, or projects that demonstrate your commitment and skills. Quantify achievements where possible.

5. **Proofread Meticulously**: Spelling and grammar errors can cost you. Read your statement aloud, ask teachers to review it, and use tools like Grammarly. One typo can leave a negative impression.

6. **Keep It Concise**: You have 4,000 characters (roughly 600 words). Every sentence should serve a purpose. Cut unnecessary phrases and make every word count.

Our Academic Support team specialises in personal statement coaching. We'll help you refine your narrative and present your best self to universities.`,
    author: "James Mitchell",
    date: "2024-01-08",
    category: "University Applications",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f70504504?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Managing Exam Stress and Anxiety: A Student's Guide",
    excerpt: "Exam season brings stress, but it doesn't have to overwhelm you. Learn practical strategies to manage anxiety and maintain your wellbeing during revision.",
    content: `Exam stress is normal, but when it becomes overwhelming, it can affect your health and performance. Here's how to manage it:

1. **Recognise Your Triggers**: Identify what causes your stress—tight deadlines, specific subjects, or fear of failure. Once you know your triggers, you can plan coping strategies.

2. **Break Tasks Into Smaller Chunks**: Instead of "revise for Biology," set a goal like "revise photosynthesis for 45 minutes." Smaller tasks feel less daunting and give you a sense of progress.

3. **Maintain a Routine**: Stick to regular sleep, exercise, and meal times. A healthy body supports a healthy mind. Aim for 7–9 hours of sleep, even during exam season.

4. **Use the Pomodoro Technique**: Study for 25 minutes, then take a 5-minute break. After four cycles, take a longer 15–30 minute break. This prevents burnout and maintains focus.

5. **Practice Mindfulness**: Spend 10 minutes daily on deep breathing, meditation, or yoga. These practices calm your nervous system and improve concentration.

6. **Talk to Someone**: If stress becomes overwhelming, reach out to a teacher, school counsellor, parent, or trusted friend. You're not alone, and seeking help is a sign of strength.

7. **Limit Caffeine and Screen Time**: Excessive caffeine can increase anxiety. Reduce screen time before bed to improve sleep quality.

Remember, exams are temporary. Your wellbeing is permanent. If you're struggling, our Wellbeing Support team is here to listen and help.`,
    author: "Dr Emma Thompson",
    date: "2024-01-01",
    category: "Wellbeing",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "The Ultimate GCSE Revision Timeline: Start Now, Ace Later",
    excerpt: "Planning your revision is half the battle. Learn how to structure your revision timeline to cover all topics without last-minute cramming.",
    content: `Starting revision early is one of the best predictors of exam success. Here's a realistic timeline:

**12 Weeks Before Exams (January for Summer GCSEs)**
- Organise your notes and identify weak areas
- Create a revision timetable
- Start light revision: 30 minutes per subject daily
- Join a study group or find a revision partner

**8 Weeks Before**
- Increase revision to 1–2 hours per subject daily
- Begin practising past paper questions
- Attend revision sessions at school
- Seek help from teachers on difficult topics

**4 Weeks Before**
- Ramp up to 2–3 hours per subject daily
- Complete full past papers under timed conditions
- Review mistakes and weak areas
- Reduce social media and distractions

**2 Weeks Before**
- Focus on weak areas and challenging topics
- Do light revision (30–45 minutes per subject)
- Get adequate sleep and exercise
- Build confidence by reviewing strong areas

**1 Week Before**
- Light revision only (20–30 minutes per subject)
- Review key formulas, dates, and concepts
- Prepare exam materials (pens, calculator, etc.)
- Rest and relax—you're ready!

The key is consistency over intensity. Steady revision over 12 weeks beats frantic cramming. Our tutors can help you stick to your timeline and tackle challenging topics.`,
    author: "Michael Roberts",
    date: "2023-12-25",
    category: "Exam Tips",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    title: "Interview Preparation: From Nerves to Confidence",
    excerpt: "University interviews can be intimidating, but with proper preparation, you'll walk in feeling confident. Here's your complete interview prep guide.",
    content: `University interviews are your chance to impress tutors and secure your place. Here's how to prepare:

1. **Research Your Course and University**: Know the course content, recent research from the department, and why you want to study there specifically. Interviewers appreciate genuine interest.

2. **Prepare for Common Questions**:
   - "Why do you want to study this subject?"
   - "Tell us about a recent article/book related to your subject"
   - "What's a challenge you've overcome?"
   - "How do you spend your free time?"

3. **Develop Your Examples**: Prepare 3–5 stories that showcase your skills, interests, and personality. Use the STAR method (Situation, Task, Action, Result) to structure them clearly.

4. **Practice Out Loud**: Interview with a teacher, parent, or friend. Practise articulating your thoughts clearly and concisely. Aim for 2–3 minute answers.

5. **Prepare Questions to Ask**: Interviewers expect you to ask questions. Ask about specific modules, research opportunities, or student life. This shows genuine interest.

6. **Manage Interview Anxiety**:
   - Arrive 15 minutes early
   - Take deep breaths before entering
   - Make eye contact and smile
   - Speak clearly and at a natural pace
   - It's okay to pause and think before answering

7. **Mock Interviews**: Participate in mock interviews at school or with a tutor. Feedback from experienced interviewers is invaluable.

Our Academic Support team offers specialised interview preparation. We'll conduct mock interviews, refine your answers, and build your confidence.`,
    author: "Dr Lisa Anderson",
    date: "2023-12-18",
    category: "University Applications",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
];

export default function BlogArticle() {
  const { id } = useParams<{ id: string }>();
  const article = articles.find((a) => a.id === parseInt(id || "0"));

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-bold text-navy-deep mb-4">Article not found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Link href="/blog">
              <Button className="btn-press" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  return (
    <>
      <PageMeta
        title={`${article.title} | Oak Scholars Blog`}
        description={article.excerpt}
        path={`/blog/${id}`}
      />
      <Navbar />

      {/* Hero Section with Image */}
      <section className="relative h-96 md:h-[500px] overflow-hidden bg-gray-100">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </section>

      {/* Article Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-3xl">
          {/* Back Button */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-amber font-semibold mb-8 hover:gap-3 transition-all duration-200 no-underline">
            <ArrowLeft size={18} />
            Back to Blog
          </Link>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <span className="inline-block px-3 py-1 bg-amber/10 text-amber text-xs font-semibold rounded-full">
              {article.category}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              {new Date(article.date).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen size={16} />
              {article.readTime}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              {article.author}
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-navy-deep mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12">
            {article.content.split("\n\n").map((paragraph, idx) => {
              // Handle numbered lists
              if (paragraph.match(/^\d+\./)) {
                return (
                  <div key={idx} className="mb-6">
                    {paragraph.split("\n").map((line, i) => (
                      <p key={i} className="mb-3">
                        {line}
                      </p>
                    ))}
                  </div>
                );
              }
              // Handle bold text and formatting
              return (
                <p
                  key={idx}
                  className="mb-6"
                  dangerouslySetInnerHTML={{
                    __html: paragraph
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                  }}
                />
              );
            })}
          </div>

          {/* Share & CTA */}
          <div className="border-t border-b border-gray-200 py-8 mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Share this article</p>
                <div className="flex gap-3">
                  {[
                    { name: "Twitter", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=https://oakscholars.com/blog/${article.id}` },
                    { name: "Facebook", url: `https://facebook.com/sharer/sharer.php?u=https://oakscholars.com/blog/${article.id}` },
                    { name: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=https://oakscholars.com/blog/${article.id}` },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-amber/10 hover:text-amber transition-all duration-200"
                      aria-label={`Share on ${social.name}`}
                    >
                      <Share2 size={18} />
                    </a>
                  ))}
                </div>
              </div>
              <Link href="/booking">
                <Button
                  size="lg"
                  className="btn-press font-semibold"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  Book a Session
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy-deep mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.id}`}
                    className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 hover:border-amber/40 hover:shadow-lg transition-all duration-300 bg-white no-underline card-hover"
                  >
                    <div className="relative h-32 overflow-hidden bg-gray-100">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-serif text-sm font-bold text-navy-deep mb-2 group-hover:text-amber transition-colors duration-200 line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-xs text-amber font-semibold">{related.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#281A39] to-[#1e1230]">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to get <span className="text-amber">personalised support</span>?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Our Oak Scholars can help you apply the strategies from this article to your own studies. Book a session today.
            </p>
            <Link href="/booking">
              <Button
                size="lg"
                className="btn-press font-semibold text-base px-8 py-3"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Book a Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </>
  );
}
