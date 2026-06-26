import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle, CalendarCheck, Clock, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

const TIMES = [
  "Weekday mornings", "Weekday afternoons", "Weekday evenings",
  "Saturday mornings", "Saturday afternoons", "Sunday mornings", "Sunday afternoons",
  "Flexible / Discuss",
];

interface Props {
  user: { id: number } | null | undefined;
  form: { preferredTime: string };
  update: (field: "preferredTime", value: string) => void;
}

// Group slots by date label
function groupByDate(slots: { start: string; end: string }[]) {
  const map = new Map<string, { start: string; end: string }[]>();
  for (const slot of slots) {
    const label = format(parseISO(slot.start), "EEE d MMM");
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(slot);
  }
  return Array.from(map.entries());
}

export default function Step3Availability({ user, form, update }: Props) {
  // Fetch the student's assigned tutors to get the first tutor's ID
  const { data: tutorRels = [], isLoading: relsLoading } = trpc.tutoring.myTutors.useQuery(
    undefined,
    { enabled: !!user }
  );

  const firstTutorId = useMemo(() => {
    const active = tutorRels.filter((r) => r.status === "active");
    return active[0]?.tutorId ?? null;
  }, [tutorRels]);

  const { data: avail, isLoading: availLoading } = trpc.calendar.tutorAvailability.useQuery(
    { tutorId: firstTutorId! },
    { enabled: firstTutorId !== null }
  );

  const showCalendar = !!user && firstTutorId !== null && !relsLoading;
  const loading = relsLoading || availLoading;
  const connected = avail?.connected;
  const slots = avail?.slots ?? [];
  const grouped = useMemo(() => groupByDate(slots), [slots]);

  // Check if the selected time is an ISO slot
  const isIsoSelected = form.preferredTime.includes("T");

  if (!showCalendar) {
    // Not logged in or no tutor assigned — show generic time picker
    return (
      <div>
        <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">When works best for you?</h2>
        <p className="text-sm text-muted-brand mb-6">Select a general time preference and we'll confirm the exact slot with your tutor.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() => update("preferredTime", t)}
              className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                form.preferredTime === t
                  ? "border-amber text-navy-deep shadow-sm"
                  : "border-gray-100 text-muted-brand hover:border-amber/40 hover:shadow-sm"
              }`}
              style={form.preferredTime === t ? { backgroundColor: "rgba(232,168,56,0.05)" } : {}}
            >
              <div className="flex items-center justify-between">
                {t}
                {form.preferredTime === t && <CheckCircle size={14} className="text-amber flex-shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 className="font-serif text-2xl font-bold text-navy-deep mb-6">When works best for you?</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!connected || slots.length === 0) {
    // Tutor hasn't connected calendar — fall back to generic
    return (
      <div>
        <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">When works best for you?</h2>
        {firstTutorId && !connected && (
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <Calendar size={16} className="mt-0.5 shrink-0" />
            <span>Your tutor hasn't connected their Google Calendar yet. Select a general time preference and we'll confirm the exact slot.</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() => update("preferredTime", t)}
              className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                form.preferredTime === t
                  ? "border-amber text-navy-deep shadow-sm"
                  : "border-gray-100 text-muted-brand hover:border-amber/40 hover:shadow-sm"
              }`}
              style={form.preferredTime === t ? { backgroundColor: "rgba(232,168,56,0.05)" } : {}}
            >
              <div className="flex items-center justify-between">
                {t}
                {form.preferredTime === t && <CheckCircle size={14} className="text-amber flex-shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tutor has calendar connected — show real availability slots
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-navy-deep mb-2">Pick a slot</h2>
      <div className="flex items-center gap-2 mb-5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
        <CalendarCheck size={14} className="shrink-0" />
        <span>Your tutor's live availability is shown below — slots are 1 hour each.</span>
      </div>

      {isIsoSelected && (
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-navy-deep bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <Clock size={14} className="text-amber shrink-0" />
          Selected: {format(parseISO(form.preferredTime), "EEE d MMM, h:mm a")}
          <button
            onClick={() => update("preferredTime", "")}
            className="ml-auto text-xs text-muted-brand hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
        {grouped.map(([dateLabel, daySlots]) => (
          <div key={dateLabel}>
            <p className="text-xs font-semibold text-muted-brand uppercase tracking-wide mb-2">{dateLabel}</p>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => {
                const selected = form.preferredTime === slot.start;
                return (
                  <button
                    key={slot.start}
                    onClick={() => update("preferredTime", slot.start)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                      selected
                        ? "border-amber bg-amber/10 text-navy-deep shadow-sm scale-105"
                        : "border-gray-200 text-muted-brand hover:border-amber/50 hover:bg-amber/5"
                    }`}
                  >
                    {format(parseISO(slot.start), "h:mm a")}
                    {selected && <CheckCircle size={12} className="inline ml-1.5 text-amber" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-brand mt-4">
        Can't find a suitable slot?{" "}
        <button
          className="underline hover:text-navy-deep transition-colors"
          onClick={() => update("preferredTime", "Flexible / Discuss")}
        >
          Choose flexible timing instead
        </button>
      </p>
    </div>
  );
}
