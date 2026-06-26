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
import Timetable from "@/components/Timetable"; // <--- Newly created component
import {
  Calendar, Mail, GraduationCap, Megaphone, Bell, Users, Trash2,
  ToggleLeft, ToggleRight, Send, Plus, LayoutDashboard, ShoppingCart,
  FileText, TrendingUp, Activity, Download, Shield, UserCheck,
  CheckCircle, CreditCard, MessageSquare, UserPlus, RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── User Profile Modal with Integrated Timetable ──────────────────────────────
function UserProfileModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data: profile, isLoading } = trpc.admin.getUserProfile.useQuery({ id: userId });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-bold text-navy-deep">User Profile</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
          {isLoading ? (
            <div className="h-40 bg-gray-100 rounded animate-pulse" />
          ) : !profile ? (
            <p className="text-muted-brand text-sm">Profile not found.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center text-2xl font-bold text-navy-deep">
                  {(profile.name || profile.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy-deep text-lg">{profile.name || "No name"}</p>
                  <p className="text-sm text-muted-brand">{profile.email}</p>
                </div>
              </div>
              
              {/* Integrated Timetable */}
              <Timetable targetUserId={profile.id} userName={profile.name || "User"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Shell (Keeping other tabs below...) ───────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading…</div>;
  if (!user || user.role !== "admin") return <div>Access Denied</div>;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24">
        <h1 className="font-serif text-3xl font-bold text-navy-deep mb-8">Dashboard</h1>
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto bg-white border border-gray-100 p-1 rounded-xl">
             {/* ... your existing TabsTriggers ... */}
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          {/* ... etc ... */}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

// (Include the rest of your existing component definitions here: 
// OverviewTab, BookingsTab, etc. as they appear in your original file)
