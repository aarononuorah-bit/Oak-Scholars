import { useState } from "react";
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
  Mail, GraduationCap, Clock, AlertCircle,
} from "lucide-react";
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
  const { data, isLoading } = trpc.admin.overview.useQuery();

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
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users size={14} /> Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1.5">
              <ShoppingCart size={14} /> Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab onSelectUser={setSelectedUserId} />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
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
