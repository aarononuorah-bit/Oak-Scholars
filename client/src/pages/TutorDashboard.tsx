import { useState } from "react";
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
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, User,
  Shield, GraduationCap, CheckCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

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

export function TutorDashboard() {
  const { user } = useAuth();
  const [bio, setBio] = useState(user?.bio || "");
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [tutorSubjects, setTutorSubjects] = useState(user?.tutorSubjects || "");
  const [tutorLevel, setTutorLevel] = useState(user?.tutorLevel || "");

  const { data: students = [], isLoading: studentsLoading } = trpc.tutoring.myStudents.useQuery();
  const { data: sessions = [], isLoading: sessionsLoading } = trpc.session.tutorSessions.useQuery();
  const { data: feedbackReceived = [], isLoading: feedbackLoading } = trpc.feedback.received.useQuery();
  const utils = trpc.useUtils();

  const updateProfile = trpc.tutorProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.auth.me.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!user || user.role !== "tutor") {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <Navbar />
        <div className="container py-32 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-amber-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mb-4">Tutor Access Only</h1>
          <p className="text-gray-500 mb-6">This dashboard is for approved Oak Scholars tutors. If you believe this is an error, please contact the team.</p>
          <Link href="/"><Button style={{ backgroundColor: "#E8A838", color: "#281A39" }}>Back to Home</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) > new Date());
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgRating = feedbackReceived.length > 0
    ? (feedbackReceived.reduce((sum, f) => sum + f.rating, 0) / feedbackReceived.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#E8A838] text-sm font-semibold tracking-widest uppercase">Tutor</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle size={10} /> Approved
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#281A39]">Tutor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name?.split(" ")[0] || "Tutor"}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="My Students" value={students.length} icon={Users} color="bg-[#281A39]" />
          <StatCard label="Upcoming Sessions" value={upcomingSessions.length} icon={Calendar} color="bg-[#E8A838]" />
          <StatCard label="Completed Sessions" value={completedSessions.length} icon={BookOpen} color="bg-green-500" />
          <StatCard label="Avg Rating" value={avgRating} icon={Star} color="bg-purple-500" />
        </div>

        <Tabs defaultValue="students">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
            {[
              { value: "students", label: "My Students", icon: Users },
              { value: "sessions", label: "Sessions", icon: Calendar },
              { value: "feedback", label: "Feedback", icon: Star },
              { value: "profile", label: "My Profile", icon: User },
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

          {/* Students Tab */}
          <TabsContent value="students">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Your Students</h2>
              <p className="text-xs text-gray-500 mb-5">Students assigned to you by Oak Scholars admin.</p>
              {studentsLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No students assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((rel) => (
                    <div key={rel.id} className="border border-gray-100 rounded-xl p-5 hover:border-[#E8A838]/40 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#281A39]/10 flex items-center justify-center text-sm font-bold text-[#281A39]">
                            {(rel.student?.name || rel.student?.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#281A39]">{rel.student?.name || <span className="italic text-gray-400">No name</span>}</p>
                            <p className="text-xs text-gray-500">{rel.student?.email}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${rel.status === "active" ? "bg-green-100 text-green-700" : rel.status === "paused" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {rel.status}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-0.5">Subject(s)</p>
                          <p className="text-sm font-semibold text-[#281A39]">{rel.subjects || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-0.5">Level</p>
                          <p className="text-sm font-semibold text-[#281A39]">{rel.level || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-0.5">Started</p>
                          <p className="text-sm font-semibold text-[#281A39]">{formatDistanceToNow(new Date(rel.createdAt), { addSuffix: true })}</p>
                        </div>
                        {rel.student?.bio && (
                          <div className="col-span-2 md:col-span-3 bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Student Notes / Preferences</p>
                            <p className="text-sm text-[#281A39]">{rel.student.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-5">Sessions</h2>
              {sessionsLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No sessions yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#281A39] flex items-center gap-2 mb-3">
                        <Clock size={14} className="text-green-500" /> Upcoming
                      </h3>
                      <div className="space-y-3">
                        {upcomingSessions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                            <div>
                              <p className="font-semibold text-[#281A39] text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">{format(new Date(s.scheduledAt), "PPP p")} &middot; {s.duration} min</p>
                            </div>
                            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{s.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {completedSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#281A39] flex items-center gap-2 mb-3">
                        <BookOpen size={14} className="text-blue-500" /> Completed
                      </h3>
                      <div className="space-y-3">
                        {completedSessions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div>
                              <p className="font-semibold text-[#281A39] text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">{format(new Date(s.scheduledAt), "PPP p")}</p>
                              {s.notes && <p className="text-xs text-gray-400 mt-1 italic">{s.notes}</p>}
                            </div>
                            <span className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">Completed</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-5">Feedback from Students</h2>
              {feedbackLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : feedbackReceived.length === 0 ? (
                <div className="text-center py-12">
                  <Star size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No feedback yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackReceived.map((fb) => (
                    <div key={fb.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < fb.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}</span>
                      </div>
                      {fb.comment && <p className="text-sm text-gray-700">{fb.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
              <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Your Tutor Profile</h2>
              <p className="text-xs text-gray-500 mb-5">This information is visible to your students and Oak Scholars admin.</p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#281A39]">Bio / About You</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students a bit about yourself, your teaching style, and experience..."
                    rows={4}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#281A39] flex items-center gap-1.5">
                    <Linkedin size={13} /> LinkedIn URL
                  </Label>
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#281A39] flex items-center gap-1.5">
                    <GraduationCap size={13} /> Subjects You Teach
                  </Label>
                  <Input
                    value={tutorSubjects}
                    onChange={(e) => setTutorSubjects(e.target.value)}
                    placeholder="e.g. Maths, Physics, Chemistry"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#281A39]">Level(s) You Teach</Label>
                  <Input
                    value={tutorLevel}
                    onChange={(e) => setTutorLevel(e.target.value)}
                    placeholder="e.g. GCSE, A-Level, University"
                    className="text-sm"
                  />
                </div>
                <Button
                  onClick={() => updateProfile.mutate({ bio, linkedin, tutorSubjects, tutorLevel })}
                  disabled={updateProfile.isPending}
                  className="bg-[#E8A838] hover:bg-[#c8881a] text-[#281A39] font-semibold"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default TutorDashboard;
