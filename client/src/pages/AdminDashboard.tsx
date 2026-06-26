import Timetable from "@/components/Timetable";
// ... existing imports ...
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import Timetable from "@/components/Timetable"; 
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
               <div className="h-16 w-16 rounded-full bg-gray-100 animate-pulse" />
               <div className="h-4 w-1/3 bg-gray-100 animate-pulse" />
            </div>
          ) : !profile ? (
            <p className="text-muted-brand">Profile not found.</p>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center text-2xl font-bold text-navy-deep">
                  {(profile.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy-deep text-lg">{profile.name}</p>
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            {/* Logic to list users and trigger: setSelectedUserId(user.id) */}
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
