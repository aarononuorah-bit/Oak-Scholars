import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Timetable from "@/components/Timetable";
import {
  Calendar, Mail, GraduationCap, Megaphone, Bell, Users, Trash2,
  ToggleLeft, ToggleRight, Send, Plus, LayoutDashboard, ShoppingCart,
  FileText, TrendingUp, Activity, Download, Shield, UserCheck,
  CheckCircle, CreditCard, MessageSquare, UserPlus, RefreshCw,
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
            <div className="space-y-8">
              {/* Profile Header Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              
              {/* Timetable Skeleton */}
              <div className="border-t pt-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          ) : !profile ? (
            <p className="text-muted-brand">Profile not found.</p>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center text-2xl font-bold text-navy-deep">
                  {(profile.name || profile.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy-deep text-lg">{profile.name || "No name"}</p>
                  <p className="text-sm text-muted-brand">{profile.email}</p>
                </div>
              </div>
              
              {/* Timetable container with scroll protection */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-navy-deep mb-4">Weekly Schedule</h3>
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

// ─── Overview Tab ───────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-deep">Welcome to Admin Dashboard</h2>
      <p className="text-muted-brand">Select a tab to manage your platform.</p>
    </div>
  );
}

// ─── Users Tab ───────────────────────────
function UsersTab({ onSelectUser }: { onSelectUser: (userId: number) => void }) {
  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-deep">Manage Users</h2>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
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
        <div className="grid gap-4">
          {users.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center font-bold text-navy-deep">
                  {(user.name || user.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-navy-deep">{user.name || "No name"}</p>
                  <p className="text-sm text-muted-brand">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelectUser(user.id)}
              >
                View Profile
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Shell ───────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user || user.role !== "admin") return <div>Access Denied</div>;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="container py-24">
        <h1 className="font-serif text-3xl font-bold text-navy-deep mb-8">Dashboard</h1>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex gap-2">
            <TabsTrigger value="overview">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab onSelectUser={setSelectedUserId} />
          </TabsContent>
        </Tabs>
      </div>

      {selectedUserId && (
        <UserProfileModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}
      <Footer />
    </div>
  );
}
