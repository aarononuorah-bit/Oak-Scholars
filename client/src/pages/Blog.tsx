import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Calendar, User, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CtaBanner from "@/components/CtaBanner";
import PageMeta from "@/components/PageMeta";

// Blog articles data
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

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Exam Tips", "University Applications", "Wellbeing"];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <PageMeta
        title="Blog & Insights | Oak Scholars"
        description="Expert advice on exam tips, university applications, and student wellbeing from Oak Scholars."
        path="/blog"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#281A39] to-[#1e1230]">
        <div className="container">
          <div className="max-w-3xl">
            <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-4">
              Insights & Advice
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">
              Tips to help you <span className="gold-underline">succeed</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Expert advice on exam preparation, university applications, and student wellbeing from current undergraduates and education specialists.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* Search */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-navy-deep mb-3">
                Search articles
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search by title or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2.5 border-gray-200 focus:border-amber focus:ring-amber/20"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-auto">
              <label className="block text-sm font-semibold text-navy-deep mb-3">
                Filter by category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === null
                      ? "bg-amber text-navy-deep"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedCategory === cat
                        ? "bg-amber text-navy-deep"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No articles found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.id}`}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 hover:border-amber/40 hover:shadow-xl transition-all duration-300 bg-white no-underline card-hover"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-amber/10 text-amber text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-navy-deep mb-3 group-hover:text-amber transition-colors duration-200 line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-muted-brand text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(article.date).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>{article.readTime}</span>
                      </div>
                      <span className="text-amber font-semibold text-sm flex items-center gap-1 group-hover:gap-2.5 transition-all duration-200">
                        Read <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#281A39] to-[#1e1230]">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Need personalised guidance?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Our Oak Scholars and Academic Support team can help you with exam preparation, university applications, and interview coaching. Book a session today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="btn-press font-semibold text-base px-8 py-3"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  Book a Session
                </Button>
              </Link>
              <Link href="/support-guidance">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10 text-base px-8 py-3 transition-all duration-200"
                >
                  Learn More <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </>
  );
}
