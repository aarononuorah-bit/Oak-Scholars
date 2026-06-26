import Timetable from "@/components/Timetable";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, GraduationCap,
  ExternalLink, Shield,
} from "lucide-react";
import { format } from "date-fns";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#281A39]">{value}</p>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackTarget, setFeedbackTarget] = useState<{ sessionId: number; tutorId: number } | null>(null);

  const { data: tutors = [], isLoading: tutorsLoading } = trpc.tutoring.myTutors.useQuery();
  const { data: sessions = [], isLoading: sessionsLoading } = trpc.session.studentSessions.useQuery();
  const utils = trpc.useUtils();

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted — thank you!");
      setFeedbackTarget(null);
      setComment("");
      setRating(5);
      utils.session.studentSessions.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const cancelSessionMutation = trpc.session.updateStatus.useMutation({
    onSuccess: () => { toast.success("Session cancelled"); utils.session.studentSessions.invalidate(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const rescheduleSessionMutation = trpc.session.rescheduleSession.useMutation({
    onSuccess: () => { toast.success("Reschedule request sent"); utils.session.studentSessions.invalidate(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <Navbar />
        <div className="container py-32 text-center max-w-md mx-auto">
          <Shield size={28} className="text-amber-400 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mb-4">Sign in to view your dashboard</h1>
          <Link href="/login"><Button style={{ backgroundColor: "#E8A838", color: "#281A39" }}>Sign In</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) > new Date());
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <span className="text-[#E8A838] text-sm font-semibold tracking-widest uppercase">Student</span>
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mt-1">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name?.split(" ")[0] || "Scholar"}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="My Tutors" value={tutors.length} icon={Users} color="bg-[#281A39]" />
          <StatCard label="Upcoming Sessions" value={upcomingSessions.length} icon={Calendar} color="bg-[#E8A838]" />
          <StatCard label="Completed Sessions" value={completedSessions.length} icon={BookOpen} color="bg-green-500" />
        </div>

        <Tabs defaultValue="tutors">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
            {[
              { value: "tutors", label: "My Tutors", icon: Users },
              { value: "sessions", label: "Sessions", icon: Calendar },
              { value: "feedback", label: "Leave Feedback", icon: Star },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#281A39] data-[state=active]:text-white rounded-lg px-3 py-2"
              >
                <t.icon size={14} />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tutors">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Your Tutors</h2>
              <p className="text-xs text-gray-500 mb-5">Tutors assigned to you by Oak Scholars.</p>
              {tutorsLoading ? (
                <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No tutors assigned yet. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tutors.map((rel) => (
                    <div key={rel.id} className="border border-gray-100 rounded-xl p-5 hover:border-[#E8A838]/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#281A39] flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {(rel.tutor?.name || rel.tutor?.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[#281A39]">{rel.tutor?.name || <span className="italic text-gray-400">Name not set</span>}</p>
                            {rel.tutor?.linkedin && (
                              <a href={rel.tutor.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                <Linkedin size={12} /> LinkedIn <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                          {rel.tutor?.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{rel.tutor.bio}</p>}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {rel.subjects && <span className="flex items-center gap-1 text-xs bg-[#281A39]/5 text-[#281A39] px-2.5 py-1 rounded-full"><GraduationCap size={11} /> {rel.subjects}</span>}
                            {rel.level && <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">{rel.level}</span>}
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${rel.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{rel.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="mb-8">
              <Timetable targetUserId={user.id} userName={user.name || "My"} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-5">List View</h2>
              {sessionsLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No sessions scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#281A39] flex items-center gap-2 mb-3"><Clock size={14} className="text-green-500" /> Upcoming</h3>
                      <div className="space-y-3">
                        {upcomingSessions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                            <div>
                              <p className="font-semibold text-[#281A39] text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">{format(new Date(s.scheduledAt), "PPP p")} &middot; {s.duration} min</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{s.status}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 px-2 text-[10px] text-gray-500 hover:text-[#281A39]" 
                                onClick={() => { 
                                  const reason = window.prompt("Reason for cancellation:");
                                  if (reason) {
                                    cancelSessionMutation.mutate({ sessionId: s.id, status: "cancelled", reason });
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 px-2 text-[10px] text-[#E8A838]" 
                                onClick={() => { 
                                  const newDateStr = window.prompt("New date (YYYY-MM-DD HH:MM):", format(new Date(s.scheduledAt), "yyyy-MM-dd HH:mm"));
                                  if (newDateStr) {
                                    rescheduleSessionMutation.mutate({ sessionId: s.id, newDate: new Date(newDateStr) });
                                  }
                                }}
                              >
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {completedSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#281A39] flex items-center gap-2 mb-3"><BookOpen size={14} className="text-blue-500" /> Completed</h3>
                      <div className="space-y-3">
                        {completedSessions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div>
                              <p className="font-semibold text-[#281A39] text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">{format(new Date(s.scheduledAt), "PPP")}</p>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setFeedbackTarget({ sessionId: s.id, tutorId: s.tutorId! })}>Rate</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Leave Feedback</h2>
              {feedbackTarget ? (
                <div className="border border-gray-100 rounded-xl p-5 space-y-4">
                  <p className="text-sm font-semibold text-[#281A39]">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} type="button">
                        <Star size={24} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment..." rows={3} className="text-sm" />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => submitFeedback.mutate({ sessionId: feedbackTarget.sessionId, toUserId: feedbackTarget.tutorId, rating, comment: comment || undefined })} 
                      disabled={submitFeedback.isPending}
                      style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                    >
                      Submit Feedback
                    </Button>
                    <Button variant="outline" onClick={() => setFeedbackTarget(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-10">Select a completed session to leave feedback.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default StudentDashboard;
