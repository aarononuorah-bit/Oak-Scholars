import { z } from "zod";
import bcrypt from "bcryptjs";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { aiRouter } from "./ai";
import { notifyOwner } from "./_core/notification";
import { createCalendarEvent } from "./_core/google-calendar";
import { addHours, parseISO } from "date-fns";
import {
  sendAdminBookingAlert,
  sendAdminContactAlert,
  sendAdminTutorAlert,
  sendBookingConfirmation,
  sendContactConfirmation,
  sendTutorApplicationConfirmation,
  sendSessionReminder,
  sendSessionCancellationNotice,
  sendParentLinkCode,
} from "./email";
import { storagePut } from "./storage";
import { sendPushToAll, getVapidPublicKey } from "./push";
import {
  createParentLinkRequest,
  confirmLinkByCode,
  getPendingLinkRequestsForStudent,
  respondToLinkRequest,
  getLinkedStudentForParent,
  getLinkedChildrenForParent,
  updateTutorProfile,
  updateAccountType,
  createBanner,
  getAllBanners,
  getActiveBanner,
  setBannerActive,
  deleteBanner,
  savePushSubscription,
  getAllPushSubscriptions,
  deletePushSubscription,
  createBooking,
  createContactMessage,
  createTutorApplication,
  getAllBookings,
  getAllContactMessages,
  getAllTutorApplications,
  updateBookingStatus,
  updateContactStatus,
  updateTutorApplicationStatus,
  getOrdersByUserId,
  getOrdersByEmail,
  updateUserProfile,
  getAllOrders,
  getAllUsers,
  updateUserRole,
  approveTutorByEmail,
  createTutoringRelationship,
  getTutoringRelationshipsByTutorId,
  getTutoringRelationshipsByStudentId,
  getAllTutoringRelationships,
  updateTutoringRelationshipStatus,
  createTutoringSession,
  getTutoringSessionsByTutorId,
  getTutoringSessionsByStudentId,
  updateTutoringSessionStatus,
  createFeedback,
  getFeedbackForSession,
  getFeedbackReceivedByUser,
  getUserById,
  getUserByEmail,
  createUserWithPassword,
  updateUserLastSignedIn,
  getDb,
  getUserByReferralCode,
  updateUserReferralCode,
  createReferral,
  getPendingRewardsForUser,
} from "./db";
import { tutoringSessions, tutorApplications, tutoringRelationships } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { stripe, getOrCreateStripeCustomer, createStripePortalSession } from "./stripe";
import { PRODUCTS } from "./products";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new Error("Forbidden: admins only");
  return next({ ctx });
});

// ─── Tutor guard ──────────────────────────────────────────────────────────────
const tutorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "tutor") throw new Error("Forbidden: tutors only");
  return next({ ctx });
});

// ─── Student guard ────────────────────────────────────────────────────────────
const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "user") throw new Error("Forbidden: students only");
  return next({ ctx });
});

// ─── Parent guard ────────────────────────────────────────────────────────────
const parentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "parent") throw new Error("Forbidden: parents only");
  return next({ ctx });
});

// ─── Calendar Router ──────────────────────────────────────────────────────────
const calendarRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    return { connected: !!user?.googleRefreshToken && user?.calendarSyncEnabled === 1 };
  }),

  getTimetable: protectedProcedure
    .input(z.object({ targetUserId: z.number() }))
    .query(async ({ input, ctx }) => {
      const viewerId = ctx.user.id;
      const viewerRole = ctx.user.role;
      const targetId = input.targetUserId;

      let hasAccess = viewerId === targetId || viewerRole === "admin";
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });

      if (!hasAccess && (viewerRole === "user" || viewerRole === "tutor")) {
        const paired = await db.select().from(tutoringRelationships).where(eq(tutoringRelationships.status, "active"));
        hasAccess = paired.some(r => (r.tutorId === viewerId && r.studentId === targetId) || (r.studentId === viewerId && r.tutorId === targetId));
      }

      if (!hasAccess && viewerRole === "parent") {
        const children = await getLinkedChildrenForParent(viewerId);
        const isOwnChild = children.some(c => c.id === targetId);
        if (isOwnChild) {
          hasAccess = true;
        } else {
          const childIds = children.map(c => c.id);
          const relationships = await getAllTutoringRelationships();
          hasAccess = relationships.some(r => r.status === "active" && r.tutorId === targetId && childIds.includes(r.studentId));
        }
      }

      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN", message: "Access Denied" });

      const upcomingSessions = await db.select().from(tutoringSessions).where(eq(tutoringSessions.status, "scheduled"));
      return upcomingSessions.filter(s => s.tutorId === targetId || s.studentId === targetId).map(s => ({
        id: s.id,
        title: s.subject,
        start: s.scheduledAt,
        end: addHours(new Date(s.scheduledAt), s.duration / 60)
      }));
    }),
});

// ─── Booking router ───────────────────────────────────────────────────────────
const bookingRouter = router({
  submit: publicProcedure
    .input(z.object({
        firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email(),
        phone: z.string().min(1), preferredContactMethod: z.enum(["email", "phone", "whatsapp"]),
        subject: z.string().min(1), level: z.string().min(1), sessionType: z.string().min(1),
        preferredTime: z.string().min(1), message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await createBooking(input);
      Promise.all([
        sendAdminBookingAlert(input).catch((e) => console.error(e)),
        sendBookingConfirmation(input).catch((e) => console.error(e)),
      ]);
      return { success: true };
    }),
  list: adminProcedure.query(async () => getAllBookings()),
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "confirmed", "cancelled"]) }))
    .mutation(async ({ input }) => {
      await updateBookingStatus(input.id, input.status);
      return { success: true };
    }),
});

// ─── Contact/Tutor/Payments/Banners/Push/Account/Admin Routers remain unchanged ...
// (Retain the existing contactRouter, tutorRouter, paymentsRouter, bannersRouter, 
// pushRouter, accountRouter, and adminRouter implementations you already have)

// 1. ADD THIS ROUTER DEFINITION BEFORE THE APP ROUTER
const sessionRouter = router({
  // Add your existing session routes here if you have them, otherwise use these:
  requestSession: protectedProcedure
    .input(z.object({
      tutorId: z.number(),
      studentId: z.number(),
      scheduledAt: z.date(),
      duration: z.union([z.literal(60), z.literal(90), z.literal(120)]),
      subject: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const cost = input.duration / 60;
      const balance = await getCreditBalance(input.studentId);

      if (balance < cost) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient credit balance." });
      }

      return await createTutoringSession({
        ...input,
        status: "pending_student",
      });
    }),

  acceptBooking: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db.select().from(tutoringSessions).where(eq(tutoringSessions.id, input.sessionId));
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      await db.transaction(async (tx) => {
        const cost = session.duration / 60;
        await updateCreditBalance(session.studentId, -cost); 
        await updateTutoringSessionStatus(input.sessionId, "scheduled");
      });

      return { success: true };
    }),
});

// ─── Final App Router ───────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  calendar: calendarRouter, // <--- Add this
  referral: referralRouter,
  parent: parentRouter,
  tutorProfile: tutorProfileRouter,
  auth: router({ /* ... your existing auth routes ... */ }),
  ai: aiRouter,
  booking: bookingRouter,
  contact: contactRouter,
  tutor: tutorRouter,
  tutoring: tutoringRouter,
  session: sessionRouter,
  feedback: feedbackRouter,
  payments: paymentsRouter,
  banners: bannersRouter,
  push: pushRouter,
  account: accountRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
