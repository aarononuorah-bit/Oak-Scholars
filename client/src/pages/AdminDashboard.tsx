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
  Calendar,
  Mail,
  GraduationCap,
  Megaphone,
  Bell,
  Users,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Send,
  Plus,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  TrendingUp,
  Activity,
  Download,
  Shield,
  UserCheck,
  CheckCircle,
  CreditCard,
  MessageSquare,
  UserPlus,
  RefreshCw,
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
  label,
  value,
  sub,
  icon: Icon,
  accent,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${highlight ? "border-amber shadow-sm" : "border-gray-100"}`}>
      <div
        className="rounded-lg p-2.5 shrink-0"
        style={{ backgroundColor: accent ? `${accent}18` : "#E8A83818" }}
      >
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
  const { data, isLoading, refetch } = trpc.admin.overview.useQuery();

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

  if (!data) {
    return <p className="text-muted-brand text-sm">Unable to load overview data.</p>;
  }

  const { stats, recentActivity } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-navy-deep">Platform Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs h-8"
        >
          <RefreshCw size={12} />
          Refresh
        </Button>
      </div>

      {/* Revenue hero + key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 bg-gradient-to-br from-[#281A39] to-[#3d2560] rounded-xl p-5 text-white flex items-center gap-4">
          <div className="rounded-lg p-3 bg-white/10">
            <TrendingUp size={22} className="text-amber-300" />
          </div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Total Revenue (Paid)</p>
            <p className="text-3xl font-bold mt-0.5">£{(stats.totalRevenue / 100).toFixed(2)}</p>
            <p className="text-xs text-white/60 mt-1">
              £{(stats.recentRevenue / 100).toFixed(2)} last 30 days · {stats.paidOrders} paid orders
            </p>
          </div>
        </div>
        <StatCard
          label="Registered Users"
          value={stats.totalUsers}
          sub={`+${stats.recentUsers} this month`}
          icon={Users}
          accent="#8b5cf6"
        />
        <StatCard
          label="Push Subscribers"
          value={stats.pushSubscribers}
          sub="Active notification subs"
          icon={Bell}
          accent="#f59e0b"
        />
      </div>

      {/* Submissions grid */}
      <div>
        <p className="text-xs font-semibold text-muted-brand uppercase tracking-widest mb-3">Submissions & Enquiries</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Bookings"
            value={stats.totalBookings}
            sub={`${stats.newBookings} new · ${stats.recentBookings} this month`}
            icon={Calendar}
            highlight={stats.newBookings > 0}
          />
          <StatCard
            label="Contact Messages"
            value={stats.totalMessages}
            sub={`${stats.unreadMessages} unread · ${stats.recentMessages} this month`}
            icon={Mail}
            accent="#6366f1"
            highlight={stats.unreadMessages > 0}
          />
          <StatCard
            label="Tutor Applications"
            value={stats.totalApplications}
            sub={`${stats.newApplications} new · ${stats.recentApplications} this month`}
            icon={GraduationCap}
            accent="#10b981"
            highlight={stats.newApplications > 0}
          />
          <StatCard
            label="CV Uploads"
            value={stats.cvUploads}
            sub={`${stats.acceptedTutors} tutors accepted`}
            icon={FileText}
            accent="#f97316"
          />
        </div>
      </div>

      {/* Orders & accounts grid */}
      <div>
        <p className="text-xs font-semibold text-muted-brand uppercase tracking-widest mb-3">Orders & Accounts</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            sub={`${stats.paidOrders} paid · ${stats.recentOrders} this month`}
            icon={ShoppingCart}
            accent="#3b82f6"
          />
          <StatCard
            label="Paid Orders"
            value={stats.paidOrders}
            sub={`${stats.totalOrders - stats.paidOrders} pending/other`}
            icon={CheckCircle}
            accent="#10b981"
          />
          <StatCard
            label="Total Accounts"
            value={stats.totalUsers}
            sub={`${stats.adminUsers} admin · ${stats.totalUsers - stats.adminUsers} users`}
            icon={UserCheck}
            accent="#8b5cf6"
          />
          <StatCard
            label="New Accounts (30d)"
            value={stats.recentUsers}
            sub="Registered this month"
            icon={UserPlus}
            accent="#ec4899"
          />
        </div>
      </div>

      {/* Recent activity feed */}
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
                  <span className="text-xs text-muted-brand whitespace-nowrap">
                    {timeAgo(item.date as unknown as Date)}
                  </span>
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
  const { data: bookings = [], refetch } = trpc.booking.list.useQuery();
  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const [filter, setFilter] = useState<string>("all");
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
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-navy-deep">{b.firstName} {b.lastName}</p>
                  <p className="text-sm text-muted-brand">{b.email}{b.phone ? ` · ${b.phone}` : ""}</p>
                  <p className="text-sm text-navy-deep mt-1">
                    <span className="font-medium">{b.subject}</span> · {b.level} · {b.sessionType}
                  </p>
                  <p className="text-xs text-muted-brand mt-0.5">Preferred: {b.preferredTime}</p>
                  {b.message && <p className="text-xs text-muted-brand mt-1 italic">"{b.message}"</p>}
                  <p className="text-xs text-muted-brand mt-1">
                    {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={b.status} />
                  <Select
                    value={b.status}
                    onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v as "new" | "contacted" | "confirmed" | "cancelled" })}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <a href={`mailto:${b.email}?subject=Your Oak Scholars Booking`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Mail size={12} className="mr-1" />Email
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

// ─── Contact Tab ──────────────────────────────────────────────────────────────
function ContactTab() {
  const { data: messages = [], refetch } = trpc.contact.list.useQuery();
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
                  <Select
                    value={m.status}
                    onValueChange={(v) => updateStatus.mutate({ id: m.id, status: v as "new" | "read" | "replied" })}
                  >
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
  const { data: applications = [], refetch } = trpc.tutor.list.useQuery();
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
          <p className="text-xs text-muted-brand mt-0.5">
            {cvCount} CV upload{cvCount !== 1 ? "s" : ""} attached
          </p>
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
                  {a.experience && (
                    <p className="text-xs text-muted-brand mt-1 line-clamp-2 italic">"{a.experience}"</p>
                  )}
                  {a.coverLetter && (
                    <p className="text-xs text-muted-brand mt-1 line-clamp-2">Cover: {a.coverLetter}</p>
                  )}
                  <p className="text-xs text-muted-brand mt-1">
                    {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={a.status} />
                  {a.cvFileUrl && (
                    <a href={a.cvFileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Download size={12} className="mr-1" />CV
                      </Button>
                    </a>
                  )}
                  <Select
                    value={a.status}
                    onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v as "new" | "reviewing" | "interview" | "accepted" | "rejected" })}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <a href={`mailto:${a.email}?subject=Your Oak Scholars Application`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Mail size={12} className="mr-1" />Email
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

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const { data: orders = [], isLoading } = trpc.admin.orders.useQuery();
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalRevenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amountTotal, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-deep">Orders & Payments ({orders.length})</h2>
          <p className="text-xs text-muted-brand mt-0.5">
            Total revenue: <span className="font-semibold text-navy-deep">£{(totalRevenue / 100).toFixed(2)}</span>
          </p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", "paid", "pending", "cancelled", "refunded"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filter === s ? "bg-navy text-white border-navy" : "border-gray-200 text-muted-brand hover:border-gray-300"}`}
            >
              {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-brand text-sm mt-4">No orders found.</p>
      ) : (
        <div className="space-y-3 mt-4">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy-deep">{o.packageName}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm text-muted-brand mt-0.5">{o.email}</p>
                  {(o.subject || o.level) && (
                    <p className="text-xs text-muted-brand mt-0.5">
                      {[o.subject, o.level].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-brand mt-1 font-mono">
                    {o.stripeSessionId.slice(0, 28)}…
                  </p>
                  <p className="text-xs text-muted-brand mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-navy-deep">
                    £{(o.amountTotal / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-brand uppercase">{o.currency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: users = [], isLoading, refetch } = trpc.admin.users.useQuery();
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = users
    .filter((u) => filter === "all" || u.role === filter)
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (u.name?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.loginMethod?.toLowerCase().includes(q))
      );
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-deep">Accounts ({users.length})</h2>
          <p className="text-xs text-muted-brand mt-0.5">
            {users.filter((u) => u.role === "admin").length} admin · {users.filter((u) => u.role === "tutor").length} tutors · {users.filter((u) => u.role === "user").length} students · {users.filter((u) => u.role === "parent").length} parents
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs w-48"
          />
          {["all", "user", "tutor", "parent", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filter === r ? "bg-navy text-white border-navy" : "border-gray-200 text-muted-brand hover:border-gray-300"}`}
            >
              {r === "all" ? `All (${users.length})` : r === "user" ? `Students (${users.filter((u) => u.role === r).length})` : `${r === "tutor" ? "Tutors" : "Parents"} (${users.filter((u) => u.role === r).length})`}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-brand text-sm">No accounts found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-muted-brand uppercase tracking-wide">
            <span>Name</span>
            <span>Email</span>
            <span>Login Method</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Last Sign-in</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-navy/10 flex items-center justify-center text-xs font-bold text-navy-deep shrink-0">
                    {(u.name || u.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-navy-deep truncate">
                    {u.name || <span className="text-muted-brand italic font-normal">No name</span>}
                  </span>
                </div>
                <span className="text-sm text-muted-brand truncate">{u.email || <span className="italic">No email</span>}</span>
                <span className="text-xs text-muted-brand capitalize">{u.loginMethod || "—"}</span>
                <div>
                  <Select
                    value={u.role}
                    onValueChange={(v) => updateRole.mutate({ id: u.id, role: v as "user" | "admin" | "tutor" | "parent" })}
                  >
                    <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Student</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-xs text-muted-brand">
                  {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
                <span className="text-xs text-muted-brand">
                  {new Date(u.lastSignedIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Banners Tab ──────────────────────────────────────────────────────────────
function BannersTab() {
  const { data: banners = [], refetch } = trpc.banners.list.useQuery();
  const createBannerMutation = trpc.banners.create.useMutation({
    onSuccess: () => {
      toast.success("Banner created");
      refetch();
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const setActive = trpc.banners.setActive.useMutation({
    onSuccess: () => { toast.success("Banner updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteBannerMutation = trpc.banners.delete.useMutation({
    onSuccess: () => { toast.success("Banner deleted"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    message: "",
    type: "info" as "info" | "success" | "warning" | "promo",
    linkText: "",
    linkUrl: "",
    isActive: false,
  });
  const resetForm = () => setForm({ message: "", type: "info", linkText: "", linkUrl: "", isActive: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-navy-deep">Announcement Banners ({banners.length})</h2>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          style={{ backgroundColor: "#E8A838", color: "#281A39" }}
          className="flex items-center gap-1.5 text-xs h-8"
        >
          <Plus size={12} />New Banner
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-amber/30 p-5 mb-5">
          <h3 className="font-semibold text-navy-deep mb-4 text-sm">Create Banner</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-navy-deep mb-1 block">Message *</Label>
              <Input
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="🎉 First session 50% off this week!"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-navy-deep mb-1 block">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as typeof form.type }))}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="accent-amber"
                />
                <label htmlFor="isActive" className="text-xs text-navy-deep">Set as active</label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-navy-deep mb-1 block">CTA Text (optional)</Label>
                <Input
                  value={form.linkText}
                  onChange={(e) => setForm((f) => ({ ...f, linkText: e.target.value }))}
                  placeholder="Book now"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-navy-deep mb-1 block">CTA URL (optional)</Label>
                <Input
                  value={form.linkUrl}
                  onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="/booking"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => createBannerMutation.mutate(form)}
                disabled={!form.message || createBannerMutation.isPending}
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                {createBannerMutation.isPending ? "Creating…" : "Create"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {banners.length === 0 ? (
        <p className="text-muted-brand text-sm">No banners yet.</p>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 flex-wrap ${b.isActive === 1 ? "border-amber" : "border-gray-100"}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${b.type === "promo" ? "bg-purple-100 text-purple-700" : b.type === "warning" ? "bg-yellow-100 text-yellow-700" : b.type === "success" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
                    {b.type}
                  </span>
                  {b.isActive === 1 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                  )}
                </div>
                <p className="text-sm text-navy-deep">{b.message}</p>
                {b.linkText && (
                  <p className="text-xs text-muted-brand mt-0.5">CTA: {b.linkText} → {b.linkUrl}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setActive.mutate({ id: b.id, isActive: b.isActive !== 1 })}
                >
                  {b.isActive === 1
                    ? <><ToggleRight size={14} className="mr-1 text-green-600" />Deactivate</>
                    : <><ToggleLeft size={14} className="mr-1" />Activate</>
                  }
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-red-500 hover:bg-red-50"
                  onClick={() => deleteBannerMutation.mutate({ id: b.id })}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tutoring Relationships Tab ──────────────────────────────────────────────
function TutoringRelationshipsTab() {
  const { data: relationships = [], isLoading, refetch } = trpc.admin.tutoringRelationships.useQuery();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const removeTutorRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Tutor role removed"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = relationships
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (r.tutor?.name?.toLowerCase().includes(q)) ||
        (r.tutor?.email?.toLowerCase().includes(q)) ||
        (r.student?.name?.toLowerCase().includes(q)) ||
        (r.student?.email?.toLowerCase().includes(q))
      );
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-deep">Tutoring Pairs ({relationships.length})</h2>
          <p className="text-xs text-muted-brand mt-0.5">
            {relationships.filter((r) => r.status === "active").length} active · {relationships.filter((r) => r.status === "paused").length} paused · {relationships.filter((r) => r.status === "completed").length} completed
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Search by tutor or student name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs w-56"
          />
          {["all", "active", "paused", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${filter === s ? "bg-navy text-white border-navy" : "border-gray-200 text-muted-brand hover:border-gray-300"}`}
            >
              {s === "all" ? `All (${relationships.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${relationships.filter((r) => r.status === s).length})`}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-brand text-sm">No tutoring pairs found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-muted-brand uppercase tracking-wide">
            <span>Tutor</span>
            <span>Student</span>
            <span>Subject & Level</span>
            <span>Status</span>
            <span>Started</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                    {(r.tutor?.name || r.tutor?.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-deep block">
                      {r.tutor?.name || <span className="text-muted-brand italic font-normal">No name</span>}
                    </span>
                    <span className="text-xs text-muted-brand">{r.tutor?.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600 shrink-0">
                    {(r.student?.name || r.student?.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-deep block">
                      {r.student?.name || <span className="text-muted-brand italic font-normal">No name</span>}
                    </span>
                    <span className="text-xs text-muted-brand">{r.student?.email}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-brand">
                  {r.subjects} • {r.level}
                </span>
                <StatusBadge status={r.status} />
                <span className="text-xs text-muted-brand">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      if (confirm(`Remove tutor role from ${r.tutor?.name}? They will become a regular student.`)) {
                        removeTutorRole.mutate({ id: r.tutor!.id, role: "user" });
                      }
                    }}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Remove Tutor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Assign Tutor Tab ────────────────────────────────────────────────────────
function AssignTutorTab() {
  const { data: tutors = [], isLoading: tutorsLoading } = trpc.admin.tutors.useQuery();
  const { data: students = [], isLoading: studentsLoading } = trpc.admin.students.useQuery();
  const { data: relationships = [], refetch } = trpc.admin.tutoringRelationships.useQuery();
  const [tutorId, setTutorId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subjects, setSubjects] = useState("");
  const [level, setLevel] = useState("");

  const assignMutation = trpc.admin.assignTutor.useMutation({
    onSuccess: () => {
      toast.success("Tutor assigned successfully!");
      setTutorId(""); setStudentId(""); setSubjects(""); setLevel("");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId || !studentId || !subjects || !level) {
      toast.error("Please fill in all fields");
      return;
    }
    assignMutation.mutate({ tutorId: Number(tutorId), studentId: Number(studentId), subjects, level });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-serif text-xl font-bold text-navy-deep mb-1">Assign Tutor to Student</h2>
        <p className="text-xs text-muted-brand mb-5">Create a new tutoring relationship. One tutor can be assigned to multiple students and vice versa.</p>
        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-deep">Tutor</Label>
            <Select value={tutorId} onValueChange={setTutorId}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={tutorsLoading ? "Loading..." : "Select a tutor"} /></SelectTrigger>
              <SelectContent>
                {tutors.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name || t.email} {t.email ? `(${t.email})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-deep">Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={studentsLoading ? "Loading..." : "Select a student"} /></SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name || s.email} {s.email ? `(${s.email})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-deep">Subject(s)</Label>
            <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Maths, Physics" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-navy-deep">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                {["GCSE", "A-Level", "University", "Primary", "Secondary", "Other"].map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={assignMutation.isPending} className="bg-navy text-white hover:bg-navy/90">
              {assignMutation.isPending ? "Assigning..." : "Assign Tutor"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-serif text-lg font-bold text-navy-deep mb-1">Current Tutoring Pairs</h2>
        <p className="text-xs text-muted-brand mb-4">Recent assignments. Manage all pairs in the Tutoring Pairs tab.</p>
        <div className="divide-y divide-gray-50">
          {relationships.length === 0 ? (
            <p className="text-sm text-muted-brand py-2">No tutoring relationships yet.</p>
          ) : relationships.slice(0, 8).map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm font-semibold text-navy-deep">{r.tutor?.name || r.tutor?.email}</span>
                <span className="text-xs text-muted-brand ml-2">&#8594; {r.student?.name || r.student?.email}</span>
                <span className="text-xs text-muted-brand ml-2">({r.subjects} &middot; {r.level})</span>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Push Tab ─────────────────────────────────────────────────────────────────
function PushTab() {
  const { data: countData } = trpc.push.subscriberCount.useQuery();
  const sendPush = trpc.push.send.useMutation({
    onSuccess: (data) => {
      toast.success(`Sent to ${data.sent} subscribers (${data.failed} failed)`);
      setForm({ title: "", body: "", url: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const [form, setForm] = useState({ title: "", body: "", url: "" });

  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-navy-deep mb-2">Push Notifications</h2>
      <p className="text-muted-brand text-sm mb-6">
        {countData?.count ?? 0} active subscriber{countData?.count !== 1 ? "s" : ""}
      </p>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg">
        <h3 className="font-semibold text-navy-deep mb-4">Send Broadcast</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-navy-deep mb-1 block">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="New session slots available!"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-navy-deep mb-1 block">Message *</Label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="We've just opened up new slots for this week…"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-navy-deep mb-1 block">Link URL (optional)</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="/booking"
            />
          </div>
          <Button
            onClick={() => sendPush.mutate(form)}
            disabled={!form.title || !form.body || sendPush.isPending}
            className="btn-press flex items-center gap-2"
            style={{ backgroundColor: "#E8A838", color: "#281A39" }}
          >
            <Send size={14} />
            {sendPush.isPending ? "Sending…" : `Send to ${countData?.count ?? 0} subscribers`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-muted-brand">Loading…</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container py-32 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-red-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Access Denied</h1>
          <p className="text-muted-brand mb-6">This page is restricted to Oak Scholars administrators.</p>
          <Link href="/">
            <Button style={{ backgroundColor: "#E8A838", color: "#281A39" }}>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { value: "overview", label: "Overview", icon: LayoutDashboard },
    { value: "bookings", label: "Bookings", icon: Calendar },
    { value: "contact", label: "Messages", icon: Mail },
    { value: "tutors", label: "Applications", icon: GraduationCap },
    { value: "tutoring", label: "Tutoring Pairs", icon: Users },
    { value: "orders", label: "Orders", icon: ShoppingCart },
    { value: "users", label: "Users", icon: Users },
    { value: "banners", label: "Banners", icon: Megaphone },
    { value: "assign", label: "Assign Tutor", icon: UserCheck },
    { value: "push", label: "Push", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber text-sm font-semibold tracking-widest uppercase">Admin</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
              <Shield size={10} />Restricted
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy-deep">Dashboard</h1>
          <p className="text-muted-brand text-sm mt-1">Welcome back, {user.name || "Admin"}</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-3 py-2"
              >
                <t.icon size={14} />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="contact"><ContactTab /></TabsContent>
          <TabsContent value="tutors"><TutorApplicationsTab /></TabsContent>
          <TabsContent value="tutoring"><TutoringRelationshipsTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="banners"><BannersTab /></TabsContent>
          <TabsContent value="assign"><AssignTutorTab /></TabsContent>
          <TabsContent value="push"><PushTab /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
