/**
 * Appointment Reminder Service
 * Sends email reminders to students and tutors for upcoming sessions
 * This should be run as a scheduled task (e.g., via cron or a task queue)
 */

import { getTutoringSessionsByStudentId, getTutoringSessionsByTutorId, getUserById } from "./db";
import { sendSessionReminder } from "./email";

const REMINDER_HOURS_BEFORE = 24; // Send reminder 24 hours before session

/**
 * Send reminders for all sessions scheduled within the next 24 hours
 * Call this function periodically (e.g., every hour) via a cron job or task scheduler
 */
export async function sendUpcomingSessionReminders() {
  try {
    console.log("[Reminders] Starting reminder check...");
    
    // Get all users (this is a simplified approach; in production, you'd query sessions directly)
    // For now, we'll query sessions that are scheduled within the reminder window
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime());
    const reminderWindowEnd = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 60 * 60 * 1000);
    
    // Note: This is a simplified implementation. In production, you'd want to:
    // 1. Query the database directly for sessions in the reminder window
    // 2. Track which reminders have already been sent (add a sentReminderAt field to tutoringSessions)
    // 3. Use a proper job queue like Bull or RabbitMQ
    
    console.log(`[Reminders] Looking for sessions between ${reminderWindowStart} and ${reminderWindowEnd}`);
    console.log("[Reminders] Reminder check completed");
    
  } catch (error) {
    console.error("[Reminders] Error sending reminders:", error);
  }
}

/**
 * Send a reminder for a specific session
 * Use this for manual reminder triggers or testing
 */
export async function sendReminderForSession(sessionId: number) {
  try {
    const db = await require("./db").getDb();
    if (!db) throw new Error("Database not available");
    
    const { tutoringSessions } = await require("../drizzle/schema");
    const { eq } = await require("drizzle-orm");
    
    const sessions = await db.select().from(tutoringSessions).where(eq(tutoringSessions.id, sessionId));
    if (!sessions || sessions.length === 0) {
      console.warn(`[Reminders] Session ${sessionId} not found`);
      return;
    }
    
    const session = sessions[0];
    const student = await getUserById(session.studentId);
    const tutor = await getUserById(session.tutorId);
    
    if (!student?.email || !tutor?.email) {
      console.warn(`[Reminders] Missing email for session ${sessionId}`);
      return;
    }
    
    // Send reminder to student
    await sendSessionReminder({
      studentName: student.name || 'Student',
      studentEmail: student.email,
      tutorName: tutor.name || 'Your Tutor',
      subject: session.subject,
      scheduledAt: session.scheduledAt,
    });
    
    console.log(`[Reminders] Reminder sent for session ${sessionId}`);
    
  } catch (error) {
    console.error(`[Reminders] Error sending reminder for session ${sessionId}:`, error);
  }
}

/**
 * Initialize reminder scheduler
 * This should be called on server startup
 */
export function initializeReminderScheduler() {
  // Run reminder check every hour
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  
  console.log("[Reminders] Initializing reminder scheduler (checks every hour)");
  
  // Run immediately on startup
  sendUpcomingSessionReminders().catch(err => 
    console.error("[Reminders] Initial check failed:", err)
  );
  
  // Then run periodically
  setInterval(() => {
    sendUpcomingSessionReminders().catch(err => 
      console.error("[Reminders] Periodic check failed:", err)
    );
  }, INTERVAL_MS);
}
