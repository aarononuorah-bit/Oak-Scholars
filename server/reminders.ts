/**
 * Appointment Reminder & Follow-up Service
 * Sends email reminders before sessions and follow-ups after sessions.
 */

import { getUserById, getDb } from "./db";
import { sendSessionReminder, sendLessonFollowUp } from "./email";
import { tutoringSessions } from "../drizzle/schema";
import { eq, and, gte, lte, isNull } from "drizzle-orm";

const REMINDER_HOURS_BEFORE = 24;
const FOLLOWUP_HOURS_AFTER = 1;

/**
 * Send reminders for sessions scheduled in the next 24 hours
 */
export async function sendUpcomingSessionReminders() {
  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();
    const reminderTarget = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 60 * 60 * 1000);
    
    // Find sessions within the next 24-25 hours that haven't had a reminder sent
    // We use a 1-hour window to avoid missing sessions between runs
    const windowStart = new Date(reminderTarget.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(reminderTarget.getTime() + 30 * 60 * 1000);

    const sessions = await db.select().from(tutoringSessions).where(
      and(
        eq(tutoringSessions.status, "scheduled"),
        gte(tutoringSessions.scheduledAt, windowStart),
        lte(tutoringSessions.scheduledAt, windowEnd),
        isNull(tutoringSessions.reminderSentAt)
      )
    );

    for (const session of sessions) {
      const student = await getUserById(session.studentId);
      const tutor = await getUserById(session.tutorId!);
      
      if (student?.email && tutor) {
        await sendSessionReminder({
          studentName: student.name || "Student",
          studentEmail: student.email,
          tutorName: tutor.name || "Your Tutor",
          subject: session.subject,
          scheduledAt: session.scheduledAt,
        });

        // Mark as sent
        await db.update(tutoringSessions)
          .set({ reminderSentAt: new Date() })
          .where(eq(tutoringSessions.id, session.id));
      }
    }
  } catch (error) {
    console.error("[Reminders] Error sending reminders:", error);
  }
}

/**
 * Send follow-up emails for sessions completed 1 hour ago
 */
export async function sendCompletedLessonFollowUps() {
  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();
    const followUpTarget = new Date(now.getTime() - FOLLOWUP_HOURS_AFTER * 60 * 60 * 1000);
    
    // Look for completed sessions around 1 hour ago that haven't had follow-up sent
    const windowStart = new Date(followUpTarget.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(followUpTarget.getTime() + 30 * 60 * 1000);

    const sessions = await db.select().from(tutoringSessions).where(
      and(
        eq(tutoringSessions.status, "completed"),
        gte(tutoringSessions.completedAt, windowStart),
        lte(tutoringSessions.completedAt, windowEnd),
        isNull(tutoringSessions.followUpSentAt)
      )
    );

    for (const session of sessions) {
      const student = await getUserById(session.studentId);
      const tutor = await getUserById(session.tutorId!);
      
      if (student?.email && tutor) {
        await sendLessonFollowUp({
          studentName: student.name || "Student",
          studentEmail: student.email,
          tutorName: tutor.name || "Your Tutor",
          subject: session.subject,
          sessionId: session.id,
        });

        // Mark as sent
        await db.update(tutoringSessions)
          .set({ followUpSentAt: new Date() })
          .where(eq(tutoringSessions.id, session.id));
      }
    }
  } catch (error) {
    console.error("[Reminders] Error sending follow-ups:", error);
  }
}

/**
 * Initialize reminder and follow-up scheduler
 */
export function initializeReminderScheduler() {
  const INTERVAL_MS = 15 * 60 * 1000; // Check every 15 minutes for better precision
  
  console.log("[Reminders] Initializing scheduler (checks every 15m)");
  
  const runTasks = async () => {
    await sendUpcomingSessionReminders();
    await sendCompletedLessonFollowUps();
  };

  // Run immediately
  runTasks().catch(err => console.error("[Reminders] Initial run failed:", err));
  
  // Periodically
  setInterval(() => {
    runTasks().catch(err => console.error("[Reminders] Periodic run failed:", err));
  }, INTERVAL_MS);
}
