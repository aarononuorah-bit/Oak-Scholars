import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Lock, Loader2 } from "lucide-react";
import { useState } from "react";

interface TimetableProps {
  targetUserId: number;
  userName?: string;
}

export default function Timetable({ targetUserId, userName }: TimetableProps) {
  // We use refetchInterval so the calendar stays live without refreshing the page
  const { data: events = [], isLoading, error } = trpc.calendar.getTimetable.useQuery(
    { targetUserId },
    { refetchInterval: 60000 } 
  );
  
  const [viewMode, setViewMode] = useState<"week" | "6month">("week");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-amber mb-4" size={32} />
        <p className="text-sm text-muted-brand">Fetching secure timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md mx-auto flex flex-col items-center justify-center">
        <Lock size={28} className="text-red-400 mb-3" />
        <h3 className="text-sm font-bold text-navy-deep">Schedule Restricted</h3>
        <p className="text-xs text-muted-brand mt-1 leading-relaxed">{error.message}</p>
      </div>
    );
  }

  const upcomingEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-amber" />
          <h3 className="font-serif font-bold text-navy-deep text-base">
            {userName ? `${userName}'s Timetable` : "Weekly Schedule"}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode("week")}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setViewMode("week");
                }
              }}
              className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${viewMode === "week" ? "bg-white text-navy-deep shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              Week
            </button>
            <button 
              onClick={() => setViewMode("6month")}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setViewMode("6month");
                }
              }}
              className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${viewMode === "6month" ? "bg-white text-navy-deep shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              6 Months
            </button>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1">
            Live Sync Active
          </span>
        </div>
      </div>

      <div className="p-5 overflow-x-auto">
        {viewMode === "week" ? (
          <div className="min-w-[600px] grid grid-cols-7 gap-3">
            {days.map((day) => (
              <div key={day} className="space-y-2 min-h-[150px] bg-surface/30 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-navy-deep text-center border-b border-gray-100 pb-1.5 uppercase tracking-wider">{day.slice(0, 3)}</p>
                
                {events
                  .filter(e => new Date(e.start).toLocaleDateString("en-US", { weekday: "long" }) === day)
                  .map((ev) => (
                    <div key={ev.id} className="bg-[#281A39] text-white p-2 rounded-lg text-left shadow-sm animate-fade-in">
                      <p className="text-[10px] font-bold truncate text-amber">{ev.title}</p>
                      <p className="text-[9px] text-white/70 font-mono mt-0.5">
                        {new Date(ev.start).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-gray-400 italic">No upcoming sessions found for the next 6 months.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="bg-surface/50 border border-gray-100 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-amber/10 text-amber p-2 rounded-lg shrink-0">
                      <Clock size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-navy-deep truncate">{ev.title}</p>
                      <p className="text-[10px] text-muted-brand">
                        {new Date(ev.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} &middot; {new Date(ev.start).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
