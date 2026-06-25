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
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, User,
  Shield, GraduationCap, CheckCircle, Banknote, TrendingUp,
  Upload, Camera, Building2, BookMarked,
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
  const [tutorUniversity, setTutorUniversity] = useState((user as any)?.tutorUniversity || "");
  const [tutorCourse, setTutorCourse] = useState((user as any)?.tutorCourse || "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState((user as any)?.profilePhotoUrl || "");
  // Banking details
  const [bankAccountName, setBankAccountName] = useState((user as any)?.bankAccountName || "");
  const [bankSortCode, setBankSortCode] = useState((user as any)?.bankSortCode || "");
  const [bankAccountNumber, setBankAccountNumber] = useState((user as any)?.bankAccountNumber || "");
  const [bankPaypalEmail, setBankPaypalEmail] = useState((user as any)?.bankPaypalEmail || "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: students = [], isLoading: studentsLoading } = trpc.tutoring.myStudents.useQuery();
  const { data: sessions = [], isLoading: sessionsLoading } = trpc.session.tutorSessions.useQuery();
  const { data: feedbackReceived = [], isLoading: feedbackLoading } = trpc.feedback.received.useQuery();
  const { data: orders = [] } = trpc.orders.mine.useQuery();
  const utils = trpc.useUtils();

  const updateProfile = trpc.tutorProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.auth.me.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const uploadFile = trpc.storage.upload.useMutation({
    onSuccess: (data) => {
      setProfilePhotoUrl(data.url);
      toast.success("Photo uploaded!");
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

  // Earnings calculation: £25/hr assumed per completed session (can be adjusted)
  const SESSION_RATE_PER_HOUR = 25;
  const totalEarnings = completedSessions.reduce((sum, s) => sum + ((s.duration || 60) / 60) * SESSION_RATE_PER_HOUR, 0);
  const nextSession = upcomingSessions.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

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
              { value: "earnings", label: "Earnings", icon: TrendingUp },
              { value: "profile", label: "My Profile", icon: User },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#281A39] data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg px-3 py-2 text-gray-600 hover:text-[#281A39]"
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
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-0.5">Next Session</p>
                          <p className="text-sm font-semibold text-[#281A39]">
                            {(() => {
                              const studentSessions = sessions.filter(
                                (s) => s.studentId === rel.student?.id && new Date(s.scheduledAt) > new Date()
                              ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
                              return studentSessions[0]
                                ? format(new Date(studentSessions[0].scheduledAt), "d MMM, p")
                                : "Not scheduled";
                            })()}
                          </p>
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

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-xs text-gray-500 font-medium mb-1">Total Earned</p>
                  <p className="text-3xl font-bold text-[#281A39]">£{totalEarnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">Based on completed sessions</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-xs text-gray-500 font-medium mb-1">Sessions Completed</p>
                  <p className="text-3xl font-bold text-[#281A39]">{completedSessions.length}</p>
                  <p className="text-xs text-gray-400 mt-1">All time</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-xs text-gray-500 font-medium mb-1">Next Session</p>
                  <p className="text-lg font-bold text-[#281A39]">
                    {nextSession ? format(new Date(nextSession.scheduledAt), "d MMM, p") : "None scheduled"}
                  </p>
                  {nextSession && <p className="text-xs text-gray-400 mt-1">{nextSession.subject}</p>}
                </div>
              </div>

              {/* Earnings breakdown */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Earnings Breakdown</h2>
                <p className="text-xs text-gray-500 mb-5">A record of your completed sessions and estimated earnings.</p>
                {completedSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Banknote size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No completed sessions yet. Your earnings will appear here once sessions are marked as completed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Date</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Subject</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Duration</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {completedSessions
                          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                          .map((s) => {
                            const earned = ((s.duration || 60) / 60) * SESSION_RATE_PER_HOUR;
                            return (
                              <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 text-gray-600">{format(new Date(s.scheduledAt), "d MMM yyyy")}</td>
                                <td className="py-3 font-medium text-[#281A39]">{s.subject}</td>
                                <td className="py-3 text-gray-500">{s.duration} min</td>
                                <td className="py-3 text-right font-semibold text-green-700">£{earned.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td colSpan={3} className="pt-3 text-sm font-bold text-[#281A39]">Total</td>
                          <td className="pt-3 text-right text-lg font-bold text-[#281A39]">£{totalEarnings.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-4">
                  Earnings shown are estimates based on session duration. Actual payments are processed by Oak Scholars and transferred to your registered bank account. For payment queries, contact <a href="mailto:team@oakscholars.com" className="text-[#E8A838] hover:underline">team@oakscholars.com</a>.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile photo */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
                <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Profile Photo</h2>
                <p className="text-xs text-gray-500 mb-5">
                  Upload a photo that will be visible to your students. A <strong>professional headshot</strong> is strongly recommended — it builds trust and makes a great first impression.
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={28} className="text-gray-300" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadFile.isPending}
                    >
                      <Upload size={13} />
                      {uploadFile.isPending ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <p className="text-xs text-gray-400">JPG, PNG or WebP. Max 5MB.</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Profile details */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#281A39] flex items-center gap-1.5">
                        <Building2 size={13} /> University
                      </Label>
                      <Input
                        value={tutorUniversity}
                        onChange={(e) => setTutorUniversity(e.target.value)}
                        placeholder="e.g. University of Oxford"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#281A39] flex items-center gap-1.5">
                        <BookMarked size={13} /> Course / Degree
                      </Label>
                      <Input
                        value={tutorCourse}
                        onChange={(e) => setTutorCourse(e.target.value)}
                        placeholder="e.g. Mathematics (BSc)"
                        className="text-sm"
                      />
                    </div>
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
                    onClick={() => updateProfile.mutate({ bio, linkedin, tutorSubjects, tutorLevel, tutorUniversity, tutorCourse, profilePhotoUrl })}
                    disabled={updateProfile.isPending}
                    className="bg-[#E8A838] hover:bg-[#c8881a] text-[#281A39] font-semibold"
                  >
                    {updateProfile.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>

              {/* Banking details */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
                <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1 flex items-center gap-2">
                  <Banknote size={18} className="text-[#E8A838]" /> Banking Details
                </h2>
                <p className="text-xs text-gray-500 mb-5">
                  Provide your banking details so Oak Scholars can process your payments. Your details are stored securely and only used for payment purposes.
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#281A39]">Account Holder Name</Label>
                    <Input
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Full name as it appears on your bank account"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#281A39]">Sort Code</Label>
                      <Input
                        value={bankSortCode}
                        onChange={(e) => setBankSortCode(e.target.value)}
                        placeholder="00-00-00"
                        maxLength={8}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#281A39]">Account Number</Label>
                      <Input
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="12345678"
                        maxLength={8}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#281A39]">PayPal Email (optional)</Label>
                    <Input
                      type="email"
                      value={bankPaypalEmail}
                      onChange={(e) => setBankPaypalEmail(e.target.value)}
                      placeholder="your@paypal.com"
                      className="text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => updateProfile.mutate({ bankAccountName, bankSortCode, bankAccountNumber, bankPaypalEmail })}
                    disabled={updateProfile.isPending}
                    className="bg-[#281A39] hover:bg-[#160D22] text-white font-semibold"
                  >
                    {updateProfile.isPending ? "Saving..." : "Save Banking Details"}
                  </Button>
                </div>
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
