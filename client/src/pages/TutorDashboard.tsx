import Timetable from "@/components/Timetable";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, GraduationCap,
  ExternalLink, Shield, Banknote, User, CalendarCheck, CalendarX,
} from "lucide-react";
import { format } from "date-fns";

function CalendarConnectCard() {
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
            {connected ? "Your availability is visible to students during booking." : "Connect to show your real-time availability to students."}
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

// ─── Schedule Session Panel ──────────────────────────
type StudentRel = { id: number; studentId: number; subjects: string; level: string; student?: { id: number; name?: string | null; email?: string | null } | null };

function ScheduleSessionPanel({ students, utils }: { students: StudentRel[]; utils: ReturnType<typeof trpc.useUtils> }) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");

  const createSession = trpc.session.createSession.useMutation({
    onSuccess: () => {
      toast.success("Session scheduled!");
      utils.session.tutorSessions.invalidate();
      setOpen(false);
      setStudentId(""); setSubject(""); setScheduledAt(""); setDuration("60");
    },
    onError: (e) => toast.error(e.message),
  });

  if (!open) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#281A39]">Schedule a Session</p>
          <p className="text-xs text-gray-500">Create a new session for one of your students.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
          + New Session
        </Button>
      </div>
    );
  }

  const selectedRel = students.find((s) => String(s.studentId) === studentId);

  return (
    <div className="bg-white rounded-xl border border-[#E8A838]/30 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg font-bold text-[#281A39]">Schedule a New Session</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold text-[#281A39] uppercase tracking-wide mb-1 block">Student</Label>
          <select
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              const rel = students.find((s) => String(s.studentId) === e.target.value);
              if (rel) setSubject(rel.subjects.split(",")[0]?.trim() || "");
            }}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/30"
          >
            <option value="">Select student...</option>
            {students.map((s) => (
              <option key={s.studentId} value={s.studentId}>{s.student?.name || s.student?.email || `Student #${s.studentId}`}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs font-semibold text-[#281A39] uppercase tracking-wide mb-1 block">Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-[#281A39] uppercase tracking-wide mb-1 block">Date & Time</Label>
          <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-semibold text-[#281A39] uppercase tracking-wide mb-1 block">Duration (minutes)</Label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/30"
          >
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min (1 hour)</option>
            <option value="90">90 min</option>
            <option value="120">120 min (2 hours)</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-5 justify-end">
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          size="sm"
          disabled={!studentId || !subject || !scheduledAt || createSession.isPending}
          onClick={() => {
            if (!studentId || !subject || !scheduledAt || !selectedRel) return;
            createSession.mutate({
              relationshipId: selectedRel.id,
              studentId: Number(studentId),
              subject,
              scheduledAt: new Date(scheduledAt),
              duration: Number(duration),
            });
          }}
          style={{ backgroundColor: "#E8A838", color: "#281A39" }}
        >
          {createSession.isPending ? "Scheduling..." : "Schedule Session"}
        </Button>
      </div>
    </div>
  );
}

// ─── Parent List Component ──────────────────────────
function ParentList({ studentId }: { studentId: number }) {
  const { data: dashboard } = trpc.admin.getUserDashboard.useQuery({ userId: studentId });
  const parents = dashboard?.linkedParents || [];

  if (parents.length === 0) return <p className="text-[10px] text-gray-400 italic">No parents linked</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {parents.map((p) => (
        <div key={p.id} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <div className="w-4 h-4 rounded-full bg-amber text-[#281A39] flex items-center justify-center text-[8px] font-bold">
            {p.name?.charAt(0) || "P"}
          </div>
          <span className="text-[10px] text-[#281A39] font-medium">{p.name || p.email}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Session Row (with mark complete + feedback) ──────
type SessionData = { id: number; subject: string; scheduledAt: Date | string; duration?: number | null; status: string; notes?: string | null; studentId: number };

function SessionRow({ session: s, utils, completed = false }: { session: SessionData; utils: ReturnType<typeof trpc.useUtils>; completed?: boolean }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [proposalDate, setProposalDate] = useState("");
  const [proposalMsg, setProposalMsg] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [rating, setRating] = useState(5);

  const updateStatus = trpc.session.updateStatus.useMutation({
    onSuccess: (data, variables) => { 
      toast.success(`Session ${variables.status === 'scheduled' ? 'accepted' : variables.status}!`); 
      utils.session.tutorSessions.invalidate(); 
      setShowProposal(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => { toast.success("Feedback saved!"); setShowFeedback(false); setFeedbackNote(""); utils.session.tutorSessions.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className={`border rounded-xl p-4 ${ completed ? "bg-gray-50 border-gray-100" : "bg-green-50 border-green-100" }`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[#281A39] text-sm">{s.subject}</p>
          <p className="text-xs text-gray-500">{format(new Date(s.scheduledAt), "PPP p")} &middot; {s.duration || 60} min</p>
          {s.notes && <p className="text-xs text-gray-400 mt-1 italic">{s.notes}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {s.status === "pending" && (
            <>
              <Button size="sm" onClick={() => updateStatus.mutate({ id: s.id, status: "scheduled" })} style={{ backgroundColor: "#281A39", color: "white" }}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowProposal(true)}>
                Propose New Time
              </Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateStatus.mutate({ id: s.id, status: "cancelled" })}>
                Reject
              </Button>
            </>
          )}
          {s.status === "scheduled" && !completed && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-green-300 text-green-700 hover:bg-green-100"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: s.id, status: "completed" })}
            >
              Mark Complete
            </Button>
          )}
          {s.status === "proposed" && (
            <span className="text-xs text-amber-600 font-medium italic mr-2">Waiting for student...</span>
          )}
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${ 
            completed ? "bg-blue-100 text-blue-700" : 
            s.status === "pending" ? "bg-amber-100 text-amber-700" :
            s.status === "proposed" ? "bg-amber-50 text-amber-600" :
            "bg-green-100 text-green-700" 
          }`}>{s.status}</span>
          {completed && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => setShowFeedback((v) => !v)}
            >
              {showFeedback ? "Cancel" : "Leave Feedback"}
            </Button>
          )}
        </div>

        {showProposal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="font-serif text-2xl font-bold text-[#281A39] mb-2">Propose New Time</h3>
              <p className="text-gray-500 text-sm mb-6">Suggest a better time for this session. The student will be notified.</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400 mb-1.5 block">New Date & Time</Label>
                  <Input type="datetime-local" value={proposalDate} onChange={(e) => setProposalDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400 mb-1.5 block">Message to Student</Label>
                  <Textarea placeholder="Explain why you're rescheduling..." value={proposalMsg} onChange={(e) => setProposalMsg(e.target.value)} />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowProposal(false)}>Cancel</Button>
                  <Button 
                    className="flex-1" 
                    style={{ backgroundColor: "#281A39", color: "white" }}
                    disabled={!proposalDate || updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ 
                      id: s.id, 
                      status: "proposed", 
                      scheduledAt: new Date(proposalDate), 
                      proposalMessage: proposalMsg 
                    })}
                  >
                    {updateStatus.isPending ? "Sending..." : "Send Proposal"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showFeedback && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#281A39] uppercase tracking-wide mb-1 block">Rating (1–5)</Label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((r) => (
                <button key={r} onClick={() => setRating(r)} className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${ r <= rating ? "bg-[#E8A838] text-[#281A39]" : "bg-gray-100 text-gray-400" }`}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#281A39] uppercase tracking-wide mb-1 block">Session Notes (visible to student)</Label>
            <Textarea value={feedbackNote} onChange={(e) => setFeedbackNote(e.target.value)} placeholder="Great progress on quadratic equations today..." rows={3} />
          </div>
          <Button
            size="sm"
            disabled={!feedbackNote.trim() || submitFeedback.isPending}
            onClick={() => submitFeedback.mutate({ sessionId: s.id, toUserId: s.studentId, rating, comment: feedbackNote })}
            style={{ backgroundColor: "#E8A838", color: "#281A39" }}
          >
            {submitFeedback.isPending ? "Saving..." : "Save Feedback"}
          </Button>
        </div>
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

export function TutorDashboard() {
  const { user } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [tutorSubjects, setTutorSubjects] = useState(user?.tutorSubjects || "");
  const [tutorLevel, setTutorLevel] = useState(user?.tutorLevel || "");
  const [tutorUniversity, setTutorUniversity] = useState((user as any)?.tutorUniversity || "");
  const [tutorCourse, setTutorCourse] = useState((user as any)?.tutorCourse || "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState((user as any)?.profilePhotoUrl || "");
  const [bankAccountName, setBankAccountName] = useState((user as any)?.bankAccountName || "");
  const [bankSortCode, setBankSortCode] = useState((user as any)?.bankSortCode || "");
  const [bankAccountNumber, setBankAccountNumber] = useState((user as any)?.bankAccountNumber || "");
  const [bankPaypalEmail, setBankPaypalEmail] = useState((user as any)?.bankPaypalEmail || "");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: students = [], isLoading: studentsLoading } = trpc.tutoring.myStudents.useQuery();
  const { data: sessions = [], isLoading: sessionsLoading } = trpc.session.tutorSessions.useQuery();
  const { data: feedbackReceived = [], isLoading: feedbackLoading } = trpc.feedback.received.useQuery();
  const utils = trpc.useUtils();

  const updateProfile = trpc.tutorProfile.update.useMutation({
    onSuccess: () => { toast.success("Profile updated successfully!"); utils.auth.me.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const uploadFile = trpc.storage.upload.useMutation({
    onSuccess: (data) => { setProfilePhotoUrl(data.url); toast.success("Photo uploaded!"); },
    onError: (e) => toast.error(e.message),
  });

  if (studentsLoading || sessionsLoading || feedbackLoading) return <DashboardSkeleton />;

  if (!user || user.role !== "tutor") {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <Navbar />
        <div className="container py-32 text-center max-w-md mx-auto">
          <Shield size={28} className="text-amber-400 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mb-4">Tutor Access Only</h1>
          <Link href="/"><Button style={{ backgroundColor: "#E8A838", color: "#281A39" }}>Back to Home</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) > new Date());
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgRating = feedbackReceived.length > 0 ? (feedbackReceived.reduce((sum, f) => sum + f.rating, 0) / feedbackReceived.length).toFixed(1) : "—";
  const SESSION_RATE_PER_HOUR = 25;
  const totalEarnings = completedSessions.reduce((sum, s) => sum + ((s.duration || 60) / 60) * SESSION_RATE_PER_HOUR, 0);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadFile.mutate({ filename: file.name, contentType: file.type, base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = () => {
    updateProfile.mutate({
      bio,
      linkedin,
      tutorSubjects,
      tutorLevel,
      tutorUniversity,
      tutorCourse,
      profilePhotoUrl,
      bankAccountName,
      bankSortCode,
      bankAccountNumber,
      bankPaypalEmail,
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <span className="text-[#E8A838] text-sm font-semibold tracking-widest uppercase">Tutor</span>
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mt-1">My Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div onClick={() => { const el = document.querySelector('[value="students"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
            <StatCard label="My Students" value={students.length} icon={Users} color="bg-[#281A39]" />
          </div>
          <div onClick={() => { const el = document.querySelector('[value="sessions"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
            <StatCard label="Upcoming Sessions" value={upcomingSessions.length} icon={Calendar} color="bg-[#E8A838]" />
          </div>
          <div onClick={() => { const el = document.querySelector('[value="earnings"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
            <StatCard label="Earnings" value={`£${totalEarnings.toFixed(2)}`} icon={Banknote} color="bg-green-500" />
          </div>
          <div className="cursor-default">
            <StatCard label="Avg Rating" value={avgRating} icon={Star} color="bg-purple-500" />
          </div>
        </div>

        <Tabs defaultValue="students">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
            {[
              { value: "students", label: "My Students", icon: Users },
              { value: "sessions", label: "Sessions", icon: Calendar },
              { value: "earnings", label: "Earnings", icon: Banknote },
              { value: "profile", label: "My Profile", icon: User },
            ].map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#281A39] data-[state=active]:text-white rounded-lg px-3 py-2">
                <t.icon size={14} /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="students">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">My Students</h2>
              <p className="text-xs text-gray-500 mb-5">Students assigned to you.</p>
              {studentsLoading ? (
                <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No students assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((rel) => (
                    <div key={rel.id} className="border border-gray-100 rounded-xl p-5 hover:border-[#E8A838]/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#281A39] flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {(rel.student?.name || rel.student?.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[#281A39]">{rel.student?.name || <span className="italic text-gray-400">Name not set</span>}</p>
                              <p className="text-xs text-gray-500">{rel.student?.email}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-[10px] h-7 px-2"
                              onClick={() => {
                                // In a real app, this would open a modal or navigate to a detail view
                                // For now, we'll provide a hint that tutors can see more
                                toast.info(`Viewing dashboard for ${rel.student?.name || 'student'}...`);
                              }}
                            >
                              View Profile
                            </Button>
                          </div>
                          {rel.student?.id && (
                            <div className="mt-3 pt-3 border-t border-gray-50">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Linked Parents</p>
                              <ParentList studentId={rel.student.id} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <ScheduleSessionPanel students={students} utils={utils} />

            <div className="mb-8">
              <Timetable targetUserId={user.id} userName="My" />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-5">Sessions List</h2>
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
                          <SessionRow key={s.id} session={s} utils={utils} />
                        ))}
                      </div>
                    </div>
                  )}
                  {completedSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#281A39] flex items-center gap-2 mb-3"><BookOpen size={14} className="text-blue-500" /> Completed</h3>
                      <div className="space-y-3">
                        {completedSessions.map((s) => (
                          <SessionRow key={s.id} session={s} utils={utils} completed />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-6">My Profile</h2>
              
              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <Label className="text-sm font-semibold text-[#281A39]">Profile Photo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#281A39] flex items-center justify-center text-white">
                        {(user?.name || "T").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadFile.isPending}
                    >
                      {uploadFile.isPending ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="text-sm font-semibold text-[#281A39]">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about yourself..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {/* Subjects & Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subjects" className="text-sm font-semibold text-[#281A39]">Subjects</Label>
                    <Input
                      id="subjects"
                      value={tutorSubjects}
                      onChange={(e) => setTutorSubjects(e.target.value)}
                      placeholder="e.g. Math, Physics"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level" className="text-sm font-semibold text-[#281A39]">Level</Label>
                    <Input
                      id="level"
                      value={tutorLevel}
                      onChange={(e) => setTutorLevel(e.target.value)}
                      placeholder="e.g. GCSE, A-Level"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* University & Course */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="university" className="text-sm font-semibold text-[#281A39]">University</Label>
                    <Input
                      id="university"
                      value={tutorUniversity}
                      onChange={(e) => setTutorUniversity(e.target.value)}
                      placeholder="Your university"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course" className="text-sm font-semibold text-[#281A39]">Course</Label>
                    <Input
                      id="course"
                      value={tutorCourse}
                      onChange={(e) => setTutorCourse(e.target.value)}
                      placeholder="Your course/degree"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <Label htmlFor="linkedin" className="text-sm font-semibold text-[#281A39]">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-2"
                  />
                </div>

                {/* Bank Details */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-[#281A39] mb-4 flex items-center gap-2"><Banknote size={18} /> Payment Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="accountName" className="text-sm font-semibold text-[#281A39]">Account Name</Label>
                      <Input
                        id="accountName"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        placeholder="Account holder name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sortCode" className="text-sm font-semibold text-[#281A39]">Sort Code</Label>
                      <Input
                        id="sortCode"
                        value={bankSortCode}
                        onChange={(e) => setBankSortCode(e.target.value)}
                        placeholder="XX-XX-XX"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="accountNumber" className="text-sm font-semibold text-[#281A39]">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="Account number"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypalEmail" className="text-sm font-semibold text-[#281A39]">PayPal Email</Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        value={bankPaypalEmail}
                        onChange={(e) => setBankPaypalEmail(e.target.value)}
                        placeholder="PayPal email (optional)"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Earnings Shortcut Card */}
                <div 
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => { const el = document.querySelector('[value="earnings"]'); if (el instanceof HTMLElement) el.click(); }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-[#281A39]">£{totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="bg-amber-200 p-2 rounded-full">
                      <Banknote size={20} className="text-[#281A39]" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">from {completedSessions.length} completed session{completedSessions.length !== 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-amber-700 font-bold uppercase mt-2">Click for detailed breakdown →</p>
                </div>

                {/* Google Calendar */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-[#281A39] mb-3 flex items-center gap-2"><CalendarCheck size={18} /> Google Calendar</h3>
                  <CalendarConnectCard />
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleProfileUpdate}
                  disabled={updateProfile.isPending}
                  className="w-full"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="bg-white rounded-xl border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <Banknote size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#281A39]">Earnings Overview</h2>
                  <p className="text-sm text-gray-500">Track your income and session history</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Earned</p>
                  <p className="text-3xl font-bold text-[#281A39]">£{totalEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Sessions Completed</p>
                  <p className="text-3xl font-bold text-[#281A39]">{completedSessions.length}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Current Rate</p>
                  <p className="text-3xl font-bold text-[#281A39]">£{SESSION_RATE_PER_HOUR}/hr</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Pending Payout</p>
                  <p className="text-3xl font-bold text-amber">£0.00</p>
                </div>
              </div>

              <h3 className="font-serif text-xl font-bold text-[#281A39] mb-4">Completed Sessions History</h3>
              {completedSessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                  <p className="text-gray-500">No completed sessions yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-4 font-semibold text-sm text-gray-600">Date</th>
                        <th className="py-4 font-semibold text-sm text-gray-600">Student ID</th>
                        <th className="py-4 font-semibold text-sm text-gray-600">Subject</th>
                        <th className="py-4 font-semibold text-sm text-gray-600">Duration</th>
                        <th className="py-4 font-semibold text-sm text-gray-600 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {completedSessions.map((s) => {
                        const amount = ((s.duration || 60) / 60) * SESSION_RATE_PER_HOUR;
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 text-sm text-[#281A39]">{format(new Date(s.scheduledAt), "PPP")}</td>
                            <td className="py-4 text-sm font-medium text-[#281A39]">{s.studentId}</td>
                            <td className="py-4 text-sm text-gray-600">{s.subject}</td>
                            <td className="py-4 text-sm text-gray-600">{s.duration} mins</td>
                            <td className="py-4 text-sm font-bold text-[#281A39] text-right">£{amount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default TutorDashboard;
