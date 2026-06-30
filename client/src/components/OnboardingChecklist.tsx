/**
 * OnboardingChecklist — a "Getting Started" card shown to new students and parents
 * on their dashboard until all steps are completed.
 *
 * Steps for students:
 *   1. Link a Parent (optional but recommended)
 *   2. Buy Credits
 *   3. Book First Session
 *
 * Steps for parents:
 *   1. Link a Student
 *   2. Buy Credits for your child
 *   3. Book First Session
 *
 * The checklist is dismissed (hidden) once all steps are complete, or when the
 * user explicitly closes it. Dismissal state is persisted in localStorage so it
 * does not reappear on refresh.
 */

import { useState } from "react";
import { CheckCircle2, Circle, X, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href?: string;
  action?: string;
}

interface OnboardingChecklistProps {
  role: "student" | "parent";
  hasLinkedParent?: boolean;   // student: has at least one linked parent
  hasLinkedChild?: boolean;    // parent: has at least one linked child
  hasCredits?: boolean;        // has credit balance > 0
  hasBookedSession?: boolean;  // has at least one session (any status)
}

const DISMISS_KEY = "oak_onboarding_dismissed";

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

function dismiss(): void {
  try {
    localStorage.setItem(DISMISS_KEY, "true");
  } catch {
    // ignore
  }
}

export default function OnboardingChecklist({
  role,
  hasLinkedParent = false,
  hasLinkedChild = false,
  hasCredits = false,
  hasBookedSession = false,
}: OnboardingChecklistProps) {
  const [closed, setClosed] = useState(isDismissed);

  const steps: ChecklistStep[] =
    role === "student"
      ? [
          {
            id: "link-parent",
            label: "Link a Parent",
            description: "Let a parent monitor your progress and book sessions on your behalf.",
            done: hasLinkedParent,
            href: "/dashboard",
            action: "Go to Dashboard",
          },
          {
            id: "buy-credits",
            label: "Buy Credits",
            description: "Purchase session credits — 1 credit = 1 hour of tutoring.",
            done: hasCredits,
            href: "/tuition",
            action: "View Packages",
          },
          {
            id: "book-session",
            label: "Book First Session",
            description: "Schedule your first tutoring session with your assigned tutor.",
            done: hasBookedSession,
            href: "/dashboard",
            action: "Go to Dashboard",
          },
        ]
      : [
          {
            id: "link-child",
            label: "Link a Student",
            description: "Connect your child's account so you can track their sessions and credits.",
            done: hasLinkedChild,
            href: "/dashboard",
            action: "Go to Dashboard",
          },
          {
            id: "buy-credits",
            label: "Buy Credits for Your Child",
            description: "Top up credits so your child can book tutoring sessions.",
            done: hasCredits,
            href: "/tuition",
            action: "View Packages",
          },
          {
            id: "book-session",
            label: "Book First Session",
            description: "Schedule your child's first tutoring session.",
            done: hasBookedSession,
            href: "/dashboard",
            action: "Go to Dashboard",
          },
        ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  // Hide if explicitly dismissed or all steps are complete
  if (closed || allDone) return null;

  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-[#E8A838]/30 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#281A39]/5 to-[#E8A838]/10 border-b border-[#E8A838]/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8A838]/20 flex items-center justify-center">
            <span className="text-[#E8A838] font-bold text-sm">{completedCount}/{steps.length}</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#281A39] text-base leading-tight">
              Getting Started
            </h3>
            <p className="text-xs text-gray-500">
              {completedCount === 0
                ? "Complete these steps to get the most out of Oak Scholars"
                : `${steps.length - completedCount} step${steps.length - completedCount !== 1 ? "s" : ""} remaining`}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            dismiss();
            setClosed(true);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          aria-label="Dismiss onboarding checklist"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-[#E8A838] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="divide-y divide-gray-50">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`flex items-start gap-4 px-6 py-4 transition-colors ${
              step.done ? "opacity-60" : "hover:bg-gray-50/60"
            }`}
          >
            {/* Step number / check icon */}
            <div className="mt-0.5 shrink-0">
              {step.done ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-400">{idx + 1}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${
                  step.done ? "line-through text-gray-400" : "text-[#281A39]"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
            </div>

            {/* CTA */}
            {!step.done && step.href && (
              <Link href={step.href}>
                <button className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#E8A838] hover:text-[#281A39] transition-colors mt-0.5">
                  {step.action} <ChevronRight size={12} />
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
