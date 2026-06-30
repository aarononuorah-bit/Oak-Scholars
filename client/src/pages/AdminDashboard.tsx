import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Timetable from "@/components/Timetable";
import {
  Calendar, Users, LayoutDashboard, ShoppingCart,
  FileText, TrendingUp, Activity, UserCheck,
  CheckCircle, CreditCard, MessageSquare, UserPlus,
  Mail, GraduationCap, Clock, AlertCircle, PoundSterling, RefreshCw,
  ChevronDown, ChevronUp, Phone, ExternalLink, BookOpen,
  User, Star, Banknote, X, Eye, Link2, ShoppingBag,
  Linkedin, ArrowLeft, MessageCircle, CalendarCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";

// ─── Colour helpers ───────────────────────────────────
const statusColour: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  reviewing: "bg-purple-100 text-purple-700",
  interview: "bg-blue-100 text-blue-700",
  contacted: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  read: "bg-gray-100 text-gray-600",
  replied: "bg-teal-100 text-teal-700",
  scheduled: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColour[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, colour, onClick }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; colour: string; onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? "cursor-pointer hover:border-amber-200 hover:scale-[1.02]" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-brand font-medium">{label}</p>
          <p className="text-3xl font-bold text-navy-deep mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-brand mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colour}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Modal Wrapper ────────────────────────────────────
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-4xl" : "max-w-2xl"} max-h-[92vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-serif text-xl font-bold text-navy-deep">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── User Dashboard Modal ─────────────────────────────
function UserDashboardModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data, isLoading } = trpc.admin.getUserDashboard.useQuery({ userId });
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <Modal title="User Dashboard" onClose={onClose} wide>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-56" /></div>
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Modal>
    );
  }

  if (!data) return (
    <Modal title="User Dashboard" onClose={onClose}>
      <p className="text-muted-brand text-center py-8">User not found.</p>
    </Modal>
  );

  const { user, studentSessions, studentRelationships, tutorSessions, tutorRelationships, feedbackReceived, linkedChildren, childrenData, orders } = data;
  const isTutor = user.role === "tutor";
  const isParent = user.role === "parent" || user.accountType === "parent";
  // Show student sessions for any non-tutor, non-parent user
  const isStudent = !isTutor && !isParent;

  const upcomingStudentSessions = studentSessions.filter((s) => new Date(s.scheduledAt) > new Date());
  const completedStudentSessions = studentSessions.filter((s) => s.status === "completed");
  const upcomingTutorSessions = tutorSessions.filter((s) => new Date(s.scheduledAt) > new Date());
  const completedTutorSessions = tutorSessions.filter((s) => s.status === "completed");
  const avgRating = feedbackReceived.length > 0
    ? (feedbackReceived.reduce((sum, f) => sum + f.rating, 0) / feedbackReceived.length).toFixed(1)
    : "—";
  const SESSION_RATE = 25;
  const totalEarnings = completedTutorSessions.reduce((sum, s) => sum + ((s.duration || 60) / 60) * SESSION_RATE, 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    ...(isStudent || isTutor ? [{ id: "sessions", label: "Sessions", icon: Calendar }] : []),
    ...(isTutor ? [{ id: "students", label: "Students", icon: Users }] : []),
    ...(isStudent ? [{ id: "tutors", label: "Tutors", icon: GraduationCap }] : []),
    ...(isParent ? [{ id: "children", label: "Children", icon: Users }] : []),
    ...(isTutor ? [{ id: "profile", label: "Profile", icon: User }] : []),
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "timetable", label: "Timetable", icon: CalendarCheck },
  ];

  return (
    <Modal title={`Dashboard — ${user.name || user.email || "User"}`} onClose={onClose} wide>
      {/* User header */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        {(user as any).profilePhotoUrl ? (
          <img src={(user as any).profilePhotoUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-navy-deep flex items-center justify-center text-white font-bold text-xl">
            {(user.name || user.email || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-navy-deep text-lg">{user.name || "No name"}</p>
          <p className="text-sm text-muted-brand">{user.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="outline" className="capitalize text-xs">{user.role}</Badge>
            {user.accountType && <Badge variant="outline" className="capitalize text-xs bg-amber-50 text-amber-700 border-amber-200">{user.accountType}</Badge>}
            {(user as any).approvedAsTutor === 1 && <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Approved Tutor</Badge>}
          </div>
        </div>
        <div className="text-right text-xs text-muted-brand">
          <p>Joined {user.createdAt ? format(new Date(user.createdAt), "d MMM yyyy") : "—"}</p>
          <p className="mt-0.5">Last sign-in: {user.lastSignedIn ? format(new Date(user.lastSignedIn), "d MMM yyyy") : "Never"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-6 bg-gray-50 p-1 rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === t.id ? "bg-navy-deep text-white shadow-sm" : "text-muted-brand hover:text-navy-deep hover:bg-white"
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(isStudent || isTutor) && (
              <>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-navy-deep">{isStudent ? studentSessions.length : tutorSessions.length}</p>
                  <p className="text-xs text-muted-brand mt-1">Total Sessions</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-navy-deep">{isStudent ? upcomingStudentSessions.length : upcomingTutorSessions.length}</p>
                  <p className="text-xs text-muted-brand mt-1">Upcoming</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-navy-deep">{isStudent ? completedStudentSessions.length : completedTutorSessions.length}</p>
                  <p className="text-xs text-muted-brand mt-1">Completed</p>
                </div>
              </>
            )}
            {isTutor && (
              <>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-navy-deep">{tutorRelationships.length}</p>
                  <p className="text-xs text-muted-brand mt-1">Students</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-navy-deep">{avgRating} ⭐</p>
                  <p className="text-xs text-muted-brand mt-1">Avg Rating</p>
                </div>
                <div className="bg-teal-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-navy-deep">£{totalEarnings.toFixed(0)}</p>
                  <p className="text-xs text-muted-brand mt-1">Est. Earnings</p>
                </div>
              </>
            )}
            {isStudent && (
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-navy-deep">{studentRelationships.length}</p>
                <p className="text-xs text-muted-brand mt-1">Tutors Assigned</p>
              </div>
            )}
            {isParent && (
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-navy-deep">{linkedChildren.length}</p>
                <p className="text-xs text-muted-brand mt-1">Linked Children</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-navy-deep">{orders.length}</p>
              <p className="text-xs text-muted-brand mt-1">Orders</p>
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h3 className="font-bold text-navy-deep text-sm mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-brand">
                <Mail size={13} className="text-gray-400 shrink-0" />
                <a href={`mailto:${user.email}`} className="hover:text-amber-600 transition-colors">{user.email || "—"}</a>
              </div>
              {(user as any).phone && (
                <div className="flex items-center gap-2 text-muted-brand">
                  <Phone size={13} className="text-gray-400 shrink-0" />
                  <span>{(user as any).phone}</span>
                </div>
              )}
              {(user as any).linkedin && (
                <div className="flex items-center gap-2 text-muted-brand">
                  <Linkedin size={13} className="text-gray-400 shrink-0" />
                  <a href={(user as any).linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                    LinkedIn <ExternalLink size={10} />
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-brand">
                <User size={13} className="text-gray-400 shrink-0" />
                <span>Login: {user.loginMethod || "password"}</span>
              </div>
            </div>
          </div>

          {/* Tutor profile summary */}
          {isTutor && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-navy-deep text-sm mb-3">Tutor Profile</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {(user as any).tutorUniversity && (
                  <div><p className="text-xs text-muted-brand">University</p><p className="font-medium text-navy-deep">{(user as any).tutorUniversity}</p></div>
                )}
                {(user as any).tutorCourse && (
                  <div><p className="text-xs text-muted-brand">Course</p><p className="font-medium text-navy-deep">{(user as any).tutorCourse}</p></div>
                )}
                {(user as any).tutorSubjects && (
                  <div><p className="text-xs text-muted-brand">Subjects</p><p className="font-medium text-navy-deep">{(user as any).tutorSubjects}</p></div>
                )}
                {(user as any).tutorLevel && (
                  <div><p className="text-xs text-muted-brand">Level</p><p className="font-medium text-navy-deep">{(user as any).tutorLevel}</p></div>
                )}
              </div>
              {(user as any).bio && (
                <div className="mt-3">
                  <p className="text-xs text-muted-brand mb-1">Bio</p>
                  <p className="text-sm text-navy-deep bg-gray-50 rounded-lg p-3">{(user as any).bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="space-y-4">
          {(isTutor ? tutorSessions : studentSessions).length === 0 ? (
            <div className="text-center py-10">
              <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-muted-brand text-sm">No sessions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(isTutor ? tutorSessions : studentSessions).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-amber-200 transition-colors">
                  <div>
                    <p className="font-semibold text-navy-deep text-sm">{s.subject}</p>
                    <p className="text-xs text-muted-brand">{format(new Date(s.scheduledAt), "PPP p")} · {s.duration} min</p>
                    {s.notes && <p className="text-xs text-muted-brand mt-0.5 italic">"{s.notes}"</p>}
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "students" && (
        <div className="space-y-3">
          {tutorRelationships.length === 0 ? (
            <div className="text-center py-10">
              <Users size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-muted-brand text-sm">No students assigned.</p>
            </div>
          ) : tutorRelationships.map((rel) => (
            <div key={rel.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-navy-deep/10 flex items-center justify-center font-bold text-navy-deep shrink-0">
                {((rel as any).student?.name || (rel as any).student?.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-deep text-sm">{(rel as any).student?.name || "No name"}</p>
                <p className="text-xs text-muted-brand">{(rel as any).student?.email}</p>
                <p className="text-xs text-muted-brand mt-0.5">{rel.subjects} · {rel.level}</p>
              </div>
              <StatusBadge status={rel.status} />
            </div>
          ))}
        </div>
      )}

      {activeTab === "tutors" && (
        <div className="space-y-3">
          {studentRelationships.length === 0 ? (
            <div className="text-center py-10">
              <GraduationCap size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-muted-brand text-sm">No tutors assigned.</p>
            </div>
          ) : studentRelationships.map((rel) => (
            <div key={rel.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-navy-deep/10 flex items-center justify-center font-bold text-navy-deep shrink-0">
                {((rel as any).tutor?.name || (rel as any).tutor?.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-deep text-sm">{(rel as any).tutor?.name || "No name"}</p>
                <p className="text-xs text-muted-brand">{(rel as any).tutor?.email}</p>
                <p className="text-xs text-muted-brand mt-0.5">{rel.subjects} · {rel.level}</p>
              </div>
              <StatusBadge status={rel.status} />
            </div>
          ))}
        </div>
      )}

      {activeTab === "children" && (
        <div className="space-y-4">
          {linkedChildren.length === 0 ? (
            <div className="text-center py-10">
              <Link2 size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-muted-brand text-sm">No children linked.</p>
            </div>
          ) : childrenData.map(({ child, sessions: childSessions, tutors: childTutors }) => (
            <div key={child.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                  {(child.name || child.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy-deep">{child.name || "No name"}</p>
                  <p className="text-xs text-muted-brand">{child.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="font-bold text-navy-deep">{childSessions.length}</p>
                  <p className="text-xs text-muted-brand">Sessions</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="font-bold text-navy-deep">{childSessions.filter(s => new Date(s.scheduledAt) > new Date()).length}</p>
                  <p className="text-xs text-muted-brand">Upcoming</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="font-bold text-navy-deep">{childTutors.length}</p>
                  <p className="text-xs text-muted-brand">Tutors</p>
                </div>
              </div>
              {childSessions.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-t border-gray-50 text-sm">
                  <span className="text-navy-deep font-medium">{s.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-brand">{format(new Date(s.scheduledAt), "d MMM")}</span>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <Timetable targetUserId={child.id} userName={child.name || "Child"} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "profile" && isTutor && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "University", value: (user as any).tutorUniversity },
              { label: "Course", value: (user as any).tutorCourse },
              { label: "Subjects", value: (user as any).tutorSubjects },
              { label: "Level", value: (user as any).tutorLevel },
            ].map(({ label, value }) => value ? (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-muted-brand font-medium mb-1">{label}</p>
                <p className="font-semibold text-navy-deep">{value}</p>
              </div>
            ) : null)}
          </div>

          {(user as any).bio && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-muted-brand font-medium mb-2">Bio</p>
              <p className="text-sm text-navy-deep">{(user as any).bio}</p>
            </div>
          )}

          {/* Bank details (admin-only sensitive view) */}
          {((user as any).bankAccountName || (user as any).bankSortCode || (user as any).bankAccountNumber || (user as any).bankPaypalEmail) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-navy-deep text-sm mb-3 flex items-center gap-2">
                <Banknote size={15} className="text-amber-600" /> Payment Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {(user as any).bankAccountName && (
                  <div><p className="text-xs text-muted-brand">Account Name</p><p className="font-medium text-navy-deep">{(user as any).bankAccountName}</p></div>
                )}
                {(user as any).bankSortCode && (
                  <div><p className="text-xs text-muted-brand">Sort Code</p><p className="font-medium text-navy-deep font-mono">{(user as any).bankSortCode}</p></div>
                )}
                {(user as any).bankAccountNumber && (
                  <div><p className="text-xs text-muted-brand">Account Number</p><p className="font-medium text-navy-deep font-mono">{(user as any).bankAccountNumber}</p></div>
                )}
                {(user as any).bankPaypalEmail && (
                  <div><p className="text-xs text-muted-brand">PayPal Email</p><p className="font-medium text-navy-deep">{(user as any).bankPaypalEmail}</p></div>
                )}
              </div>
            </div>
          )}

          {/* Feedback received */}
          {feedbackReceived.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-navy-deep text-sm mb-3 flex items-center gap-2">
                <Star size={15} className="text-amber-500" /> Feedback Received ({feedbackReceived.length})
              </h3>
              <div className="space-y-2">
                {feedbackReceived.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-start gap-3 py-2 border-t border-gray-50">
                    <div className="flex shrink-0">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={12} className={n <= f.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-brand flex-1">{f.comment || "No comment"}</p>
                    <span className="text-xs text-gray-400 shrink-0">{format(new Date(f.createdAt), "d MMM")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earnings summary */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <p className="text-sm text-teal-700 font-medium">Estimated Total Earnings</p>
            <p className="text-2xl font-bold text-navy-deep">£{totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-teal-600 mt-1">from {completedTutorSessions.length} completed session{completedTutorSessions.length !== 1 ? "s" : ""} @ £{SESSION_RATE}/hr</p>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-2">
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-muted-brand text-sm">No orders yet.</p>
            </div>
          ) : orders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-amber-200 transition-colors">
              <div>
                <p className="font-semibold text-navy-deep text-sm">{o.packageName || o.description || "Order"}</p>
                <p className="text-xs text-muted-brand">{format(new Date(o.createdAt), "d MMM yyyy")}</p>
                {o.stripeSessionId && (
                  <a
                    href={`https://dashboard.stripe.com/payments/${o.stripeSessionId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                  >
                    View in Stripe <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-deep">£{(o.amountTotal / 100).toFixed(2)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "timetable" && (
        <div>
          <Timetable targetUserId={userId} userName={user.name || "User"} />
        </div>
      )}
    </Modal>
  );
}

// ─── Booking Detail Modal ─────────────────────────────
function BookingDetailModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.booking.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.booking.list.invalidate(); },
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <Modal title="Booking Details" onClose={onClose}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg shrink-0">
            {(booking.firstName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-navy-deep">{booking.firstName} {booking.lastName}</p>
            <p className="text-sm text-muted-brand">{booking.email}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Session details */}
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Subject" value={booking.subject} />
          <InfoField label="Level" value={booking.level} />
          <InfoField label="Package / Session Type" value={booking.sessionType} />
          <InfoField label="Preferred Time" value={booking.preferredTime} />
          <InfoField label="Phone" value={booking.phone} />
          <InfoField label="Preferred Contact" value={booking.preferredContactMethod} />
          <InfoField label="Submitted" value={format(new Date(booking.createdAt), "d MMM yyyy, HH:mm")} />
        </div>

        {booking.message && (
          <div>
            <p className="text-xs font-bold text-navy-deep uppercase tracking-wide mb-1">Note from student</p>
            <p className="text-sm text-muted-brand bg-gray-50 rounded-xl p-4 border border-gray-100">{booking.message}</p>
          </div>
        )}

        {booking.stripeSessionId && (
          <div className="flex items-center gap-2 text-sm text-muted-brand bg-gray-50 rounded-xl p-3 border border-gray-100">
            <CreditCard size={14} className="text-gray-400 shrink-0" />
            <span className="font-mono text-xs truncate">{booking.stripeSessionId}</span>
            <a href={`https://dashboard.stripe.com/payments/${booking.stripeSessionId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 shrink-0">
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Update status */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <span className="text-sm font-semibold text-navy-deep">Update Status:</span>
          <select
            value={booking.status}
            onChange={(e) => updateStatusMutation.mutate({ id: booking.id, status: e.target.value as any })}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-navy-deep bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <a
            href={`mailto:${booking.email}?subject=Your Oak Scholars Booking&body=Hi ${booking.firstName},`}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <Mail size={13} /> Email
          </a>
        </div>
      </div>
    </Modal>
  );
}

// ─── Message Detail Modal ─────────────────────────────
function MessageDetailModal({ message, onClose }: { message: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.admin.updateMessageStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.admin.messages.invalidate(); },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <Modal title="Message Details" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-lg shrink-0">
            {(message.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-navy-deep">{message.name}</p>
            <p className="text-sm text-muted-brand">{message.email}</p>
          </div>
          <StatusBadge status={message.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Subject" value={message.subject} />
          <InfoField label="Received" value={format(new Date(message.createdAt), "d MMM yyyy, HH:mm")} />
        </div>

        <div>
          <p className="text-xs font-bold text-navy-deep uppercase tracking-wide mb-2">Message</p>
          <p className="text-sm text-muted-brand bg-gray-50 rounded-xl p-4 border border-gray-100 whitespace-pre-wrap">{message.message}</p>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <span className="text-sm font-semibold text-navy-deep">Mark as:</span>
          <select
            value={message.status}
            onChange={(e) => updateStatusMutation.mutate({ id: message.id, status: e.target.value as any })}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-navy-deep bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
          <a
            href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <Mail size={13} /> Reply
          </a>
        </div>
      </div>
    </Modal>
  );
}

// ─── Application Detail Modal ─────────────────────────
function ApplicationDetailModal({ application, onClose }: { application: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.admin.updateTutorApplicationStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.admin.tutorApplications.invalidate(); },
    onError: () => toast.error("Failed to update"),
  });

  return (
    <Modal title="Tutor Application" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-lg shrink-0">
            {(application.firstName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-navy-deep">{application.firstName} {application.lastName}</p>
            <p className="text-sm text-muted-brand">{application.email}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoField label="University" value={application.university} />
          <InfoField label="Degree Subject" value={application.degreeSubject} />
          <InfoField label="Year of Study" value={application.yearOfStudy} />
          <InfoField label="Subjects" value={application.subjects} />
          <InfoField label="Levels" value={application.levels} />
          <InfoField label="Phone" value={application.phone} />
          <InfoField label="Preferred Contact" value={application.preferredContactMethod} />
          <InfoField label="Applied" value={format(new Date(application.createdAt), "d MMM yyyy")} />
        </div>

        {application.experience && (
          <div>
            <p className="text-xs font-bold text-navy-deep uppercase tracking-wide mb-2">Experience</p>
            <p className="text-sm text-muted-brand bg-gray-50 rounded-xl p-4 border border-gray-100 whitespace-pre-wrap">{application.experience}</p>
          </div>
        )}

        {application.coverLetter && (
          <div>
            <p className="text-xs font-bold text-navy-deep uppercase tracking-wide mb-2">Cover Letter</p>
            <p className="text-sm text-muted-brand bg-gray-50 rounded-xl p-4 border border-gray-100 whitespace-pre-wrap">{application.coverLetter}</p>
          </div>
        )}

        {application.cvFileUrl && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <FileText size={16} className="text-blue-600 shrink-0" />
            <span className="text-sm text-blue-700 font-medium">CV Uploaded</span>
            <a href={application.cvFileUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">
              View CV <ExternalLink size={11} />
            </a>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <span className="text-sm font-semibold text-navy-deep">Update Status:</span>
          <select
            value={application.status}
            onChange={(e) => updateStatusMutation.mutate({ id: application.id, status: e.target.value as any })}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-navy-deep bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="interview">Interview</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <a
            href={`mailto:${application.email}?subject=Your Oak Scholars Application`}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <Mail size={13} /> Email
          </a>
        </div>
      </div>
    </Modal>
  );
}

// ─── Order Detail Modal ───────────────────────────────
function OrderDetailModal({ order, onClose }: { order: any; onClose: () => void }) {
  return (
    <Modal title="Order Details" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <CreditCard size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-navy-deep">{order.email}</p>
            <p className="text-sm text-muted-brand">{order.packageName || "Order"}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-navy-deep text-lg">£{(order.amountTotal / 100).toFixed(2)}</p>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Package" value={order.packageName} />
          <InfoField label="Amount" value={`£${(order.amountTotal / 100).toFixed(2)}`} />
          <InfoField label="Status" value={order.status} />
          <InfoField label="Date" value={format(new Date(order.createdAt), "d MMM yyyy, HH:mm")} />
        </div>

        {order.stripeSessionId && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <CreditCard size={14} className="text-gray-400 shrink-0" />
            <span className="font-mono text-xs text-muted-brand truncate">{order.stripeSessionId}</span>
            <a href={`https://dashboard.stripe.com/payments/${order.stripeSessionId}`} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold shrink-0">
              Stripe <ExternalLink size={10} />
            </a>
          </div>
        )}

        {order.stripePaymentIntentId && (
          <InfoField label="Payment Intent" value={order.stripePaymentIntentId} mono />
        )}
      </div>
    </Modal>
  );
}

// ─── Info Field helper ────────────────────────────────
function InfoField({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-brand font-medium mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-navy-deep ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────
function OverviewTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const utils = trpc.useUtils();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, isLoading } = trpc.admin.overview.useQuery();

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => { utils.admin.overview.invalidate(); }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, utils]);

  const activityIcon: Record<string, React.ElementType> = {
    booking: Calendar, message: Mail, application: GraduationCap, order: CreditCard, user: UserPlus,
  };
  const activityColour: Record<string, string> = {
    booking: "text-blue-600 bg-blue-50", message: "text-purple-600 bg-purple-50",
    application: "text-green-600 bg-green-50", order: "text-amber-600 bg-amber-50", user: "text-pink-600 bg-pink-50",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-brand">Failed to load overview.</p>;
  const { stats, recentActivity } = data;

  return (
    <div className="space-y-8">
      {/* Refresh Controls */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-navy-deep">Auto-refresh every 60s</span>
        </label>
        <button
          onClick={() => utils.admin.overview.invalidate()}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} /> Refresh Now
        </button>
      </div>

      {/* Stats grid — all clickable */}
      <div>
        <h2 className="text-lg font-bold text-navy-deep mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Total Bookings" value={stats.totalBookings} sub={`${stats.newBookings} new`} colour="bg-blue-500" onClick={() => onNavigate("bookings")} />
          <StatCard icon={ShoppingCart} label="Paid Orders" value={stats.paidOrders} sub={`£${(stats.recentRevenue / 100).toFixed(0)} last 30d`} colour="bg-amber-500" onClick={() => onNavigate("orders")} />
          <StatCard icon={GraduationCap} label="Tutor Applications" value={stats.totalApplications} sub={`${stats.acceptedTutors} accepted`} colour="bg-green-500" onClick={() => onNavigate("applications")} />
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub={`${stats.recentUsers} last 30d`} colour="bg-purple-500" onClick={() => onNavigate("users")} />
          <StatCard icon={MessageSquare} label="Messages" value={stats.totalMessages} sub={`${stats.unreadMessages} unread`} colour="bg-pink-500" onClick={() => onNavigate("messages")} />
          <StatCard icon={CreditCard} label="Total Revenue" value={`£${(stats.totalRevenue / 100).toFixed(2)}`} sub={`${stats.totalOrders} orders`} colour="bg-teal-500" onClick={() => onNavigate("earnings")} />
          <StatCard icon={UserCheck} label="Active Tutors" value={stats.acceptedTutors} sub={`${stats.cvUploads} CVs uploaded`} colour="bg-indigo-500" onClick={() => onNavigate("users")} />
          <StatCard icon={TrendingUp} label="New Bookings (30d)" value={stats.recentBookings} sub={`${stats.recentOrders} orders`} colour="bg-orange-500" onClick={() => onNavigate("bookings")} />
        </div>
      </div>

      {/* Recent activity — clickable rows */}
      <div>
        <h2 className="text-lg font-bold text-navy-deep mb-4 flex items-center gap-2">
          <Activity size={18} className="text-amber-500" /> Recent Activity (last 7 days)
        </h2>
        {recentActivity.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-muted-brand">No activity in the last 7 days.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {recentActivity.map((item, i) => {
              const Icon = activityIcon[item.type] || Activity;
              const colourClass = activityColour[item.type] || "text-gray-500 bg-gray-50";
              const tabMap: Record<string, string> = { booking: "bookings", message: "messages", application: "applications", order: "orders", user: "users" };
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate(tabMap[item.type] || "overview")}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${colourClass}`}><Icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-deep text-sm truncate">{item.label}</p>
                    <p className="text-xs text-muted-brand truncate">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status && <StatusBadge status={item.status} />}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bookings Tab ────────────────────────────────────
function BookingsTab() {
  const { data: bookings, isLoading } = trpc.booking.list.useQuery();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-deep">Bookings</h2>
        <Badge variant="outline">{bookings?.length ?? 0} total</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-muted-brand">No bookings yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedBooking(b)}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                b.status === "confirmed" ? "bg-green-100" : b.status === "cancelled" ? "bg-red-100" : b.status === "contacted" ? "bg-blue-100" : "bg-amber-100"
              }`}>
                <Calendar size={14} className={
                  b.status === "confirmed" ? "text-green-600" : b.status === "cancelled" ? "text-red-600" : b.status === "contacted" ? "text-blue-600" : "text-amber-600"
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-deep text-sm">{b.firstName} {b.lastName}</p>
                <p className="text-xs text-muted-brand truncate">{b.subject} · {b.level} · {b.sessionType}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={b.status} />
                <span className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString("en-GB")}</span>
                <Eye size={14} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
}

// ─── Messages Tab ─────────────────────────────────────
function MessagesTab() {
  const { data: messages, isLoading } = trpc.admin.messages.useQuery();
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-deep">Messages</h2>
        <Badge variant="outline">{messages?.length ?? 0} total</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : !messages || messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <MessageCircle size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-muted-brand">No messages yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {messages.map((m: any) => (
            <div
              key={m.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedMessage(m)}
            >
              <div className="p-1.5 rounded-lg bg-purple-100 shrink-0">
                <MessageSquare size={14} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-deep text-sm">{m.name}</p>
                <p className="text-xs text-muted-brand truncate">{m.subject}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={m.status} />
                <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
                <Eye size={14} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMessage && (
        <MessageDetailModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />
      )}
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────
function UsersTab() {
  const { data: users, isLoading } = trpc.admin.users.useQuery();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => toast.success("Role updated"),
    onError: () => toast.error("Failed to update role"),
  });
  const utils = trpc.useUtils();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-deep">Manage Users</h2>
        <Badge variant="outline">{users?.length ?? 0} total</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
              </div>
              <Skeleton className="w-24 h-9 rounded-md" />
            </div>
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <p className="text-center text-muted-brand py-8">No users found.</p>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-amber-200 transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedUserId(u.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center font-bold text-navy-deep shrink-0">
                  {(u.name || u.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-navy-deep">{u.name || "No name"}</p>
                  <p className="text-sm text-muted-brand">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <select
                  value={u.role}
                  onChange={(e) => {
                    updateRoleMutation.mutate(
                      { id: u.id, role: e.target.value as any },
                      { onSuccess: () => utils.admin.users.invalidate() }
                    );
                  }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-navy-deep bg-white focus:outline-none focus:ring-2 focus:ring-amber/30"
                >
                  <option value="user">User</option>
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={(e) => { e.stopPropagation(); setSelectedUserId(u.id); }}>
                  <Eye size={13} /> View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUserId && (
        <UserDashboardModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}

// ─── Orders Tab ──────────────────────────────────────
function OrdersTab() {
  const { data: orders, isLoading } = trpc.admin.orders.useQuery();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-deep">Orders</h2>
        <Badge variant="outline">{orders?.length ?? 0} total</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : !orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <ShoppingCart size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-muted-brand">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedOrder(o)}
            >
              <div>
                <p className="font-semibold text-navy-deep text-sm">{o.email}</p>
                <p className="text-xs text-muted-brand">{o.packageName} · {new Date(o.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-navy-deep">£{(o.amountTotal / 100).toFixed(2)}</span>
                <StatusBadge status={o.status} />
                <Eye size={14} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────
function ApplicationsTab() {
  const { data: applications, isLoading } = trpc.admin.tutorApplications.useQuery();
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-deep">Tutor Applications</h2>
        <Badge variant="outline">{applications?.length ?? 0} total</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : !applications || applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <GraduationCap size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-muted-brand">No applications yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedApp(app)}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 shrink-0">
                {(app.firstName || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-deep text-sm">{app.firstName} {app.lastName}</p>
                <p className="text-xs text-muted-brand truncate">{app.university} · {app.degreeSubject} · {app.subjects}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={app.status} />
                {app.cvFileUrl && <div title="CV uploaded"><FileText size={13} className="text-blue-400" /></div>}
                <Eye size={14} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <ApplicationDetailModal application={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  );
}

// ─── Earnings Tab ────────────────────────────────────
function EarningsTab() {
  const { data, isLoading } = trpc.admin.earnings.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-brand">Failed to load earnings.</p>;
  const { totalRevenue, recentRevenue, totalOrders, months, byPackage } = data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={PoundSterling} label="Total Revenue" value={`£${(totalRevenue / 100).toFixed(2)}`} sub={`${totalOrders} paid orders`} colour="bg-teal-500" />
        <StatCard icon={TrendingUp} label="Last 30 Days" value={`£${(recentRevenue / 100).toFixed(2)}`} sub="rolling 30-day window" colour="bg-amber-500" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders} sub="all time paid orders" colour="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy-deep mb-5">Monthly Revenue (last 12 months)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={months} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tickFormatter={(v) => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11, fill: "#6b7280" }} />
            <Tooltip
              formatter={(value: number) => [`£${(value / 100).toFixed(2)}`, "Revenue"]}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-deep">Revenue by Package</h2>
        </div>
        {byPackage.length === 0 ? (
          <div className="p-8 text-center">
            <PoundSterling size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-muted-brand">No paid orders yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg / Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byPackage.map((pkg) => (
                <tr key={pkg.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-navy-deep">{pkg.name}</td>
                  <td className="px-5 py-3 text-right text-muted-brand">{pkg.orders}</td>
                  <td className="px-5 py-3 text-right font-bold text-navy-deep">£{(pkg.revenue / 100).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-muted-brand">£{pkg.orders > 0 ? (pkg.revenue / pkg.orders / 100).toFixed(2) : "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Shell ─────────────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-navy-deep font-bold">Access Denied</p>
        <p className="text-muted-brand text-sm mt-1">Admin access required.</p>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "applications", label: "Applications", icon: GraduationCap },
    { id: "earnings", label: "Earnings", icon: PoundSterling },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <LayoutDashboard size={22} className="text-amber-600" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-navy-deep">Admin Dashboard</h1>
            <p className="text-sm text-muted-brand">Full platform visibility — click any item to view details</p>
          </div>
        </div>

        {/* Tab navigation — grid-based for equal spacing */}
        <div className="bg-white border border-gray-100 rounded-2xl p-1.5 mb-8 shadow-sm">
          <div className="grid grid-cols-4 md:grid-cols-7 gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === t.id
                    ? "bg-navy-deep text-white shadow-md"
                    : "text-muted-brand hover:text-navy-deep hover:bg-gray-50"
                }`}
              >
                <t.icon size={15} />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "overview" && <OverviewTab onNavigate={setActiveTab} />}
          {activeTab === "bookings" && <BookingsTab />}
          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "applications" && <ApplicationsTab />}
          {activeTab === "earnings" && <EarningsTab />}
        </div>
      </div>
      <Footer />
    </div>
  );
}
