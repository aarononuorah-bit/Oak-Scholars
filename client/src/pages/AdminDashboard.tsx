import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Calendar, Mail, GraduationCap, Megaphone, Bell, Users, Trash2, ToggleLeft, ToggleRight, Send, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    read: "bg-gray-100 text-gray-700",
    replied: "bg-green-100 text-green-700",
    reviewing: "bg-yellow-100 text-yellow-700",
    interview: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const { data: bookings = [], refetch } = trpc.booking.list.useQuery();
  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-navy-deep mb-4">Bookings ({bookings.length})</h2>
      {bookings.length === 0 ? (
        <p className="text-muted-brand text-sm">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
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
                  <p className="text-xs text-muted-brand mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <Select
                    value={b.status}
                    onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v as "new" | "contacted" | "confirmed" | "cancelled" })}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Contact Messages Tab ─────────────────────────────────────────────────────
function ContactTab() {
  const { data: messages = [], refetch } = trpc.contact.list.useQuery();
  const updateStatus = trpc.contact.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-navy-deep mb-4">Contact Messages ({messages.length})</h2>
      {messages.length === 0 ? (
        <p className="text-muted-brand text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <p className="font-semibold text-navy-deep">{m.name}</p>
                  <p className="text-sm text-muted-brand">{m.email}</p>
                  <p className="text-sm font-medium text-navy-deep mt-1">{m.subject}</p>
                  <p className="text-sm text-muted-brand mt-1 leading-relaxed">{m.message}</p>
                  <p className="text-xs text-muted-brand mt-1">{new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={m.status} />
                  <Select
                    value={m.status}
                    onValueChange={(v) => updateStatus.mutate({ id: m.id, status: v as "new" | "read" | "replied" })}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
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

  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-navy-deep mb-4">Tutor Applications ({applications.length})</h2>
      {applications.length === 0 ? (
        <p className="text-muted-brand text-sm">No applications yet.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <p className="font-semibold text-navy-deep">{a.firstName} {a.lastName}</p>
                  <p className="text-sm text-muted-brand">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                  <p className="text-sm text-navy-deep mt-1">
                    <span className="font-medium">{a.university}</span> · {a.degreeSubject} · {a.yearOfStudy}
                  </p>
                  <p className="text-xs text-muted-brand mt-0.5">Subjects: {a.subjects}</p>
                  <p className="text-xs text-muted-brand">Levels: {a.levels}</p>
                  {a.cvFileUrl && (
                    <a href={a.cvFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber underline mt-1 inline-block">
                      View CV
                    </a>
                  )}
                  <p className="text-xs text-muted-brand mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  <Select
                    value={a.status}
                    onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v as "new" | "reviewing" | "interview" | "accepted" | "rejected" })}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Banners Tab ──────────────────────────────────────────────────────────────
function BannersTab() {
  const { data: banners = [], refetch } = trpc.banners.list.useQuery();
  const createBanner = trpc.banners.create.useMutation({
    onSuccess: () => { toast.success("Banner created"); refetch(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const setActive = trpc.banners.setActive.useMutation({
    onSuccess: () => { toast.success("Banner updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteBanner = trpc.banners.delete.useMutation({
    onSuccess: () => { toast.success("Banner deleted"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ message: "", type: "info" as "info" | "success" | "warning" | "promo", linkText: "", linkUrl: "", isActive: false });
  const resetForm = () => setForm({ message: "", type: "info", linkText: "", linkUrl: "", isActive: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-navy-deep">Announcement Banners</h2>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}>
          <Plus size={14} className="mr-1" />New Banner
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-amber/30 p-5 mb-5">
          <h3 className="font-semibold text-navy-deep mb-4">Create Banner</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-navy-deep mb-1 block">Message *</Label>
              <Input value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="🎉 First session 50% off this week!" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-navy-deep mb-1 block">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as "info" | "success" | "warning" | "promo" }))}>
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
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-amber" />
                <label htmlFor="isActive" className="text-xs text-navy-deep">Set as active</label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-navy-deep mb-1 block">CTA Text (optional)</Label>
                <Input value={form.linkText} onChange={(e) => setForm((f) => ({ ...f, linkText: e.target.value }))} placeholder="Book now" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-navy-deep mb-1 block">CTA URL (optional)</Label>
                <Input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="/booking" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createBanner.mutate(form)} disabled={!form.message || createBanner.isPending} style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}>
                {createBanner.isPending ? "Creating..." : "Create"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {banners.length === 0 ? (
        <p className="text-muted-brand text-sm">No banners yet.</p>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${b.type === "promo" ? "bg-purple-100 text-purple-700" : b.type === "warning" ? "bg-yellow-100 text-yellow-700" : b.type === "success" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{b.type}</span>
                  {b.isActive === 1 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>}
                </div>
                <p className="text-sm text-navy-deep">{b.message}</p>
                {b.linkText && <p className="text-xs text-muted-brand mt-0.5">CTA: {b.linkText} → {b.linkUrl}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setActive.mutate({ id: b.id, isActive: b.isActive !== 1 })}
                >
                  {b.isActive === 1 ? <><ToggleRight size={14} className="mr-1 text-green-600" />Deactivate</> : <><ToggleLeft size={14} className="mr-1" />Activate</>}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-red-500 hover:bg-red-50"
                  onClick={() => deleteBanner.mutate({ id: b.id })}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Push Notifications Tab ───────────────────────────────────────────────────
function PushTab() {
  const { data: countData } = trpc.push.subscriberCount.useQuery();
  const sendPush = trpc.push.send.useMutation({
    onSuccess: (data) => { toast.success(`Sent to ${data.sent} subscribers (${data.failed} failed)`); setForm({ title: "", body: "", url: "" }); },
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
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="New session slots available!" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-navy-deep mb-1 block">Message *</Label>
            <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="We've just opened up new slots for this week..." rows={3} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-navy-deep mb-1 block">Link URL (optional)</Label>
            <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="/booking" />
          </div>
          <Button
            onClick={() => sendPush.mutate(form)}
            disabled={!form.title || !form.body || sendPush.isPending}
            className="btn-press flex items-center gap-2"
            style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}
          >
            <Send size={14} />
            {sendPush.isPending ? "Sending..." : `Send to ${countData?.count ?? 0} subscribers`}
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
        <div className="text-muted-brand">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container py-32 text-center max-w-md mx-auto">
          <h1 className="font-serif text-3xl font-bold text-navy-deep mb-4">Access Denied</h1>
          <p className="text-muted-brand mb-6">This page is restricted to Oak Scholars administrators.</p>
          <Link href="/">
            <Button style={{ backgroundColor: "#E8A838", color: "#0F1B35" }}>Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { value: "bookings", label: "Bookings", icon: Calendar },
    { value: "contact", label: "Messages", icon: Mail },
    { value: "tutors", label: "Applications", icon: GraduationCap },
    { value: "banners", label: "Banners", icon: Megaphone },
    { value: "push", label: "Push", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <p className="text-amber text-sm font-semibold tracking-widest uppercase mb-2">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-navy-deep">Dashboard</h1>
          <p className="text-muted-brand text-sm mt-1">Welcome back, {user.name || "Admin"}</p>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-3 py-2">
                <t.icon size={14} />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="contact"><ContactTab /></TabsContent>
          <TabsContent value="tutors"><TutorApplicationsTab /></TabsContent>
          <TabsContent value="banners"><BannersTab /></TabsContent>
          <TabsContent value="push"><PushTab /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
