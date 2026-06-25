import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User, ShoppingBag, CreditCard, LogOut, Calendar, Package } from "lucide-react";
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

  const updateProfile = trpc.account.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
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
            Book your first tutoring session to see it here.
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
              <a href={getLoginUrl()}>
                <Button style={{ backgroundColor: "#281A39", color: "#fff" }}>
                  Sign In
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
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
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
