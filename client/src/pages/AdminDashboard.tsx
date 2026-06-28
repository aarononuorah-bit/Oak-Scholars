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
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── User Profile Modal ──────────────────────────────
function UserProfileModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data: profile, isLoading } = trpc.admin.getUserProfile.useQuery({ id: userId });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-bold text-navy-deep">User Profile</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !profile ? (
            <p className="text-muted-brand">Profile not found.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center text-2xl font-bold text-navy-deep">
                  {(profile.name || profile.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy-deep text-lg">{profile.name || "No name"}</p>
                  <p className="text-sm text-muted-brand">{profile.email}</p>
                  <Badge variant="outline" className="mt-1 capitalize">{profile.role}</Badge>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold text-navy-deep mb-3">Weekly Schedule</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <Timetable targetUserId={profile.id} userName={profile.name || "User"} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, colour }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; colour: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
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

// ─── Overview Tab ────────────────────────────────────
function OverviewTab() {
  const utils = trpc.useUtils();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, isLoading } = trpc.admin.overview.useQuery();

  // Auto-refresh every 60 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      utils.admin.overview.invalidate();
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, utils]);

  const activityIcon: Record<string, React.ElementType> = {
    booking: Calendar,
    message: Mail,
    application: GraduationCap,
    order: CreditCard,
    user: UserPlus,
  };

  const activityColour: Record<string, string> = {
    booking: "text-blue-600 bg-blue-50",
    message: "text-purple-600 bg-purple-50",
    application: "text-green-600 bg-green-50",
    order: "text-amber-600 bg-amber-50",
    user: "text-pink-600 bg-pink-50",
  };

  const statusColour: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    reviewing: "bg-purple-100 text-purple-700",
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
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-navy-deep">Auto-refresh every 60 seconds</span>
          </label>
        </div>
        <button
          onClick={() => utils.admin.overview.invalidate()}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors duration-200 flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Refresh Now
        </button>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-lg font-bold text-navy-deep mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Total Bookings" value={stats.totalBookings} sub={`${stats.newBookings} new`} colour="bg-blue-500" />
          <StatCard icon={ShoppingCart} label="Paid Orders" value={stats.paidOrders} sub={`£${(stats.recentRevenue / 100).toFixed(0)} last 30d`} colour="bg-amber-500" />
          <StatCard icon={GraduationCap} label="Tutor Applications" value={stats.totalApplications} sub={`${stats.acceptedTutors} accepted`} colour="bg-green-500" />
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub={`${stats.recentUsers} last 30d`} colour="bg-purple-500" />
          <StatCard icon={MessageSquare} label="Messages" value={stats.totalMessages} sub={`${stats.unreadMessages} unread`} colour="bg-pink-500" />
          <StatCard icon={CreditCard} label="Total Revenue" value={`£${(stats.totalRevenue / 100).toFixed(2)}`} sub={`${stats.totalOrders} orders`} colour="bg-teal-500" />
          <StatCard icon={UserCheck} label="Active Tutors" value={stats.acceptedTutors} sub={`${stats.cvUploads} CVs uploaded`} colour="bg-indigo-500" />
          <StatCard icon={TrendingUp} label="New Bookings (30d)" value={stats.recentBookings} sub={`${stats.recentOrders} orders`} colour="bg-orange-500" />
        </div>
      </div>

      {/* Recent activity */}
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
              const statusClass = item.status ? (statusColour[item.status] || "bg-gray-100 text-gray-600") : "";
              return (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className={`p-2 rounded-lg shrink-0 ${colourClass}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-deep text-sm truncate">{item.label}</p>
                    <p className="text-xs text-muted-brand truncate">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusClass}`}>
                        {item.status}
                      </span>
                    )}
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

// ─── Users Tab ───────────────────────────────────────
function UsersTab({ onSelectUser }: { onSelectUser: (userId: number) => void }) {
  const { data: users, isLoading } = trpc.admin.users.useQuery();
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
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
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
            <div key={u.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center font-bold text-navy-deep shrink-0">
                  {(u.name || u.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-navy-deep">{u.name || "No name"}</p>
                  <p className="text-sm text-muted-brand">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  onChange={(e) => {
                    updateRoleMutation.mutate(
                      { id: u.id, role: e.target.value as "user" | "admin" | "tutor" | "parent" },
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
                <Button variant="outline" size="sm" onClick={() => onSelectUser(u.id)}>
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bookings Tab ────────────────────────────────────
function BookingsTab() {
  const { data: bookings, isLoading } = trpc.booking.list.useQuery();
  const updateStatusMutation = trpc.booking.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.booking.list.invalidate(); },
    onError: () => toast.error("Failed to update status"),
  });
  const utils = trpc.useUtils();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [emailModal, setEmailModal] = useState<{ email: string; name: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const openEmailModal = (email: string, name: string) => {
    setEmailModal({ email, name });
    setEmailSubject("Your Oak Scholars Booking");
    setEmailBody(`Hi ${name},\n\nThank you for booking with Oak Scholars. We wanted to follow up regarding your session.\n\nBest regards,\nThe Oak Scholars Team`);
  };

  const sendEmail = () => {
    if (!emailModal) return;
    const mailto = `mailto:${emailModal.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailto, "_blank");
    setEmailModal(null);
  };

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
          {bookings.map((b) => {
            const isExpanded = expandedId === b.id;
            return (
              <div key={b.id}>
                {/* Row header */}
                <div
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      b.status === "confirmed" ? "bg-green-100" :
                      b.status === "cancelled" ? "bg-red-100" :
                      b.status === "contacted" ? "bg-blue-100" : "bg-amber-100"
                    }`}>
                      <Calendar size={14} className={`${
                        b.status === "confirmed" ? "text-green-600" :
                        b.status === "cancelled" ? "text-red-600" :
                        b.status === "contacted" ? "text-blue-600" : "text-amber-600"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-deep text-sm">{b.firstName} {b.lastName}</p>
                      <p className="text-xs text-muted-brand truncate">{b.subject} · {b.level} · {new Date(b.createdAt).toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <select
                      value={b.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStatusMutation.mutate({ id: b.id, status: e.target.value as "new" | "contacted" | "confirmed" | "cancelled" });
                      }}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-navy-deep bg-white focus:outline-none focus:ring-2 focus:ring-amber/30"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEmailModal(b.email, `${b.firstName} ${b.lastName}`); }}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150"
                      title="Email student"
                    >
                      <Mail size={14} />
                    </button>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-navy-deep uppercase tracking-wide">Contact Details</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-brand">
                          <Mail size={13} className="text-gray-400" />
                          <a href={`mailto:${b.email}`} className="hover:text-amber transition-colors">{b.email}</a>
                        </div>
                        {b.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-brand">
                            <Phone size={13} className="text-gray-400" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                        {b.preferredContactMethod && (
                          <div className="text-xs text-muted-brand">Preferred contact: <span className="font-medium capitalize">{b.preferredContactMethod}</span></div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-navy-deep uppercase tracking-wide">Session Details</h4>
                        <div className="text-sm text-muted-brand">Subject: <span className="font-medium text-navy-deep">{b.subject}</span></div>
                        <div className="text-sm text-muted-brand">Level: <span className="font-medium text-navy-deep">{b.level}</span></div>
                        <div className="text-sm text-muted-brand">Package: <span className="font-medium text-navy-deep">{b.sessionType}</span></div>
                        <div className="text-sm text-muted-brand">Preferred time: <span className="font-medium text-navy-deep">{b.preferredTime}</span></div>
                      </div>
                      {(b as any).stripeSessionId && (
                        <div className="sm:col-span-2 space-y-1">
                          <h4 className="text-xs font-bold text-navy-deep uppercase tracking-wide">Payment</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-brand">
                            <CreditCard size={13} className="text-gray-400" />
                            <span className="font-mono text-xs">{(b as any).stripeSessionId}</span>
                            <a
                              href={`https://dashboard.stripe.com/payments/${(b as any).stripeSessionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      )}
                      {b.message && (
                        <div className="sm:col-span-2">
                          <h4 className="text-xs font-bold text-navy-deep uppercase tracking-wide mb-1">Note from student</h4>
                          <p className="text-sm text-muted-brand bg-white rounded-lg p-3 border border-gray-100">{b.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Email compose modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEmailModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl font-bold text-navy-deep">Email Student</h2>
                <button onClick={() => setEmailModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-navy-deep uppercase tracking-wide block mb-1">To</label>
                  <div className="text-sm text-muted-brand bg-gray-50 rounded-lg px-3 py-2">{emailModal.email}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-navy-deep uppercase tracking-wide block mb-1">Subject</label>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-navy-deep uppercase tracking-wide block mb-1">Message</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/30 resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setEmailModal(null)}
                    className="px-4 py-2 text-sm text-muted-brand hover:text-navy-deep transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmail}
                    className="px-5 py-2 text-sm font-semibold rounded-lg text-[#281A39] btn-press"
                    style={{ backgroundColor: "#E8A838" }}
                  >
                    Open in Email Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ──────────────────────────────────────
function OrdersTab() {
  const { data: orders, isLoading } = trpc.admin.orders.useQuery();

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
            <div key={o.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150">
              <div>
                <p className="font-semibold text-navy-deep text-sm">{o.email}</p>
                <p className="text-xs text-muted-brand">{o.packageName} · {new Date(o.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-navy-deep">£{(o.amountTotal / 100).toFixed(2)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  o.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tutor Applications Tab ────────────────────────────────────
function TutorApplicationsTab() {
  const { data: applications, isLoading } = trpc.admin.tutorApplications.useQuery();
  const updateStatusMutation = trpc.admin.updateTutorApplicationStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated");
      const utils = trpc.useUtils();
      utils.admin.tutorApplications.invalidate();
    },
    onError: () => toast.error("Failed to update status"),
  });

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
            <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-navy-deep">{app.firstName} {app.lastName}</p>
                  <p className="text-sm text-muted-brand">{app.email} · {app.university}</p>
                  <p className="text-xs text-muted-brand mt-1">{app.degreeSubject} ({app.yearOfStudy}) · {app.subjects}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={app.status}
                    onChange={(e) => {
                      updateStatusMutation.mutate({
                        id: app.id,
                        status: e.target.value as "new" | "reviewing" | "interview" | "accepted" | "rejected",
                      });
                    }}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-navy-deep bg-white focus:outline-none focus:ring-2 focus:ring-amber/30"
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interview">Interview</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                    app.status === "accepted" ? "bg-green-100 text-green-700" :
                    app.status === "rejected" ? "bg-red-100 text-red-700" :
                    app.status === "interview" ? "bg-blue-100 text-blue-700" :
                    app.status === "reviewing" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{app.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
                <tr key={pkg.name} className="hover:bg-gray-50 transition-colors duration-100">
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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>;
  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-navy-deep font-bold">Access Denied</p>
        <p className="text-muted-brand text-sm mt-1">Admin access required.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <LayoutDashboard size={22} className="text-amber-600" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-navy-deep">Admin Dashboard</h1>
            <p className="text-sm text-muted-brand">Manage your platform</p>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex gap-1 flex-wrap">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <LayoutDashboard size={14} /> Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-1.5">
              <Calendar size={14} /> Bookings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users size={14} /> Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1.5">
              <ShoppingCart size={14} /> Orders
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-1.5">
              <GraduationCap size={14} /> Applications
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-1.5">
              <PoundSterling size={14} /> Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab onSelectUser={setSelectedUserId} />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="applications">
            <TutorApplicationsTab />
          </TabsContent>
          <TabsContent value="earnings">
            <EarningsTab />
          </TabsContent>
        </Tabs>
      </div>

      {selectedUserId && (
        <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
      <Footer />
    </div>
  );
}
