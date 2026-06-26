import Timetable from "@/components/Timetable";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Timetable from "@/components/Timetable"; // <--- ADDED IMPORT
import {
  Users, Calendar, BookOpen, Star, Clock, Linkedin, GraduationCap,
  ExternalLink, Shield, UserPlus, CheckCircle, Send,
} from "lucide-react";
import { format } from "date-fns";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#281A39]">{value}</p>
      </div>
    </div>
  );
}

export function ParentDashboard() {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkStep, setLinkStep] = useState<"email" | "code">("email");
  const [confirmCode, setConfirmCode] = useState("");

  const { data: children = [], isLoading: childrenLoading, refetch: refetchChildren } = trpc.parent.myChildren.useQuery();
  const { data: pendingRequests = [], refetch: refetchRequests } = trpc.parent.pendingRequests.useQuery();

  const sendLinkRequest = trpc.parent.sendLinkRequest.useMutation({
    onSuccess: () => { toast.success("Confirmation code sent!"); setLinkStep("code"); refetchRequests(); },
    onError: (e) => toast.error(e.message),
  });

  const confirmLink = trpc.parent.confirmLink.useMutation({
    onSuccess: () => { toast.success("Successfully linked!"); setLinkStep("email"); refetchChildren(); refetchRequests(); },
    onError: (e) => toast.error(e.message),
  });

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0] || null;
  const effectiveChildId = selectedChild?.id ?? null;

  const { data: childData } = trpc.parent.childData.useQuery(
    { studentId: effectiveChildId! },
    { enabled: !!effectiveChildId }
  );

  if (!user) return <div>Access Denied</div>;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-24">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#281A39]">Parent Dashboard</h1>
        </div>

        <Tabs defaultValue={children.length > 0 ? "children" : "link"}>
          <TabsList className="mb-6 flex gap-1 bg-white border p-1 rounded-xl">
            <TabsTrigger value="children" className="text-xs px-3 py-2">My Children</TabsTrigger>
            <TabsTrigger value="link" className="text-xs px-3 py-2">Link a Child</TabsTrigger>
          </TabsList>

          <TabsContent value="children">
            {children.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {children.map((child) => (
                  <button key={child.id} onClick={() => setSelectedChildId(child.id)} className={`px-4 py-2 rounded-full text-sm font-semibold border ${ (selectedChildId ?? children[0]?.id) === child.id ? "bg-[#281A39] text-white" : "bg-white" }`}>
                    {child.name || child.email}
                  </button>
                ))}
              </div>
            )}

            {selectedChild && (
              <div className="space-y-6">
                {/* --- TIMETABLE INTEGRATED HERE --- */}
                <Timetable targetUserId={selectedChild.id} userName={selectedChild.name || "Child"} />
                
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="font-serif text-lg font-bold text-[#281A39] mb-4">Sessions</h2>
                  {/* ... childData session list remains here ... */}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="link">
             {/* ... link form code ... */}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default ParentDashboard;
