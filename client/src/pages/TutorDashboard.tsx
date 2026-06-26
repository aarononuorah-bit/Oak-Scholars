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
import Timetable from "@/components/Timetable"; // <--- ADDED IMPORT
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, GraduationCap,
  ExternalLink, Shield, Banknote, Camera, Upload,
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

          <TabsContent value="sessions">
            <div className="mb-8">
              <Timetable targetUserId={user.id} userName="My" />
            </div>
            {/* ... your existing sessions list code ... */}
          </TabsContent>
          
          {/* ... Rest of your tabs ... */}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default TutorDashboard;
