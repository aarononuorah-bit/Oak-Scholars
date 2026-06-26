import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Calendar, Mail, GraduationCap, Megaphone, Bell, Users, Trash2,
  ToggleLeft, ToggleRight, Send, Plus, LayoutDashboard, ShoppingCart,
  FileText, TrendingUp, Activity, Download, Shield, UserCheck,
  CheckCircle, CreditCard, MessageSquare, UserPlus, RefreshCw,
  ChevronDown, ChevronUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-amber-100 text-amber-800",
    contacted: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    read: "bg-gray-100 text-gray-700",
    replied: "bg-green-100 text-green-700",
    reviewing: "bg-yellow-100 text-yellow-700",
    interview: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    refunded: "bg-blue-100 text-blue-700",
    user: "bg-gray-100 text-gray-700",
    admin: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, accent, highlight,
}: {
  label: string; value: number | string; sub?: string; icon: React.ElementType; accent?: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${highlight ? "border-amber shadow-sm" : "border-gray-100"}`}>
      <div className="rounded-lg p-2.5 shrink-0" style={{ backgroundColor: accent ? `${accent}18` : "#E8A83818" }}>
        <Icon size={18} style={{ color: accent || "#E8A838" }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-brand font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-navy-deep mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-brand mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Activity icon map ────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    booking: { icon: Calendar, color: "#E8A838", bg: "#E8A83818" },
    message: { icon: MessageSquare, color: "#6366f1", bg: "#6366f118" },
    application: { icon: GraduationCap, color: "#10b981", bg: "#10b98118" },
    order: { icon: CreditCard, color: "#3b82f6", bg: "#3b82f618" },
    user: { icon: UserPlus, color: "#8b5cf6", bg: "#8b5cf618" },
  };
  const m = map[type] || { icon: Activity, color: "#6b7280", bg: "#6b728018" };
  const Icon = m.icon;
  return (
    <div className="rounded-lg p-2 shrink-0" style={{ backgroundColor: m.bg }}>
      <Icon size={14} style={{ color: m.color }} />
    </div>
  );
}

function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data, isLoading, refetch } = trpc.admin.overview.useQuery(undefined, { refetchInterval: 60000 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-muted-brand text-sm">Unable to load overview data.</p>;

  const { stats, recentActivity } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-navy-deep">Platform Overview</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-1.5 text-xs h-8">
          <RefreshCw size={12} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 bg-gradient-to-br from-[#281A39] to-[#3d2560] rounded-xl p-5 text-white flex items-center gap-4">
          <div className="rounded-lg p-3 bg-white/10">
            <TrendingUp size={22} className="text-amber-300" />
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Total Revenue (Paid)</p>
            <p className="text-3xl font-bold mt-0.5">£{(stats.totalRevenue / 100).toFixed(2)}</p>
            <p className="text-xs text-white/60 mt-1">£{(stats.recentRevenue / 100).toFixed(2)} last 30 days · {stats.paidOrders} paid orders</p>
          </div>
        </div>
        <StatCard label="Registered Users" value={stats.totalUsers} sub={`+${stats.recentUsers} this month`} icon={Users} accent="#8b5cf6" />
        <StatCard label="Push Subscribers" value={stats.pushSubscribers} sub="Active notification subs" icon={Bell} accent="#f59e0b" />
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-brand uppercase tracking-widest mb-3">Submissions & Enquiries</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Bookings" value={stats.totalBookings} sub={`${stats.newBookings} new · ${stats.recentBookings} this month`} icon={Calendar} highlight={stats.newBookings > 0} />
          <StatCard label="Contact Messages" value={stats.totalMessages} sub={`${stats.unreadMessages} unread · ${stats.recentMessages} this month`} icon={Mail} accent="#6366f1" highlight={stats.unreadMessages > 0} />
          <StatCard label="Tutor Applications" value={stats.totalApplications} sub={`${stats.newApplications} new · ${stats.recentApplications} this month`} icon={GraduationCap} accent="#10b981" highlight={stats.newApplications > 0} />
          <StatCard label="CV Uploads" value={stats.cvUploads} sub={`${stats.acceptedTutors} tutors accepted`} icon={FileText} accent="#f97316" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-brand uppercase tracking-widest mb-3">Orders & Accounts</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats.totalOrders} sub={`${stats.paidOrders} paid · ${stats.recentOrders} this month`} icon={ShoppingCart} accent="#3b82f6" />
          <StatCard label="Paid Orders" value={stats.paidOrders} sub={`${stats.totalOrders - stats.paidOrders} pending/other`} icon={CheckCircle} accent="#10b981" />
          <StatCard label="Total Accounts" value={stats.totalUsers} sub={`${stats.adminUsers} admin · ${stats.totalUsers - stats.adminUsers} users`} icon={UserCheck} accent="#8b5cf6" />
          <StatCard label="New Accounts (30d)" value={stats.recentUsers} sub="Registered this month" icon={UserPlus} accent="#ec4899" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-brand uppercase tracking-widest mb-3">Recent Activity (Last 7 Days)</p>
        {recentActivity.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <Activity size={24} className="mx-auto text-muted-brand mb-2" />
            <p className="text-muted-brand text-sm">No activity in the last 7 days.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <ActivityIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-deep truncate">{item.label}</p>
                  <p className="text-xs text-muted-brand truncate">{item.detail}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.status && <StatusBadge status={item.status} />}
                  <span className="text-xs text-muted-brand whitespace-nowrap">{timeAgo(item.date as unknown as Date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const { data: bookings = [], refetch } = trpc.booking.list.useQuery(undefined, { refetchInterval: 60000 });
  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-serif text-xl font-bold text-navy-deep">Bookings ({bookings.length})</h2>
        <div className="flex gap-1 flex-wrap">
          {["all", "new", "contacted", "confirmed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filter === s ? "bg-navy text-white border-navy" : "border-gray-200 text-muted-brand hover:border-gray-300"}`}
            >
              {s === "all" ? `All (${bookings.length})` : `${s} (${bookings.filter((b) => b.status === s).length})`}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-brand text-sm">No bookings found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div 
              key={b.id} 
              className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:border-amber/50 transition-colors"
              onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-navy-deep">{b.firstName} {b.lastName}</p>
                  <p className="text-sm text-navy-deep mt-1">
                    <span className="font-medium">{b.subject}</span> · {b.level} · {b.sessionType}
                  </p>
                  <p className="text-xs text-muted-brand mt-0.5">Preferred: {b.preferredTime}</p>
                  <p className="text-xs text-muted-brand mt-1">
                    {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={b.status} />
                  <Select value={b.status} onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v as "new" | "contacted" | "confirmed" | "cancelled" })}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <a href={`mailto:${b.email}?subject=Your Oak Scholars Booking - ${b.subject}&body=Hi ${b.firstName},%0D%0A%0D%0AWe are reaching out regarding your booking for ${b.subject} (${b.level}).`}>
                    <Button size="sm" className="h-8 text-xs bg-[#281A39] text-white hover:bg-[#160D22]">
                      <Mail size={12} className="mr-1" /> Email Student
                    </Button>
                  </a>
                  {expandedId === b.id ? <ChevronUp size={16} className="text-gray-400 ml-2" /> : <ChevronDown size={16} className="text-gray-400 ml-2" />}
                </div>
              </div>

              {expandedId === b.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in cursor-default" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <p className="text-xs font-semibold text-muted-brand uppercase mb-2">Contact Info</p>
                    <p className="text-sm text-navy-deep"><span className="text-gray-500 w-16 inline-block">Email:</span> {b.email}</p>
                    <p className="text-sm text-navy-deep"><span className="text-gray-500 w-16 inline-block">Phone:</span> {b.phone || "N/A"}</p>
                    <p className="text-sm text-navy-deep"><span className="text-gray-500 w-16 inline-block">Prefers:</span> <span className="capitalize">{b.preferredContactMethod}</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-brand uppercase mb-2">Details & Payment Reference</p>
                    <p className="text-sm text-navy-deep line-clamp-2"><span className="text-gray-500">Message:</span> {b.message || "None"}</p>
                    <p className="text-sm text-navy-deep mt-1"><span className="text-gray-500">Opt-in:</span> {b.marketingOptIn ? "Yes" : "No"}</p>
                    <p className="text-sm text-navy-deep"><span className="text-gray-500">Stripe ID:</span> {(b as any).stripeSessionId ? `${(b as any).stripeSessionId.slice(0,25)}...` : "Awaiting sync / Check Orders tab"}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Contact Tab ──────────────────────────────────────────────────────────────
function ContactTab() {
  const { data: messages = [], refetch } = trpc.contact.list.useQuery(undefined, { refetchInterval: 60000 });
  const updateStatus = trpc.contact.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-serif text-xl font-bold text-navy-deep">Messages ({messages.length})</h2>
        <div className="flex gap-1 flex-wrap">
          {["all", "new", "read", "replied"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filter === s ? "bg-navy text-white border-navy" : "border-gray-200 text-muted-brand hover:border-gray-300"}`}
            >
              {s === "all" ? `All (${messages.length})` : `${s} (${messages.filter((m) => m.status === s).length})`}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-brand text-sm">No messages found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <p className="font-semibold text-navy-deep">{m.name}</p>
                  <p className="text-sm text-muted-brand">{m.email}</p>
                  <p className="text-sm font-medium text-navy-deep mt-1">{m.subject}</p>
                  <p className="text-sm text-muted-brand mt-1 leading-relaxed">{m.message}</p>
                  <p className="text-xs text-muted-brand mt-1">
                    {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={m.status} />
                  <Select value={m.status} onValueChange={(v) => updateStatus.mutate({ id: m.id, status: v as "new" | "read" | "replied" })}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                    </SelectContent>
                  </Select>
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Mail size={12} className="mr-1" />Reply
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tutor Applications Tab ───────────────────────────────────────────────────
function TutorApplicationsTab() {
  const { data: applications = [], refetch } = trpc.tutor.list.useQuery(undefined, { refetchInterval: 60000 });
  const updateStatus = trpc.tutor.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);
  const cvCount = applications.filter((a) => a.cvFileUrl).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-deep">Tutor Applications ({applications.length})</h2>
          <p className="text-xs text-muted-brand mt-0.5">{cvCount} CV upload{cvCount !== 1 ? "s" : ""} attached</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", "new", "reviewing", "interview", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filter === s ? "bg-navy text-white border-navy" : "border-gray-200 text-muted-brand hover:border-gray-300"}`}
            >
              {s === "all" ? `All (${applications.length})` : `${s} (${applications.filter((a) => a.status === s).length})`}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-brand text-sm mt-4">No applications found.</p>
      ) : (
        <div className="space-y-3 mt-4">
          {filtered.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy-deep">{a.firstName} {a.lastName}</p>
                    {a.cvFileUrl && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                        <FileText size={10} />CV
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-brand">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                  <p className="text-sm text-navy-deep mt-1">
                    <span className="font-medium">{a.university}</span> · {a.degreeSubject} · {a.yearOfStudy}
                  </p>
                  <p className="text-xs text-muted-brand mt-0.5">Subjects: {a.subjects}</p>
                  <p className="text-xs text-muted-brand">Levels: {a.levels}</p>
                  {a.experience && <p className="text-xs text-muted-brand mt-1 line-clamp-2 italic">"{a.experience}"</p>}
                  {a.coverLetter && <p className="text-xs text-muted-brand mt-1 line-clamp-2">Cover: {a.coverLetter}</p>}
                  <p className="text-xs text-muted-brand mt-1">
                    {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={a.status} />
                  {a.cvFileUrl && (
                    <a href={a.cvFileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-8 text-xs"><Download size={12} className="mr-1" />CV</Button>
                    </a>
                  )}
                  
                  {a.status === "new" || a.status === "reviewing" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: a.id, status: "accepted" })} className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle size={12} className="mr-1" />Accept
                      </Button>
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })} className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 size={12} className="mr-1" />Reject
                      </Button>
                    </div>
                  ) : (
                    <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v as "new" | "reviewing" | "interview" | "accepted" | "rejected" })}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <a href={`mailto:${a.email}?subject=Your Oak Scholars Application`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs"><Mail size={12} className="mr-1" />Email</Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const { data: orders = [], isLoading } = trpc.admin.orders.useQuery(undefined, { refetchInterval: 60000 });
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalRevenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amountTotal, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-deep">Orders & Payments ({orders.length})</h2>
          <p className="text-xs text-muted-brand mt-0.5">
            Total revenue: <span className="font-semibold text-navy-deep">£
