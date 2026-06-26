import Timetable from "@/components/Timetable";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Calendar, BookOpen, Star, Clock, GraduationCap,
  CheckCircle, Send, Loader,
} from "lucide-react";

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
  const [confirmCode, setConfirmCode] = useState("");
  const [linkStep, setLinkStep] = useState<"email" | "code">("email");

  const { data: children = [], isLoading: childrenLoading, refetch: refetchChildren } = trpc.parent.myChildren.useQuery();
  const { data: pendingRequests = [], refetch: refetchRequests } = trpc.parent.pendingRequests.useQuery();

  const sendLinkRequest = trpc.parent.sendLinkRequest.useMutation({
    onSuccess: () => {
      toast.success("Confirmation code sent!");
      setLinkStep("code");
      refetchRequests();
    },
    onError: (e) => toast.error(e.message),
  });

  const confirmLink = trpc.parent.confirmLink.useMutation({
    onSuccess: () => {
      toast.success("Successfully linked!");
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

  const { data: childData } = trpc.parent.childData.useQuery(
    { studentId: effectiveChildId! },
    { enabled: !!effectiveChildId }
  );

  if (!user) return <div>Access Denied</div>;

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail.trim()) {
      toast.error("Please enter a valid email");
      return;
    }
    sendLinkRequest.mutate({ childEmail: linkEmail });
  };

  const handleConfirmLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCode.trim()) {
      toast.error("Please enter the confirmation code");
      return;
    }
    confirmLink.mutate({ childEmail: linkEmail, code: confirmCode });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#281A39]">Parent Dashboard</h1>
        </div>

        <Tabs defaultValue={children.length > 0 ? "children" : "link"}>
          <TabsList className="mb-6 flex gap-1 bg-white border p-1 rounded-xl">
            <TabsTrigger value="children" className="text-xs px-3 py-2 flex items-center gap-2">
              <Users size={16} />
              My Children
            </TabsTrigger>
            <TabsTrigger value="link" className="text-xs px-3 py-2 flex items-center gap-2">
              <UserPlus size={16} />
              Link a Child
            </TabsTrigger>
          </TabsList>

          {/* ─── My Children Tab ─── */}
          <TabsContent value="children">
            {childrenLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="animate-spin text-[#281A39]" />
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No children linked yet.</p>
                <Button onClick={() => document.querySelector('[value="link"]')?.click()}>
                  Link a Child
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                        (selectedChildId ?? children[0]?.id) === child.id
                          ? "bg-[#281A39] text-white border-[#281A39]"
                          : "bg-white text-[#281A39] border-gray-200 hover:border-[#281A39]"
                      }`}
                    >
                      {child.name || child.email}
                    </button>
                  ))}
                </div>

                {selectedChild && (
                  <div className="space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <StatCard
                        label="Total Sessions"
                        value={childData?.sessions?.length || 0}
                        icon={Calendar}
                        color="bg-blue-500"
                      />
                      <StatCard
                        label="Upcoming"
                        value={childData?.upcomingSessions?.length || 0}
                        icon={Clock}
                        color="bg-green-500"
                      />
                      <StatCard
                        label="Completed"
                        value={childData?.completedSessions?.length || 0}
                        icon={CheckCircle}
                        color="bg-purple-500"
                      />
                      <StatCard
                        label="Performance"
                        value={childData?.averageRating ? `${childData.averageRating.toFixed(1)}/5` : "N/A"}
                        icon={Star}
                        color="bg-orange-500"
                      />
                    </div>

                    {/* Timetable */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                      <h2 className="font-serif text-lg font-bold text-[#281A39] mb-4">Weekly Schedule</h2>
                      <Timetable targetUserId={selectedChild.id} userName={selectedChild.name || "Child"} />
                    </div>

                    {/* Sessions */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                      <h2 className="font-serif text-lg font-bold text-[#281A39] mb-4">Recent Sessions</h2>
                      {!childData?.sessions || childData.sessions.length === 0 ? (
                        <p className="text-gray-500">No sessions yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {childData.sessions.slice(0, 5).map((session: any) => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-semibold text-[#281A39]">{session.subject || "Tutoring Session"}</p>
                                <p className="text-sm text-gray-500">{session.tutor?.name || "Tutor"}</p>
                              </div>
                              <span className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ─── Link a Child Tab ─── */}
          <TabsContent value="link">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-serif text-xl font-bold text-[#281A39] mb-6">Link Your Child</h2>

                {linkStep === "email" ? (
                  <form onSubmit={handleSendLink} className="space-y-4">
                    <div>
                      <Label htmlFor="childEmail" className="text-[#281A39] font-semibold">
                        Child's Email Address
                      </Label>
                      <Input
                        id="childEmail"
                        type="email"
                        placeholder="student@example.com"
                        value={linkEmail}
                        onChange={(e) => setLinkEmail(e.target.value)}
                        className="mt-2"
                        disabled={sendLinkRequest.isPending}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Enter the email address associated with your child's account
                      </p>
                    </div>

                    {pendingRequests.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Pending Requests</p>
                        <div className="space-y-2">
                          {pendingRequests.map((req: any) => (
                            <p key={req.id} className="text-sm text-blue-700">
                              {req.childEmail}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-[#281A39] hover:bg-[#3a2547] text-white gap-2"
                      disabled={sendLinkRequest.isPending}
                    >
                      {sendLinkRequest.isPending && <Loader className="w-4 h-4 animate-spin" />}
                      Send Confirmation Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmLink} className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        A confirmation code has been sent to <strong>{linkEmail}</strong>
                      </p>
                      <Label htmlFor="confirmCode" className="text-[#281A39] font-semibold">
                        Confirmation Code
                      </Label>
                      <Input
                        id="confirmCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="mt-2 text-center tracking-widest"
                        disabled={confirmLink.isPending}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setLinkStep("email");
                          setConfirmCode("");
                        }}
                        disabled={confirmLink.isPending}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#281A39] hover:bg-[#3a2547] text-white gap-2"
                        disabled={confirmLink.isPending}
                      >
                        {confirmLink.isPending && <Loader className="w-4 h-4 animate-spin" />}
                        Confirm
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default ParentDashboard;
