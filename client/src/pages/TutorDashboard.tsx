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
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, GraduationCap,
  ExternalLink, Shield, Banknote, User,
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
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mt-1">Tutor Dashboard</h1>
        </div>

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
                          <p className="font-semibold text-[#281A39]">{rel.student?.name || <span className="italic text-gray-400">Name not set</span>}</p>
                          <p className="text-xs text-gray-500">{rel.student?.email}</p>
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
                      <h3 className="text-sm font-semibold text-[#281A39] flex items-center gap-2 mb-3"><BookOpen size={14} className="text-blue-500" /> Completed</h3>
                      <div className="space-y-3">
                        {completedSessions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div>
                              <p className="font-semibold text-[#281A39] text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">{format(new Date(s.scheduledAt), "PPP")}</p>
                            </div>
                          </div>
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

                {/* Earnings */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#281A39]">£{totalEarnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">from {completedSessions.length} completed session{completedSessions.length !== 1 ? 's' : ''}</p>
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
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default TutorDashboard;
