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
  CheckCircle, Loader2, UserPlus, ShoppingBag, CreditCard,
  Wallet, ArrowUpRight, ArrowDownLeft, PlusCircle,
} from "lucide-react";
import Link from "next/link";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { format } from "date-fns";

function ParentOrdersTab() {
  const { data: orders, isLoading } = trpc.account.myOrders.useQuery();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#281A39]">My Orders</h2>
        <span className="text-xs text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full">{orders?.length ?? 0} orders</span>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : !orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <ShoppingBag size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {orders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <CreditCard size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-[#281A39] text-sm">{o.packageName || o.description || "Order"}</p>
                  <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#281A39]">£{(o.amountTotal / 100).toFixed(2)}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${ o.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700" }`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

function ParentBookingForm({ studentId, onSuccess }: { studentId: number, onSuccess: () => void }) {
  const { data: childData } = trpc.parent.childData.useQuery({ studentId });
  const relationships = childData?.relationships || [];
  const [relId, setRelId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("60");

  const bookSession = trpc.session.createSession.useMutation({
    onSuccess: () => { toast.success("Booking request sent to tutor!"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  if (relationships.length === 0) return <p className="text-sm text-gray-500 italic text-center py-4">No tutors assigned to this student yet. Oak Scholars will assign one soon.</p>;

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
              const rel = relationships.find((r: any) => String(r.id) === e.target.value);
              if (rel) setSubject(rel.subjects.split(',')[0].trim());
            }}
          >
            <option value="">Select tutor...</option>
            {relationships.map((r: any) => (
              <option key={r.id} value={r.id}>{r.tutor?.name} — {r.subjects}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs font-bold uppercase text-gray-400 mb-1.5 block">Date & Time</Label>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
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

export function ParentDashboard() {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [showBooking, setShowBooking] = useState(false);
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

  if (childrenLoading) return <DashboardSkeleton />;
  if (!user || user.role !== "parent") return <div>Access Denied</div>;

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail.trim()) {
      toast.error("Please enter a valid email");
      return;
    }
    sendLinkRequest.mutate({ studentEmail: linkEmail });
  };

  const handleConfirmLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCode.trim()) {
      toast.error("Please enter the confirmation code");
      return;
    }
    confirmLink.mutate({ code: confirmCode });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#281A39]">My Dashboard</h1>
        </div>

        <Tabs defaultValue={children.length > 0 ? "children" : "link"}>
          <TabsList className="mb-6 flex gap-1 bg-white border p-1 rounded-xl">
            <TabsTrigger value="children" className="text-xs px-3 py-2 flex items-center gap-2">
              <Users size={16} />
              My Children
            </TabsTrigger>
            <TabsTrigger value="credits" className="text-xs px-3 py-2 flex items-center gap-2">
              <Wallet size={16} />
              Credits
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs px-3 py-2 flex items-center gap-2">
              <ShoppingBag size={16} />
              Orders
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
                <Loader2 className="animate-spin text-[#281A39]" />
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No children linked yet.</p>
                <Button onClick={() => (document.querySelector('[value="link"]') as HTMLElement)?.click()}>
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
                      <div onClick={() => { const el = document.querySelector('[value="children"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
                        <StatCard
                          label="Total Sessions"
                          value={childData?.sessions?.length || 0}
                          icon={Calendar}
                          color="bg-blue-500"
                        />
                      </div>
                      <div onClick={() => { const el = document.querySelector('[value="children"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
                        <StatCard
                          label="Upcoming"
                          value={childData?.sessions?.filter((s) => new Date(s.scheduledAt) > new Date()).length || 0}
                          icon={Clock}
                          color="bg-green-500"
                        />
                      </div>
                      <div onClick={() => { const el = document.querySelector('[value="children"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
                        <StatCard
                          label="Completed"
                          value={childData?.sessions?.filter((s) => s.status === "completed").length || 0}
                          icon={CheckCircle}
                          color="bg-purple-500"
                        />
                      </div>
                      <div onClick={() => { const el = document.querySelector('[value="children"]'); if (el instanceof HTMLElement) el.click(); }} className="cursor-pointer">
                        <StatCard
                          label="Tutors"
                          value={childData?.tutors?.length || 0}
                          icon={Star}
                          color="bg-orange-500"
                        />
                      </div>
                    </div>

                    {/* Booking Section */}
                    <div className="bg-white rounded-xl border border-[#E8A838]/30 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-[#281A39]">Book a Session</h3>
                          <p className="text-xs text-gray-500">Schedule a lesson for {selectedChild.name || "your child"}</p>
                        </div>
                        <Button onClick={() => setShowBooking(!showBooking)} variant="outline" size="sm">
                          {showBooking ? "Cancel" : "+ Book Session"}
                        </Button>
                      </div>
                      
                      {showBooking && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <ParentBookingForm 
                            studentId={selectedChild.id} 
                            onSuccess={() => { setShowBooking(false); }} 
                          />
                        </div>
                      )}
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
                          {childData.sessions.slice(0, 5).map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-semibold text-[#281A39]">{session.subject || "Tutoring Session"}</p>
                                <p className="text-sm text-gray-500">{session.subject}</p>
                              </div>
                              <span className="text-sm text-gray-500">{format(new Date(session.scheduledAt), "PPP")}</span>
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

          {/* ─── Credits Tab ─── */}
          <TabsContent value="credits">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar for Child Selection */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-xs font-semibold text-[#281A39] uppercase tracking-wider px-2 mb-2">Select Student</h3>
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      (selectedChildId ?? children[0]?.id) === child.id 
                        ? "bg-[#281A39] border-[#281A39] text-white shadow-lg" 
                        : "bg-white border-gray-100 text-[#281A39] hover:border-amber/30"
                    }`}
                  >
                    <p className="font-bold">{child.name || child.email}</p>
                    <CreditBalanceView userId={child.id} compact />
                  </button>
                ))}
              </div>

              {/* Credits Detail */}
              <div className="lg:col-span-3">
                {effectiveChildId ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                          <Wallet size={32} className="text-[#E8A838]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Available Credits</p>
                          <CreditBalanceView userId={effectiveChildId} />
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
                      <CreditHistoryList userId={effectiveChildId} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <Wallet size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">Select a student to view their credit history</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ─── Orders Tab ─── */}
          <TabsContent value="orders">
            <ParentOrdersTab />
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
                          {pendingRequests.map((req) => (
                            <p key={req.id} className="text-sm text-blue-700">
                              {req.parent?.name || req.parent?.email || `Request #${req.id}`}
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
                      {sendLinkRequest.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
                        {confirmLink.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
