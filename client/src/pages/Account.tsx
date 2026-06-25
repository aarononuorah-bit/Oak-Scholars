import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User, ShoppingBag, CreditCard, LogOut, Calendar, Package, TrendingUp, Download, MessageSquare, BookOpen, Users, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amountInPence: number, currency = "gbp") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInPence / 100);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-700",
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState((user as { phone?: string })?.phone ?? "");
  const currentAccountType = (user as any)?.accountType ?? null;

  const updateProfile = trpc.account.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      utils.auth.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateAccountType = trpc.account.updateAccountType.useMutation({
    onSuccess: () => {
      toast.success("Account type updated");
      utils.auth.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    updateProfile.mutate({
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={18} />
          Personal Information
        </CardTitle>
        <CardDescription>Update your name, email, and contact details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7700 900000"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            style={{ backgroundColor: "#281A39", color: "#fff" }}
          >
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>

        {/* Account type selector — only show for regular users (not admin/tutor) */}
        {(user as any)?.role === 'user' && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-2">Account Type</p>
            <p className="text-xs text-muted-foreground mb-3">Are you a student or a parent/guardian of a student?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateAccountType.mutate({ accountType: 'student' })}
                disabled={updateAccountType.isPending}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                  currentAccountType === 'student'
                    ? 'border-[#281A39] bg-[#281A39]/5 text-[#281A39]'
                    : 'border-border hover:border-[#281A39]/40'
                }`}
              >
                <GraduationCap size={22} />
                Student
              </button>
              <button
                type="button"
                onClick={() => updateAccountType.mutate({ accountType: 'parent' })}
                disabled={updateAccountType.isPending}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                  currentAccountType === 'parent'
                    ? 'border-[#281A39] bg-[#281A39]/5 text-[#281A39]'
                    : 'border-border hover:border-[#281A39]/40'
                }`}
              >
                <Users size={22} />
                Parent / Guardian
              </button>
            </div>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-muted-foreground mb-1">Account created</p>
          <p className="text-sm font-medium">{user?.createdAt ? formatDate(user.createdAt) : "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const { data: orders, isLoading } = trpc.account.orders.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag size={40} className="text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-1">No orders yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Book your first session with an Oak Scholar to see it here.
          </p>
          <a href="/booking">
            <Button style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
              Book a Session
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-4">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#F3EFE8" }}
                >
                  <Package size={18} style={{ color: "#281A39" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm capitalize">
                    {order.packageName.replace(/_/g, " ")}
                  </p>
                  {(order.subject || order.level) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[order.subject, order.level].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Calendar size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span className="font-bold text-base">
                  {formatCurrency(order.amountTotal, order.currency)}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                    STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Billing Tab ─────────────────────────────────────────────────────────────

function BillingTab() {
  const stripePortal = trpc.account.stripePortal.useMutation({
    onSuccess: ({ url }) => {
      window.open(url, "_blank");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard size={18} />
          Payment Methods & Billing
        </CardTitle>
        <CardDescription>
          Manage your saved cards, view invoices, and update billing details via the Stripe
          Customer Portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your payment information is securely managed by{" "}
            <strong>Stripe</strong>. Click below to open the billing portal where you can:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
            <li>View and update saved payment methods</li>
            <li>Download invoices and receipts</li>
            <li>Update billing address</li>
          </ul>
        </div>

        <Button
          onClick={() => stripePortal.mutate({ origin: window.location.origin })}
          disabled={stripePortal.isPending}
          style={{ backgroundColor: "#281A39", color: "#fff" }}
        >
          <CreditCard size={15} className="mr-2" />
          {stripePortal.isPending ? "Opening portal…" : "Open Billing Portal"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────────────────

function DashboardTab() {
  const { user } = useAuth();
  
  const { data: referralData } = trpc.referral.getStats.useQuery(undefined, { enabled: user?.role === "user" || user?.role === "parent" });
  const { data: sessions = [], isLoading: sessionsLoading } = trpc.session.studentSessions.useQuery(undefined, { enabled: user?.role === "user" });
  const { data: feedback = [], isLoading: feedbackLoading } = trpc.feedback.received.useQuery(undefined, { enabled: user?.role === "user" });

  const now = new Date();
  const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) > now);
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const hoursCompleted = completedSessions.reduce((sum, s) => sum + Math.round((s.duration || 60) / 60), 0);
  const referralRewards = referralData ? (referralData.pendingRewards.asReferrer.length + referralData.pendingRewards.asReferee.length) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Hours Completed</p>
              <p className="text-xl font-bold text-navy-deep">{hoursCompleted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber/20 text-amber">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Sessions Completed</p>
              <p className="text-xl font-bold text-navy-deep">{completedSessions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber/20 text-amber">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Referral Rewards</p>
              <p className="text-xl font-bold text-navy-deep">{referralRewards}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={18} className="text-amber" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-muted-brand">No upcoming sessions yet.</p>
                <p className="text-xs text-muted-brand mt-1">Sessions will appear here once your tutor schedules them.</p>
              </div>
            ) : (
              upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div>
                    <p className="font-bold text-sm text-navy-deep">{session.subject}</p>
                    <p className="text-xs font-medium text-amber mt-1">{new Date(session.scheduledAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-[10px] capitalize">{session.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Scholar Feedback */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare size={18} className="text-amber" />
              Scholar Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-muted-brand">No feedback yet.</p>
                <p className="text-xs text-muted-brand mt-1">Your tutor's session notes will appear here.</p>
              </div>
            ) : (
              feedback.slice(0, 3).map((note) => (
                <div key={note.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-navy-deep">{note.fromUser?.name || "Your Tutor"}</p>
                    <span className="text-[10px] text-muted-brand">{new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  </div>
                  {note.comment && <p className="text-xs text-muted-brand italic leading-relaxed">"{note.comment}"</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referral Program Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp size={18} className="text-amber" />
            Referral Program
          </CardTitle>
          <CardDescription>Share your code and both of you get 20% off your next purchase!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber/5 border border-amber/10 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-brand mb-2">Your Referral Code</p>
            <div className="flex items-center justify-center gap-3">
              <code className="bg-white border border-amber/20 px-4 py-2 rounded-lg text-lg font-bold text-navy-deep tracking-wider">
                {referralData?.referralCode || "Generating..."}
              </code>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  if (referralData?.referralCode) {
                    navigator.clipboard.writeText(referralData.referralCode);
                    toast.success("Referral code copied!");
                  }
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-navy-deep">Available Rewards</h4>
            {referralData && (referralData.pendingRewards.asReferrer.length > 0 || referralData.pendingRewards.asReferee.length > 0) ? (
              <div className="space-y-3">
                {referralData.pendingRewards.asReferrer.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-green-100 bg-green-50/50">
                    <div>
                      <p className="text-sm font-bold text-navy-deep">20% Discount Reward</p>
                      <p className="text-xs text-muted-brand">Earned for referring a friend</p>
                    </div>
                    <Link href={`/booking?rewardId=${r.id}&rewardType=referrer`}>
                      <Button size="sm" style={{ backgroundColor: "#281A39", color: "#fff" }}>Use Now</Button>
                    </Link>
                  </div>
                ))}
                {referralData.pendingRewards.asReferee.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-green-100 bg-green-50/50">
                    <div>
                      <p className="text-sm font-bold text-navy-deep">20% Welcome Reward</p>
                      <p className="text-xs text-muted-brand">Earned via referral</p>
                    </div>
                    <Link href={`/booking?rewardId=${r.id}&rewardType=referee`}>
                      <Button size="sm" style={{ backgroundColor: "#281A39", color: "#fff" }}>Use Now</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-brand italic">No rewards available yet. Share your code to start earning!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Downloads Section - Conditional */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download size={18} className="text-amber" />
            My Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Real resources would come from an orders query filtered by resource type */}
            {/* For now, we show a message if no resources have been purchased */}
            <div className="col-span-full py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <BookOpen size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-brand">No resources purchased yet.</p>
              <Link href="/study-resources">
                <Button variant="link" className="text-amber text-xs font-bold p-0 h-auto mt-1">
                  Browse Resource Packs
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Account Page ────────────────────────────────────────────────────────

export default function Account() {
  const { user, loading, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16" style={{ backgroundColor: "#F9F7F2" }}>
          <div className="container max-w-3xl">
            <Skeleton className="h-10 w-48 mb-8" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" style={{ backgroundColor: "#F9F7F2" }}>
          <Card className="max-w-md w-full mx-4">
            <CardContent className="flex flex-col items-center text-center py-12">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "#F3EFE8" }}
              >
                <User size={28} style={{ color: "#281A39" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#281A39" }}>
                Sign in to your account
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Log in to view your orders, manage your profile, and access your billing
                information.
              </p>
              <a href="/login">
                <Button style={{ backgroundColor: "#281A39", color: "#fff" }}>
                  Sign In
                </Button>
              </a>
              <a href="/register" className="mt-2">
                <Button variant="outline" style={{ borderColor: "#281A39", color: "#281A39" }}>
                  Create Account
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16" style={{ backgroundColor: "#F9F7F2" }}>
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-serif" style={{ color: "#281A39" }}>
                My Account
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Welcome back, {user?.name?.split(" ")[0] ?? "there"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => logoutMutation.mutate(undefined)}
            >
              <LogOut size={14} />
              Sign Out
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={user?.role === "user" ? "dashboard" : "profile"}>
            <TabsList className="mb-6">
              {user?.role === "user" && (
                <TabsTrigger value="dashboard" className="gap-2">
                  <TrendingUp size={14} />
                  My Progress
                </TabsTrigger>
              )}
              <TabsTrigger value="profile" className="gap-2">
                <User size={14} />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag size={14} />
                Orders
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard size={14} />
                Billing
              </TabsTrigger>
            </TabsList>

            {user?.role === "user" && (
              <TabsContent value="dashboard">
                <DashboardTab />
              </TabsContent>
            )}

            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTab />
            </TabsContent>

            <TabsContent value="billing">
              <BillingTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}
