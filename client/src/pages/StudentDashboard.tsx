import Timetable from "@/components/Timetable";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, GraduationCap,
  ExternalLink, Shield, CalendarCheck, CalendarX,
  Wallet, ArrowUpRight, ArrowDownLeft, PlusCircle,
} from "lucide-react";
import { format } from "date-fns";

function StudentCalendarConnectCard() {
  const { data: calStatus, isLoading } = trpc.calendar.status.useQuery();
  const utils = trpc.useUtils();
  const disconnect = trpc.calendar.disconnect.useMutation({
    onSuccess: () => { toast.success("Google Calendar disconnected."); utils.calendar.status.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  if (isLoading) return <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />;
  const connected = calStatus?.connected;
  return (
    <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${
      connected ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${ connected ? "bg-green-100" : "bg-gray-200"}`}>
          {connected ? <CalendarCheck size={18} className="text-green-600" /> : <CalendarX size={18} className="text-gray-500" />}
        </div>
        <div>
          <p className="font-semibold text-[#281A39] text-sm">
            {connected ? "Google Calendar Connected" : "Google Calendar Not Connected"}
          </p>
          <p className="text-xs text-gray-500">
            {connected ? "Your availability is synced with Google Calendar." : "Connect to share your availability with your tutor."}
          </p>
        </div>
      </div>
      {connected ? (
        <Button variant="outline" size="sm" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}
          className="shrink-0 border-red-200 text-red-600 hover:bg-red-50">
          {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
        </Button>
      ) : (
        <Button size="sm" onClick={() => { window.location.href = "/api/auth/google/calendar"; }}
          className="shrink-0" style={{ backgroundColor: "#4285F4", color: "white" }}>
          Connect
        </Button>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm
      transition-all duration-200 ease-out
      hover:shadow-md hover:-translate-y-0.5 hover:border-[#E8A838]/40
      active:scale-[0.98] active:shadow-sm">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${color} transition-transform duration-200 group-hover:scale-110`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#281A39]">{value}</p>
      </div>
    </div>
  );
}

function CreditBalanceView({ userId, compact = false }: { userId: number, compact?: boolean }) {
  const { data: creditData, isLoading } = trpc.credit.balance.useQuery({ userId });
  if (isLoading) return <div className="h-6 w-16 bg-gray-100 animate-pulse rounded" />;
  const balance = creditData?.balance || 0;
  
  if (compact) {
    return <p className="text-xs text-[#E8A838] font-bold">{balance} Credits Available</p>;
  }
  
  return (
    <p className="text-4xl font-bold text-[#281A39]">
      {balance} <span className="text-lg font-medium text-gray-400">Hours</span>
    </p>
  );
}

function CreditHistoryList({ userId }: { userId: number }) {
  const { data: history = [], isLoading } = trpc.credit.history.useQuery({ userId });

  if (isLoading) return <div className="p-8 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}</div>;
  if (history.length === 0) return <div className="p-12 text-center text-gray-400 italic">No credit transactions yet.</div>;

  return (
    <div className="divide-y divide-gray-100">
      {history.map((tx) => (
        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              tx.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}>
              {tx.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
            </div>
            <div>
              <p className="font-bold text-[#281A39]">{tx.description || (tx.type === 'purchase' ? 'Credit Top-up' : 'Lesson Usage')}</p>
              <p className="text-xs text-gray-500">{format(new Date(tx.createdAt), "PPP p")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
              {tx.amount > 0 ? "+" : ""}{tx.amount} Credits
            </p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{tx.type}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentBookingForm({ studentId, relationships, onSuccess }: { studentId: number, relationships: any[], onSuccess: () => void }) {
  const [relId, setRelId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("60");

  const bookSession = trpc.session.createSession.useMutation({
    onSuccess: () => { toast.success("Booking request sent to tutor!"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-bold uppercase text-gray-400 mb-1.5 block">Tutor / Subject</Label>
          <select 
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
            value={relId}
            onChange={(e) => {
              setRelId(e.target.value);
              const rel = relationships.find(r => String(r.id) === e.target.value);
              if (rel) setSubject(rel.subjects.split(',')[0].trim());
            }}
          >
            <option value="">Select tutor...</option>
            {relationships.map(r => (
              <option key={r.id} value={r.id}>{r.tutor?.name} — {r.subjects}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs font-bold uppercase text-gray-400 mb-1.5 block">Date & Time</Label>
          <Input type="datetime-local" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-bold uppercase text-gray-400 mb-1.5 block">Session Duration</Label>
          <select 
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="60">60 Minutes (1 Hour)</option>
            <option value="90">90 Minutes (1.5 Hours)</option>
            <option value="120">120 Minutes (2 Hours)</option>
          </select>
        </div>
        <div className="pt-6">
          <Button 
            className="w-full" 
            style={{ backgroundColor: "#E8A838", color: "#281A39" }}
            disabled={!relId || !date || bookSession.isPending}
            onClick={() => bookSession.mutate({
              relationshipId: Number(relId),
              studentId,
              subject,
              scheduledAt: new Date(date),
              duration: Number(duration),
            })}
          >
            {bookSession.isPending ? "Processing..." : "Confirm Booking"}
          </Button>
          <p className="text-[10px] text-gray-400 mt-2 text-center">This will use {Number(duration)/60} credits from your balance.</p>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showBooking, setShowBooking] = useState(false);
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

  if (tutorsLoading || sessionsLoading) return <DashboardSkeleton />;

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
  const hasBookedSession = sessions.length > 0;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <span className="text-[#E8A838] text-sm font-semibold tracking-widest uppercase">Student</span>
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mt-1">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name?.split(" ")[0] || "Scholar"}</p>
        </div>

        {/* Onboarding checklist — shown to new students until all steps are complete */}
        <OnboardingChecklist
          role="student"
          hasLinkedParent={false}
          hasCredits={false}
          hasBookedSession={hasBookedSession}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div onClick={() => { const el = document.querySelector('[value="tutors"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
            <StatCard label="My Tutors" value={tutors.length} icon={Users} color="bg-[#281A39]" />
          </div>
          <div onClick={() => { const el = document.querySelector('[value="sessions"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
            <StatCard label="Upcoming Sessions" value={upcomingSessions.length} icon={Calendar} color="bg-[#E8A838]" />
          </div>
          <div onClick={() => { const el = document.querySelector('[value="sessions"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
            <StatCard label="Completed Sessions" value={completedSessions.length} icon={BookOpen} color="bg-green-500" />
          </div>
        </div>

        <Tabs defaultValue="tutors">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
            {[
              { value: "tutors", label: "My Tutors", icon: Users },
              { value: "credits", label: "Credits", icon: Wallet },
              { value: "sessions", label: "Sessions", icon: Calendar },
              { value: "feedback", label: "Leave Feedback", icon: Star },
              { value: "calendar", label: "Calendar", icon: CalendarCheck },
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
            <div className="space-y-6">
              {/* Booking Section */}
              <div className="bg-white rounded-xl border border-[#E8A838]/30 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#281A39]">Book a Session</h3>
                    <p className="text-xs text-gray-500">Schedule a lesson with one of your assigned tutors</p>
                  </div>
                  <Button onClick={() => setShowBooking(!showBooking)} variant="outline" size="sm">
                    {showBooking ? "Cancel" : "+ Book Session"}
                  </Button>
                </div>
                
                {showBooking && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <StudentBookingForm 
                      studentId={user.id} 
                      relationships={tutors}
                      onSuccess={() => { setShowBooking(false); }} 
                    />
                  </div>
                )}
              </div>

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
                              {/* Verified Undergraduate badge — shown for all approved tutors */}
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#281A39] bg-[#E8A838]/20 border border-[#E8A838]/40 px-2 py-0.5 rounded-full">
                                <GraduationCap size={10} className="text-[#E8A838]" />
                                Verified Undergraduate
                              </span>
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
            </div>
          </TabsContent>

          <TabsContent value="credits">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Wallet size={32} className="text-[#E8A838]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Available Credits</p>
                    <CreditBalanceView userId={user.id} />
                  </div>
                </div>
                <Link href="/tuition">
                  <Button style={{ backgroundColor: "#281A39", color: "white" }} className="gap-2">
                    <PlusCircle size={18} /> Buy More Credits
                  </Button>
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-serif text-xl font-bold text-[#281A39]">Transaction History</h3>
                  <p className="text-xs text-gray-500">Full record of credit purchases and session usage.</p>
                </div>
                <CreditHistoryList userId={user.id} />
              </div>
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
                                    cancelSessionMutation.mutate({ id: s.id, status: "cancelled", notes: reason });
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
                                    rescheduleSessionMutation.mutate({ id: s.id, newScheduledAt: new Date(newDateStr) });
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

          <TabsContent value="calendar">
            <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Google Calendar</h2>
              <p className="text-xs text-gray-500 mb-5">Connect your Google Calendar to share your availability with your tutor.</p>
              <StudentCalendarConnectCard />
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
