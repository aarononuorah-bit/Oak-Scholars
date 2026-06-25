import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, GraduationCap,
  ExternalLink, Shield, UserPlus, CheckCircle, XCircle, Send,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

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

export function ParentDashboard() {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkStep, setLinkStep] = useState<"email" | "code">("email");
  const [linkedStudentName, setLinkedStudentName] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const { data: children = [], isLoading: childrenLoading, refetch: refetchChildren } = trpc.parent.myChildren.useQuery();
  const { data: pendingRequests = [], refetch: refetchRequests } = trpc.parent.pendingRequests.useQuery();

  const cancelSessionMutation = trpc.session.updateStatus.useMutation({
    onSuccess: () => { toast.success("Session cancelled"); refetchChildren(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const rescheduleSessionMutation = trpc.session.rescheduleSession.useMutation({
    onSuccess: () => { toast.success("Reschedule request sent"); refetchChildren(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const sendLinkRequest = trpc.parent.sendLinkRequest.useMutation({
    onSuccess: (data) => {
      toast.success(`Confirmation code sent to your child's email!`);
      setLinkedStudentName(data.studentName || "");
      setLinkStep("code");
      refetchRequests();
    },
    onError: (e) => toast.error(e.message),
  });

  const confirmLink = trpc.parent.confirmLink.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully linked to ${data.studentName || "your child"}!`);
      setLinkStep("email");
      setLinkEmail("");
      setConfirmCode("");
      refetchChildren();
      refetchRequests();
    },
    onError: (e) => toast.error(e.message),
  });

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0] || null;
  const effectiveChildId = selectedChild?.id ?? null;

  const { data: childTutors = [], isLoading: tutorsLoading } = trpc.tutoring.myTutors.useQuery(
    undefined,
    { enabled: false } // We'll use admin view for parent
  );
  const { data: childData } = trpc.parent.childData.useQuery(
    { studentId: effectiveChildId! },
    { enabled: !!effectiveChildId }
  );

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

  const upcomingSessions = (childData?.sessions || []).filter((s) => new Date(s.scheduledAt) > new Date());
  const completedSessions = (childData?.sessions || []).filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#E8A838] text-sm font-semibold tracking-widest uppercase">Parent</span>
          <h1 className="font-serif text-3xl font-bold text-[#281A39] mt-1">Parent Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor your child's tutoring progress</p>
        </div>

        {/* Pending requests banner */}
        {pendingRequests.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              You have <strong>{pendingRequests.length}</strong> pending link request(s). The student must approve from their Account page.
            </p>
          </div>
        )}

        <Tabs defaultValue={children.length > 0 ? "children" : "link"}>
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
            <TabsTrigger value="children" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#281A39] data-[state=active]:text-white rounded-lg px-3 py-2">
              <Users size={14} /> My Children ({children.length})
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#281A39] data-[state=active]:text-white rounded-lg px-3 py-2">
              <UserPlus size={14} /> Link a Child
            </TabsTrigger>
          </TabsList>

          {/* Children Tab */}
          <TabsContent value="children">
            {childrenLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : children.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">No children linked yet. Use the "Link a Child" tab to send a request.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Child selector */}
                {children.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedChildId(child.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                          (selectedChildId ?? children[0]?.id) === child.id
                            ? "bg-[#281A39] text-white border-[#281A39]"
                            : "bg-white text-[#281A39] border-gray-200 hover:border-[#281A39]"
                        }`}
                      >
                        {child.name || child.email}
                      </button>
                    ))}
                  </div>
                )}

                {selectedChild && (
                  <>
                    {/* Stats for selected child */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatCard label="Tutors" value={childData?.tutors?.length ?? 0} icon={Users} color="bg-[#281A39]" />
                      <StatCard label="Upcoming Sessions" value={upcomingSessions.length} icon={Calendar} color="bg-[#E8A838]" />
                      <StatCard label="Completed Sessions" value={completedSessions.length} icon={BookOpen} color="bg-green-500" />
                    </div>

                    {/* Tutors */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                      <h2 className="font-serif text-lg font-bold text-[#281A39] mb-4">
                        {selectedChild.name?.split(" ")[0] || "Child"}'s Tutors
                      </h2>
                      {!childData?.tutors || childData.tutors.length === 0 ? (
                        <p className="text-sm text-gray-400">No tutors assigned yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {childData.tutors.map((rel: any) => (
                            <div key={rel.id} className="border border-gray-100 rounded-xl p-4 flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#281A39] flex items-center justify-center text-white font-bold shrink-0">
                                {(rel.tutor?.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-[#281A39] text-sm">{rel.tutor?.name}</p>
                                  {rel.tutor?.linkedin && (
                                    <a href={rel.tutor.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                      <Linkedin size={11} /> LinkedIn <ExternalLink size={9} />
                                    </a>
                                  )}
                                </div>
                                {rel.tutor?.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rel.tutor.bio}</p>}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {rel.subjects && <span className="text-xs bg-[#281A39]/5 text-[#281A39] px-2 py-0.5 rounded-full">{rel.subjects}</span>}
                                  {rel.level && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{rel.level}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sessions */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                      <h2 className="font-serif text-lg font-bold text-[#281A39] mb-4">Sessions</h2>
                      {!childData?.sessions || childData.sessions.length === 0 ? (
                        <p className="text-sm text-gray-400">No sessions yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {childData.sessions.map((s: any) => (
                            <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl border ${new Date(s.scheduledAt) > new Date() ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"}`}>
                              <div>
                                <p className="font-semibold text-[#281A39] text-sm">{s.subject}</p>
                                <p className="text-xs text-gray-500">{format(new Date(s.scheduledAt), "PPP p")} &middot; {s.duration} min</p>
                              </div>
	                              <div className="flex items-center gap-2">
	                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.status === "completed" ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-700"}`}>
	                                  {s.status}
	                                </span>
	                                {s.status === "scheduled" && (
	                                  <div className="flex items-center gap-1">
	                                    <Button
	                                      size="sm"
	                                      variant="ghost"
	                                      className="h-8 px-2 text-[10px] text-gray-500 hover:text-[#281A39]"
	                                      onClick={() => {
	                                        const reason = window.prompt("Reason for cancellation (optional):");
	                                        if (reason !== null) {
                                          cancelSessionMutation.mutate({ id: s.id, status: "cancelled", notes: reason || undefined });
	                                        }
	                                      }}
	                                    >
	                                      Cancel
	                                    </Button>
	                                    <Button
	                                      size="sm"
	                                      variant="ghost"
	                                      className="h-8 px-2 text-[10px] text-[#E8A838] hover:bg-amber-50"
	                                      onClick={() => {
	                                        const newDateStr = window.prompt("Enter new date/time (YYYY-MM-DD HH:MM):", format(new Date(s.scheduledAt), "yyyy-MM-dd HH:mm"));
	                                        if (newDateStr) {
	                                          const newDate = new Date(newDateStr);
	                                          if (isNaN(newDate.getTime())) return toast.error("Invalid date format");
                                          rescheduleSessionMutation.mutate({ id: s.id, newScheduledAt: newDate });
	                                        }
	                                      }}
	                                    >
	                                      Reschedule
	                                    </Button>
	                                  </div>
	                                )}
	                              </div>
	                            </div>
	                          ))}
	                        </div>
	                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* Link a Child Tab */}
          <TabsContent value="link">
            <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-md">
              {linkStep === "email" ? (
                <>
                  <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Link Your Child's Account</h2>
                  <p className="text-sm text-gray-500 mb-5">
                    Enter your child's registered email address. We will send them a 6-digit confirmation code. Once you have the code from your child, enter it to complete the link.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#281A39]">Child's Email Address</Label>
                      <Input
                        type="email"
                        value={linkEmail}
                        onChange={(e) => setLinkEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="text-sm"
                        onKeyDown={(e) => e.key === "Enter" && linkEmail && sendLinkRequest.mutate({ studentEmail: linkEmail })}
                      />
                    </div>
                    <Button
                      onClick={() => sendLinkRequest.mutate({ studentEmail: linkEmail })}
                      disabled={sendLinkRequest.isPending || !linkEmail}
                      className="bg-[#E8A838] hover:bg-[#c8881a] text-[#281A39] font-semibold flex items-center gap-2"
                    >
                      <Send size={14} />
                      {sendLinkRequest.isPending ? "Sending code..." : "Send Confirmation Code"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setLinkStep("email")} className="text-xs text-gray-400 hover:text-[#281A39] flex items-center gap-1">
                      &larr; Back
                    </button>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#281A39] mb-1">Enter Confirmation Code</h2>
                  <p className="text-sm text-gray-500 mb-5">
                    A 6-digit code has been sent to your child's email address{linkedStudentName ? ` (${linkedStudentName})` : ""}. Ask them to share the code with you, then enter it below to complete the link.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                    <p className="text-xs text-amber-800 font-semibold">How it works:</p>
                    <ol className="text-xs text-amber-700 mt-1 space-y-1 list-decimal list-inside">
                      <li>Your child checks their email for the code</li>
                      <li>They share the 6-digit code with you</li>
                      <li>You enter the code below to complete the link</li>
                    </ol>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#281A39]">6-Digit Confirmation Code</Label>
                      <Input
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="text-sm text-center text-2xl font-mono tracking-widest"
                        onKeyDown={(e) => e.key === "Enter" && confirmCode.length === 6 && confirmLink.mutate({ code: confirmCode })}
                      />
                    </div>
                    <Button
                      onClick={() => confirmLink.mutate({ code: confirmCode })}
                      disabled={confirmLink.isPending || confirmCode.length !== 6}
                      className="bg-[#E8A838] hover:bg-[#c8881a] text-[#281A39] font-semibold flex items-center gap-2 w-full"
                    >
                      <CheckCircle size={14} />
                      {confirmLink.isPending ? "Confirming..." : "Confirm Link"}
                    </Button>
                    <button
                      onClick={() => sendLinkRequest.mutate({ studentEmail: linkEmail })}
                      disabled={sendLinkRequest.isPending}
                      className="text-xs text-gray-400 hover:text-[#281A39] w-full text-center"
                    >
                      {sendLinkRequest.isPending ? "Resending..." : "Resend code"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default ParentDashboard;
