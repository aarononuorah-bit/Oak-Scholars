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
  sendLoginOtp,
  sendTutorApplicationStatusChange,
  sendParentSessionNotification,
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
  getLinkedParentsForStudent,
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
  setLoginOtp,
  clearLoginOtp,
  clearUserCalendarConnection,
  getUserByOpenId,
  getCreditBalance,
  getCreditTransactionsByUserId,
  updateCreditBalance,
} from "./db";
import { tutoringSessions, tutorApplications, tutoringRelationships } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { stripe, getOrCreateStripeCustomer, createStripePortalSession } from "./stripe";
import { PRODUCTS } from "./products";
import { authLimiter, contactLimiter } from "./rateLimiter";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Forbidden: admins only");
  }
  return next({ ctx });
});

// ─── Tutor guard ──────────────────────────────────────────────────────────────
const tutorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "tutor") {
    throw new Error("Forbidden: tutors only");
  }
  return next({ ctx });
});

// ─── Student guard ────────────────────────────────────────────────────────────
const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "user") {
    throw new Error("Forbidden: students only");
  }
  return next({ ctx });
});

// ─── Parent guard ────────────────────────────────────────────────────────────
const parentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "parent") {
    throw new Error("Forbidden: parents only");
  }
  return next({ ctx });
});

// ─── Booking router ───────────────────────────────────────────────────────────
const bookingRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1, "Phone number is required"),
        preferredContactMethod: z.enum(["email", "phone", "whatsapp"]),
        subject: z.string().min(1),
        level: z.string().min(1),
        sessionType: z.string().min(1),
        preferredTime: z.string().min(1),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createBooking(input);
      await notifyOwner({
        title: `New Booking Request — ${input.firstName} ${input.lastName}`,
        content: `Subject: ${input.subject} | Level: ${input.level} | Session: ${input.sessionType} | Time: ${input.preferredTime}\nEmail: ${input.email} | Phone: ${input.phone}\nPreferred Contact: ${input.preferredContactMethod}${input.message ? `\nNote: ${input.message}` : ""}`,
      });
      // Attempt to create Google Calendar event
      const calendarPromise = (async () => {
        try {
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(10, 0, 0, 0);
          
          const startTime = tomorrow.toISOString();
          const endTime = addHours(parseISO(startTime), 1).toISOString();

          await createCalendarEvent({
            summary: `Tutoring: ${input.subject} (${input.level}) - ${input.firstName} ${input.lastName}`,
            description: `
Student: ${input.firstName} ${input.lastName}
Email: ${input.email}
Phone: ${input.phone}
Preferred Contact: ${input.preferredContactMethod}
Session Type: ${input.sessionType}
Preferred Time (User Input): ${input.preferredTime}
Message: ${input.message || "None"}
            `.trim(),
            start: { dateTime: startTime },
            end: { dateTime: endTime },
          });
        } catch (e) {
          console.error("[Google Calendar] Event creation failed:", e);
        }
      })();

      Promise.all([
        calendarPromise,
        sendAdminBookingAlert(input).catch((e) => console.error("[Email] Admin booking alert failed:", e)),
        sendBookingConfirmation(input).catch((e) => console.error("[Email] Booking confirmation failed:", e)),
      ]);
      return { success: true };
    }),

  list: adminProcedure.query(async () => {
    // We join the session id onto the booking by fetching orders. 
    // Usually these share the same email.
    const db = await getDb();
    if (!db) return getAllBookings();
    
    const bookings = await getAllBookings();
    const orders = await getAllOrders();
    
    return bookings.map(b => {
      const order = orders.find(o => o.email === b.email && o.packageName === b.sessionType);
      return { ...b, stripeSessionId: order?.stripeSessionId };
    });
  }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "confirmed", "cancelled"]) }))
    .mutation(async ({ input }) => {
      await updateBookingStatus(input.id, input.status);
      return { success: true };
    }),
});

// ─── Contact router ───────────────────────────────────────────────────────────
const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1, "Phone number is required"),
        preferredContactMethod: z.enum(["email", "phone", "whatsapp"]),
        subject: z.string().min(1),
        message: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || ctx.req.socket?.remoteAddress || "unknown";
      contactLimiter.check(ip);
      // Sanitise: strip HTML tags from free-text fields
      const sanitise = (s: string) => s.replace(/<[^>]*>/g, "").trim();
      const safeInput = {
        ...input,
        name: sanitise(input.name),
        subject: sanitise(input.subject),
        message: sanitise(input.message),
      };
      await createContactMessage({ name: safeInput.name, email: safeInput.email, subject: safeInput.subject, message: safeInput.message });
      await notifyOwner({
        title: `New Contact Message — ${input.name}`,
        content: `Subject: ${input.subject}\nFrom: ${input.email}\nPhone: ${input.phone}\nPreferred Contact: ${input.preferredContactMethod}\n\n${input.message}`,
      });
      Promise.all([
        sendAdminContactAlert(input).catch((e) => console.error("[Email] Admin contact alert failed:", e)),
        sendContactConfirmation(input).catch((e) => console.error("[Email] Contact confirmation failed:", e)),
      ]);
      return { success: true };
    }),

  list: adminProcedure.query(async () => getAllContactMessages()),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "read", "replied"]) }))
    .mutation(async ({ input }) => {
      await updateContactStatus(input.id, input.status);
      return { success: true };
    }),
});

// ─── Tutor application router ─────────────────────────────────────────────────
const tutorRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1, "Phone number is required"),
        preferredContactMethod: z.enum(["email", "phone", "whatsapp"]),
        university: z.string().min(1),
        degreeSubject: z.string().min(1),
        yearOfStudy: z.string().min(1),
        subjects: z.string(),
        levels: z.string(),
        experience: z.string().min(10),
        availability: z.string().optional(),
        cvFileKey: z.string().optional(),
        cvFileUrl: z.string().optional(),
        coverLetter: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createTutorApplication(input);
      await notifyOwner({
        title: `New Tutor Application — ${input.firstName} ${input.lastName}`,
        content: `University: ${input.university} | Degree: ${input.degreeSubject} | Year: ${input.yearOfStudy}\nSubjects: ${input.subjects}\nEmail: ${input.email}\nPhone: ${input.phone}\nPreferred Contact: ${input.preferredContactMethod}`,
      });
      Promise.all([
        sendAdminTutorAlert(input).catch((e) => console.error("[Email] Admin tutor alert failed:", e)),
        sendTutorApplicationConfirmation(input).catch((e) => console.error("[Email] Tutor confirmation failed:", e)),
      ]);
      return { success: true };
    }),

  uploadCv: publicProcedure
    .input(z.object({ fileName: z.string(), fileBase64: z.string(), mimeType: z.string() }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `cv-uploads/${Date.now()}-${input.fileName}`;
      const { key: storedKey, url } = await storagePut(key, buffer, input.mimeType);
      return { key: storedKey, url };
    }),

  list: adminProcedure.query(async () => getAllTutorApplications()),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "reviewing", "interview", "accepted", "rejected"]) }))
    .mutation(async ({ input }) => {
      await updateTutorApplicationStatus(input.id, input.status);
      
      const db = await getDb();
      if (!db) return { success: true };
      
      const apps = await db.select().from(tutorApplications).where(eq(tutorApplications.id, input.id));
      if (apps.length === 0) return { success: true };
      const app = apps[0];

      // Send status change email if status changed to interview, accepted, or rejected
      if (["interview", "accepted", "rejected"].includes(input.status)) {
        await sendTutorApplicationStatusChange({
          applicantName: app.firstName,
          applicantEmail: app.email,
          status: input.status as "accepted" | "rejected" | "interview",
        }).catch((e) => console.error("[Email] Tutor status email failed:", e));
      }

      // Auto-promote to tutor if accepted
      if (input.status === "accepted") {
        const user = await getUserByEmail(app.email);
        if (user) {
          await updateUserRole(user.id, "tutor");
          // Seed tutor profile with application data
          await updateTutorProfile(user.id, {
            tutorUniversity: app.university,
            tutorCourse: app.degreeSubject,
            tutorSubjects: app.subjects,
            tutorLevel: app.levels
          });
        }
      }

      return { success: true };
    }),
});

// ─── Payments router ─────────────────────────────────────────────────────────
const paymentsRouter = router({
  createCheckout: publicProcedure
    .input(
      z.object({
        productId: z.enum(["trial", "single", "bundle4", "bundle8"]),
        origin: z.string().url(),
        customerEmail: z.string().email().optional(),
        customerName: z.string().optional(),
        rewardId: z.number().optional(),
        rewardType: z.enum(["referrer", "referee"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // ─── Trial guard: Check if user has already used a trial ─────────────────
      if (input.productId === "trial" && input.customerEmail) {
        const existingOrders = await getOrdersByEmail(input.customerEmail);
        const hasUsedTrial = existingOrders.some(o => 
          o.status === 'paid' && 
          (o.packageName === 'trial' || o.packageName === 'Trial Session')
        );
        if (hasUsedTrial) {
          throw new Error("You have already used your trial lesson. Please select a standard package.");
        }
      }

      const product = PRODUCTS.find((p) => p.id === input.productId);
      if (!product) throw new Error("Invalid product");

      let unitAmount: number = product.priceInPence;
      const metadata: Record<string, string> = {
        product_id: input.productId,
        customer_email: input.customerEmail ?? "",
        customer_name: input.customerName ?? "",
      };

      if (input.rewardId && input.rewardType) {
        unitAmount = Math.round(unitAmount * 0.8);
        metadata.reward_id = String(input.rewardId);
        metadata.reward_type = input.rewardType;
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Oak Scholars — ${product.name}${input.rewardId ? " (20% Referral Discount)" : ""}`,
                description: product.description,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        allow_promotion_codes: true,
        customer_email: input.customerEmail,
        client_reference_id: input.customerEmail ?? undefined,
        metadata,
        success_url: `${input.origin}/booking/success`,
        cancel_url: `${input.origin}/booking?payment=cancelled`,
      });

      return { url: session.url };
    }),

  createResourceCheckout: publicProcedure
    .input(
      z.object({
        resourceType: z.enum(["revision-notes", "mock-questions", "model-answers", "powerpoint-packs"]),
        subject: z.string(),
        level: z.string(),
        examBoard: z.string().optional(),
        customerEmail: z.string().email(),
        customerName: z.string().optional(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const RESOURCE_PRICES: Record<string, number> = {
        "revision-notes": 1500,
        "mock-questions": 1500,
        "model-answers": 1500,
        "powerpoint-packs": 2000,
      };
      const RESOURCE_NAMES: Record<string, string> = {
        "revision-notes": "Revision Notes",
        "mock-questions": "Mock Questions",
        "model-answers": "Model Answers",
        "powerpoint-packs": "PowerPoint Pack",
      };
      const priceInPence = RESOURCE_PRICES[input.resourceType];
      const resourceName = RESOURCE_NAMES[input.resourceType];
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Oak Scholars — ${resourceName}: ${input.subject} (${input.level})`,
                description: `${resourceName} for ${input.subject} at ${input.level}${input.examBoard ? ` — ${input.examBoard}` : ""}`,
              },
              unit_amount: priceInPence,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        allow_promotion_codes: true,
        customer_email: input.customerEmail,
        client_reference_id: input.customerEmail,
        metadata: {
          product_type: "study-resource",
          resource_type: input.resourceType,
          subject: input.subject,
          level: input.level,
          exam_board: input.examBoard ?? "",
          customer_email: input.customerEmail,
          customer_name: input.customerName ?? "",
        },
        success_url: `${input.origin}/study-resources/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/study-resources?payment=cancelled`,
      });
      return { url: session.url };
    }),
});

// ─── Banners router ─────────────────────────────────────────────────────────
const bannersRouter = router({
  getActive: publicProcedure.query(async () => getActiveBanner()),

  list: adminProcedure.query(async () => getAllBanners()),

  create: adminProcedure
    .input(
      z.object({
        message: z.string().min(1),
        type: z.enum(["info", "success", "warning", "promo"]),
        linkText: z.string().optional(),
        linkUrl: z.string().optional(),
        isActive: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      await createBanner({
        message: input.message,
        type: input.type,
        linkText: input.linkText ?? null,
        linkUrl: input.linkUrl ?? null,
        isActive: input.isActive ? 1 : 0,
      });
      return { success: true };
    }),

  setActive: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await setBannerActive(input.id, input.isActive);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBanner(input.id);
      return { success: true };
    }),
});

// ─── Push notifications router ────────────────────────────────────────────────
const pushRouter = router({
  getVapidKey: publicProcedure.query(() => ({ publicKey: getVapidPublicKey() })),

  subscribe: publicProcedure
    .input(z.object({ endpoint: z.string().url(), p256dh: z.string(), auth: z.string() }))
    .mutation(async ({ input }) => {
      await savePushSubscription(input);
      return { success: true };
    }),

  unsubscribe: publicProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ input }) => {
      await deletePushSubscription(input.endpoint);
      return { success: true };
    }),

  send: adminProcedure
    .input(z.object({ title: z.string().min(1), body: z.string().min(1), url: z.string().optional() }))
    .mutation(async ({ input }) => {
      const result = await sendPushToAll(input);
      return result;
    }),

  subscriberCount: adminProcedure.query(async () => {
    const subs = await getAllPushSubscriptions();
    return { count: subs.length };
  }),
});

// ─── Account router ─────────────────────────────────────────────────────────
const accountRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => ctx.user),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),

  orders: protectedProcedure.query(async ({ ctx }) => {
    const byId = await getOrdersByUserId(ctx.user.id);
    if (byId.length > 0) return byId;
    if (ctx.user.email) return getOrdersByEmail(ctx.user.email);
    return [];
  }),
  // Alias for backwards-compatibility
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    const byId = await getOrdersByUserId(ctx.user.id);
    if (byId.length > 0) return byId;
    if (ctx.user.email) return getOrdersByEmail(ctx.user.email);
    return [];
  }),

  stripePortal: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.email) throw new Error("Email required for billing portal");
      const customerId = await getOrCreateStripeCustomer(
        ctx.user.id,
        ctx.user.email,
        ctx.user.name,
        ctx.user.stripeCustomerId
      );
      const url = await createStripePortalSession(customerId, `${input.origin}/account`);
      return { url };
    }),

  updateAccountType: protectedProcedure
    .input(z.object({ accountType: z.enum(['student', 'parent']) }))
    .mutation(async ({ ctx, input }) => {
      await updateAccountType(ctx.user.id, input.accountType);
      return { success: true };
    }),

  trialEligibility: protectedProcedure.query(async ({ ctx }) => {
    const orders = await getOrdersByUserId(ctx.user.id);
    const emailOrders = ctx.user.email ? await getOrdersByEmail(ctx.user.email) : [];
    const allOrders = [...orders, ...emailOrders];
    
    // Check if any paid order has the trial package
    const hasUsedTrial = allOrders.some(o => 
      o.status === 'paid' && 
      (o.packageName === 'trial' || o.packageName === 'Trial Session')
    );
    
    return { eligible: !hasUsedTrial };
  }),
});

// ─── Admin overview router ────────────────────────────────────────────────────────
const adminRouter = router({
  overview: adminProcedure.query(async () => {
    const [allBookings, allMessages, allApplications, allOrders, allUsers, allPushSubs] = await Promise.all([
      getAllBookings(),
      getAllContactMessages(),
      getAllTutorApplications(),
      getAllOrders(),
      getAllUsers(),
      getAllPushSubscriptions(),
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentBookings = allBookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo);
    const recentMessages = allMessages.filter(m => new Date(m.createdAt) >= thirtyDaysAgo);
    const recentApplications = allApplications.filter(a => new Date(a.createdAt) >= thirtyDaysAgo);
    const recentOrders = allOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    const recentUsers = allUsers.filter(u => new Date(u.createdAt) >= thirtyDaysAgo);

    const paidOrders = allOrders.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amountTotal, 0);
    const recentRevenue = recentOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amountTotal, 0);

    const cvUploads = allApplications.filter(a => a.cvFileUrl);

    type ActivityItem = { type: string; label: string; detail: string; date: Date; status?: string };
    const activity: ActivityItem[] = [
      ...allBookings.filter(b => new Date(b.createdAt) >= sevenDaysAgo).map(b => ({
        type: 'booking', label: `${b.firstName} ${b.lastName}`, detail: `${b.subject} · ${b.level}`, date: new Date(b.createdAt), status: b.status
      })),
      ...allMessages.filter(m => new Date(m.createdAt) >= sevenDaysAgo).map(m => ({
        type: 'message', label: m.name, detail: m.subject, date: new Date(m.createdAt), status: m.status
      })),
      ...allApplications.filter(a => new Date(a.createdAt) >= sevenDaysAgo).map(a => ({
        type: 'application', label: `${a.firstName} ${a.lastName}`, detail: `${a.university} · ${a.degreeSubject}`, date: new Date(a.createdAt), status: a.status
      })),
      ...allOrders.filter(o => new Date(o.createdAt) >= sevenDaysAgo).map(o => ({
        type: 'order', label: o.email, detail: `${o.packageName} · £${(o.amountTotal / 100).toFixed(2)}`, date: new Date(o.createdAt), status: o.status
      })),
      ...allUsers.filter(u => new Date(u.createdAt) >= sevenDaysAgo).map(u => ({
        type: 'user', label: u.name || u.email || 'New user', detail: `Signed up via ${u.loginMethod || 'unknown'}`, date: new Date(u.createdAt)
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);

    return {
      stats: {
        totalBookings: allBookings.length,
        newBookings: allBookings.filter(b => b.status === 'new').length,
        recentBookings: recentBookings.length,
        totalMessages: allMessages.length,
        unreadMessages: allMessages.filter(m => m.status === 'new').length,
        recentMessages: recentMessages.length,
        totalApplications: allApplications.length,
        newApplications: allApplications.filter(a => a.status === 'new').length,
        recentApplications: recentApplications.length,
        cvUploads: cvUploads.length,
        acceptedTutors: allApplications.filter(a => a.status === 'accepted').length,
        totalOrders: allOrders.length,
        paidOrders: paidOrders.length,
        recentOrders: recentOrders.length,
        totalRevenue,
        recentRevenue,
        totalUsers: allUsers.length,
        adminUsers: allUsers.filter(u => u.role === 'admin').length,
        recentUsers: recentUsers.length,
        pushSubscribers: allPushSubs.length,
      },
      recentActivity: activity,
    };
  }),

  users: adminProcedure.query(async () => getAllUsers()),

  orders: adminProcedure.query(async () => getAllOrders()),

  updateUserRole: adminProcedure
    .input(z.object({ id: z.number(), role: z.enum(['user', 'admin', 'tutor', 'parent']) }))
    .mutation(async ({ input }) => {
      await updateUserRole(input.id, input.role);
      return { success: true };
    }),

  approveTutor: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const userId = await approveTutorByEmail(input.email);
      return { success: true, userId };
    }),

  tutoringRelationships: adminProcedure.query(async () => getAllTutoringRelationships()),

  assignTutor: adminProcedure
    .input(z.object({ tutorId: z.number(), studentId: z.number(), subjects: z.string(), level: z.string() }))
    .mutation(async ({ input }) => {
      const id = await createTutoringRelationship({
        tutorId: input.tutorId,
        studentId: input.studentId,
        subjects: input.subjects,
        level: input.level,
        status: 'active',
      });

      // Send assignment emails to Tutor, Student, and Parent
      try {
        const tutor = await getUserById(input.tutorId);
        const student = await getUserById(input.studentId);
        const parents = await getLinkedParentsForStudent(input.studentId);

        if (tutor && student) {
          const assignmentData = {
            studentName: student.name || "Student",
            tutorName: tutor.name || "Tutor",
            subjects: input.subjects,
            level: input.level,
          };

          // To Tutor
          await sendAssignmentEmail({
            recipientName: tutor.name || "Tutor",
            recipientEmail: tutor.email!,
            role: "tutor",
            ...assignmentData,
          }).catch(e => console.error("[Email] Tutor assignment failed:", e));

          // To Student
          await sendAssignmentEmail({
            recipientName: student.name || "Student",
            recipientEmail: student.email!,
            role: "student",
            ...assignmentData,
          }).catch(e => console.error("[Email] Student assignment failed:", e));

          // To Parents
          for (const parent of parents) {
            await sendAssignmentEmail({
              recipientName: parent.name || "Parent",
              recipientEmail: parent.email!,
              role: "parent",
              ...assignmentData,
            }).catch(e => console.error("[Email] Parent assignment failed:", e));
          }
        }
      } catch (e) {
        console.error("[Admin] Failed to coordinate assignment emails:", e);
      }

      return { success: true, id };
    }),

  tutors: adminProcedure.query(async () => {
    const all = await getAllUsers();
    return all.filter(u => u.role === 'tutor' || u.approvedAsTutor === 1);
  }),

  students: adminProcedure.query(async () => {
    const all = await getAllUsers();
    return all.filter(u => u.role === 'user' || u.accountType === 'student');
  }),

  getUserProfile: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      return user;
    }),

  tutorApplications: adminProcedure.query(async () => getAllTutorApplications()),

  updateTutorApplicationStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "reviewing", "interview", "accepted", "rejected"]) }))
    .mutation(async ({ input }) => {
      await updateTutorApplicationStatus(input.id, input.status);
      
      // Send status change email if status changed to interview, accepted, or rejected
      if (["interview", "accepted", "rejected"].includes(input.status)) {
        const db = await getDb();
        if (db) {
          const apps = await db.select().from(tutorApplications).where(eq(tutorApplications.id, input.id));
          if (apps.length > 0) {
            await sendTutorApplicationStatusChange({
              applicantName: apps[0].firstName,
              applicantEmail: apps[0].email,
              status: input.status as "accepted" | "rejected" | "interview",
            }).catch((e) => console.error("[Email] Tutor status email failed:", e));
          }
        }
      }
      
      return { success: true };
    }),

  // ─── Admin/Parent/Tutor/Student: view any user's full dashboard data ───────────────────────────
  getUserDashboard: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      const user = await getUserById(input.userId);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      // ─── Access Control ──────────────────────────────────────────────────
      if (ctx.user.role !== 'admin' && ctx.user.id !== input.userId) {
        if (ctx.user.role === 'parent') {
          const children = await getLinkedChildrenForParent(ctx.user.id);
          if (!children.some(c => c.id === input.userId)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not linked to this student' });
          }
        } else if (ctx.user.role === 'tutor') {
          const relationships = await getTutoringRelationshipsByTutorId(ctx.user.id);
          if (!relationships.some(r => r.studentId === input.userId)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not linked to this student' });
          }
        } else if (ctx.user.role === 'user') {
          const relationships = await getTutoringRelationshipsByStudentId(ctx.user.id);
          if (!relationships.some(r => r.tutorId === input.userId)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not linked to this tutor' });
          }
        } else {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
        }
      }
      // ────────────────────────────────────────────────────────────────────

      const [sessions, relationships, orders, feedbackRec] = await Promise.all([
        getTutoringSessionsByStudentId(input.userId),
        getTutoringRelationshipsByStudentId(input.userId),
        getOrdersByUserId(input.userId).then(async (byId) => {
          if (byId.length > 0) return byId;
          if (user.email) return getOrdersByEmail(user.email);
          return [];
        }),
        getFeedbackReceivedByUser(input.userId),
      ]);

      const tutorRelationships = await getTutoringRelationshipsByTutorId(input.userId);
      const tutorSessionsData = await getTutoringSessionsByTutorId(input.userId);

      // Enrich relationships with user data
      const enrichedStudentRels = await Promise.all(
        relationships.map(async (rel) => {
          const tutor = await getUserById(rel.tutorId);
          return { ...rel, tutor };
        })
      );

      const enrichedTutorRels = await Promise.all(
        tutorRelationships.map(async (rel) => {
          const student = await getUserById(rel.studentId);
          return { ...rel, student };
        })
      );

      // Parent data
      let linkedChildren: { id: number; name: string | null; email: string | null; accountType: string | null }[] = [];
      let linkedParents: { id: number; name: string | null; email: string | null; accountType: string | null }[] = [];
      
      if (user.role === 'parent' || user.accountType === 'parent') {
        linkedChildren = await getLinkedChildrenForParent(input.userId);
      } else {
        // For students, fetch their linked parents
        linkedParents = await getLinkedParentsForStudent(input.userId);
      }

      // Children data for parent
      const childrenData = await Promise.all(
        linkedChildren.map(async (child) => {
          const [childSessions, childTutors] = await Promise.all([
            getTutoringSessionsByStudentId(child.id),
            getTutoringRelationshipsByStudentId(child.id).then(async (rels) =>
              Promise.all(rels.map(async (rel) => ({ ...rel, tutor: await getUserById(rel.tutorId) })))
            ),
          ]);
          return { child, sessions: childSessions, tutors: childTutors };
        })
      );

      return {
        user,
        // Student view
        studentSessions: sessions,
        studentRelationships: enrichedStudentRels,
        // Tutor view
        tutorSessions: tutorSessionsData,
        tutorRelationships: enrichedTutorRels,
        feedbackReceived: feedbackRec,
        // Parent view
        linkedChildren,
        childrenData,
        // Shared
        orders,
        linkedParents,
      };
    }),

  messages: adminProcedure.query(async () => getAllContactMessages()),

  updateMessageStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "read", "replied"]) }))
    .mutation(async ({ input }) => {
      await updateContactStatus(input.id, input.status);
      return { success: true };
    }),

  earnings: adminProcedure.query(async () => {
    const allOrders = await getAllOrders();
    const paidOrders = allOrders.filter(o => o.status === 'paid');
    const now = new Date();
    const months: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      const monthOrders = paidOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
      });
      months.push({ label, revenue: monthOrders.reduce((s, o) => s + o.amountTotal, 0), orders: monthOrders.length });
    }
    const packageMap: Record<string, { revenue: number; orders: number }> = {};
    for (const o of paidOrders) {
      const key = o.packageName || 'Unknown';
      if (!packageMap[key]) packageMap[key] = { revenue: 0, orders: 0 };
      packageMap[key].revenue += o.amountTotal;
      packageMap[key].orders += 1;
    }
    const byPackage = Object.entries(packageMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = paidOrders.reduce((s, o) => s + o.amountTotal, 0);
    const now30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentRevenue = paidOrders.filter(o => new Date(o.createdAt) >= now30).reduce((s, o) => s + o.amountTotal, 0);
    return { totalRevenue, recentRevenue, totalOrders: paidOrders.length, months, byPackage, recentOrders: paidOrders.filter(o => new Date(o.createdAt) >= now30).length };
  }),
});

// ─── Tutoring router ──────────────────────────────────────────────────────────
const tutoringRouter = router({
  myStudents: tutorProcedure.query(async ({ ctx }) => {
    const relationships = await getTutoringRelationshipsByTutorId(ctx.user.id);
    const students = await Promise.all(
      relationships.map(async (rel) => {
        const student = await getUserById(rel.studentId);
        return { ...rel, student };
      })
    );
    return students;
  }),

  myTutors: studentProcedure.query(async ({ ctx }) => {
    const relationships = await getTutoringRelationshipsByStudentId(ctx.user.id);
    const tutors = await Promise.all(
      relationships.map(async (rel) => {
        const tutor = await getUserById(rel.tutorId);
        return { ...rel, tutor };
      })
    );
    return tutors;
  }),

  createRelationship: adminProcedure
    .input(z.object({ tutorId: z.number(), studentId: z.number(), subjects: z.string(), level: z.string() }))
    .mutation(async ({ input }) => {
      const id = await createTutoringRelationship({
        tutorId: input.tutorId,
        studentId: input.studentId,
        subjects: input.subjects,
        level: input.level,
        status: 'active',
      });
      return { success: true, id };
    }),

  updateRelationshipStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(['active', 'paused', 'completed']) }))
    .mutation(async ({ input, ctx }) => {
      const rels = await getTutoringRelationshipsByTutorId(ctx.user.id);
      if (!rels.find(r => r.id === input.id) && ctx.user.role !== 'admin') {
        throw new Error('Forbidden');
      }
      await updateTutoringRelationshipStatus(input.id, input.status);
      return { success: true };
    }),
});

// ─── Session router ───────────────────────────────────────────────────────────
const sessionRouter = router({
  tutorSessions: tutorProcedure.query(async ({ ctx }) => {
    return getTutoringSessionsByTutorId(ctx.user.id);
  }),

  studentSessions: studentProcedure.query(async ({ ctx }) => {
    return getTutoringSessionsByStudentId(ctx.user.id);
  }),

  createSession: protectedProcedure
    .input(z.object({ relationshipId: z.number(), studentId: z.number(), subject: z.string(), scheduledAt: z.date(), duration: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Access check: User must be the tutor, the student, or the student's parent
      const isTutor = ctx.user.role === "tutor";
      const isStudent = ctx.user.id === input.studentId;
      const parents = await getLinkedParentsForStudent(input.studentId);
      const isParent = parents.some(p => p.id === ctx.user.id);

      if (!isTutor && !isStudent && !isParent) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized to book for this student." });
      }

      // Credit check (1 credit = 1 hour)
      const creditCost = input.duration / 60;
      const balanceObj = await getCreditBalance(input.studentId);
      if (balanceObj.balance < creditCost) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient credits. This session requires ${creditCost} credits, but the student only has ${balanceObj.balance}.` });
      }

      // Deduct credits
      await updateCreditBalance(
        input.studentId, 
        -creditCost, 
        "usage", 
        `Session: ${input.subject} (${input.duration} min)`,
      );

      // Get tutor ID if not the one booking
      let tutorId = ctx.user.id;
      if (!isTutor) {
        const db = await getDb();
        if (db) {
          const rels = await db.select().from(tutoringRelationships).where(eq(tutoringRelationships.id, input.relationshipId)).limit(1);
          if (rels[0]) tutorId = rels[0].tutorId;
        }
      }

      const id = await createTutoringSession({
        relationshipId: input.relationshipId,
        tutorId: tutorId,
        studentId: input.studentId,
        subject: input.subject,
        scheduledAt: input.scheduledAt,
        duration: input.duration,
        status: isTutor ? "scheduled" : "pending", // Student/Parent bookings are pending tutor approval
      });

      // Link transaction to session
      const db = await getDb();
      if (db) {
        const lastTx = (await getCreditTransactionsByUserId(input.studentId))[0];
        if (lastTx) {
          await db.update(creditTransactions).set({ sessionId: id }).where(eq(creditTransactions.id, lastTx.id));
        }
      }

      // Notify relevant parties
      try {
        const student = await getUserById(input.studentId);
        const tutor = await getUserById(tutorId);
        
        if (student && tutor) {
          if (isTutor) {
            // Tutor scheduled: Notify parents
            for (const parent of parents) {
              if (parent?.email) {
                sendParentSessionNotification({
                  parentName: parent.name || 'Parent',
                  parentEmail: parent.email,
                  studentName: student.name || 'Your child',
                  subject: input.subject,
                  scheduledAt: input.scheduledAt,
                  duration: input.duration,
                  tutorName: tutor.name || undefined,
                }).catch((e) => console.error('[Email] Parent session notification failed:', e));
              }
            }
          } else {
            // Student/Parent booked: Notify Tutor for approval
            // (Tutor will see this in their pending sessions tab)
          }
        }
      } catch (e) {
        console.error("[Session] Failed to coordinate notifications:", e);
      }

      return { success: true, id };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ 
      id: z.number(), 
      status: z.enum(['pending', 'scheduled', 'completed', 'cancelled', 'no-show', 'proposed']), 
      notes: z.string().optional(),
      proposalMessage: z.string().optional(),
      scheduledAt: z.date().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Fetch session for validation
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const sessions = await db.select().from(tutoringSessions).where(eq(tutoringSessions.id, input.id)).limit(1);
      if (sessions.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      const session = sessions[0];

      // Access check
      const isTutor = ctx.user.role === "tutor" && ctx.user.id === session.tutorId;
      const isStudent = ctx.user.id === session.studentId;
      const parents = await getLinkedParentsForStudent(session.studentId);
      const isParent = parents.some(p => p.id === ctx.user.id);

      if (!isTutor && !isStudent && !isParent) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      // Logic for status transitions
      if (input.status === 'scheduled' && isTutor && session.status === 'pending') {
        // Tutor accepts a pending booking
        await updateTutoringSessionStatus(input.id, 'scheduled');
        // Notify Student
        const student = await getUserById(session.studentId);
        const tutor = await getUserById(session.tutorId);
        if (student && tutor) {
          await sendSessionUpdateEmail({
            recipientName: student.name || "Student",
            recipientEmail: student.email!,
            type: "accepted",
            studentName: student.name || "Student",
            tutorName: tutor.name || "Tutor",
            subject: session.subject,
            scheduledAt: session.scheduledAt,
          });
        }
      } else if (input.status === 'proposed' && isTutor) {
        // Tutor proposes new time
        if (!input.scheduledAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Proposed time is required" });
        await updateTutoringSessionStatus(input.id, 'proposed', undefined, input.proposalMessage, input.scheduledAt);
        // Notify Student
        const student = await getUserById(session.studentId);
        const tutor = await getUserById(session.tutorId);
        if (student && tutor) {
          await sendSessionUpdateEmail({
            recipientName: student.name || "Student",
            recipientEmail: student.email!,
            type: "proposed",
            studentName: student.name || "Student",
            tutorName: tutor.name || "Tutor",
            subject: session.subject,
            scheduledAt: input.scheduledAt,
            message: input.proposalMessage,
          });
        }
      } else if (input.status === 'cancelled') {
        // Refund credits if session was scheduled/pending
        if (session.status === 'scheduled' || session.status === 'pending' || session.status === 'proposed') {
          const creditCost = session.duration / 60;
          await updateCreditBalance(session.studentId, creditCost, "refund", `Refund: Cancelled session ${session.subject}`);
        }
        await updateTutoringSessionStatus(input.id, 'cancelled', input.notes);
      } else {
        await updateTutoringSessionStatus(input.id, input.status, input.notes);
      }

      return { success: true };
    }),

  cancelSession: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const sessions = await db.select().from(tutoringSessions).where(eq(tutoringSessions.id, input.id));
      if (!sessions || sessions.length === 0) throw new Error("Session not found");
      
      const sess = sessions[0];
      if (sess.studentId !== ctx.user.id && sess.tutorId !== ctx.user.id) {
        throw new Error("Unauthorized: you cannot cancel this session");
      }
      
      const now = new Date();
      const scheduledTime = new Date(sess.scheduledAt);
      const daysUntilSession = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilSession < 0) {
        throw new Error("Cannot cancel a session that has already passed");
      }
      
      await updateTutoringSessionStatus(input.id, 'cancelled', input.reason || 'Cancelled by user');
      
      const tutor = await getUserById(sess.tutorId);
      const student = await getUserById(sess.studentId);
      
      if (student?.email) {
        await sendSessionCancellationNotice({
          recipientName: student.name || 'Student',
          recipientEmail: student.email,
          otherPartyName: tutor?.name || 'Your Tutor',
          subject: sess.subject,
          scheduledAt: sess.scheduledAt,
          reason: input.reason,
        }).catch(err => console.error('[Email] Failed to send cancellation notice to student:', err));
      }
      
      if (tutor?.email) {
        await sendSessionCancellationNotice({
          recipientName: tutor.name || 'Tutor',
          recipientEmail: tutor.email,
          otherPartyName: student?.name || 'Your Student',
          subject: sess.subject,
          scheduledAt: sess.scheduledAt,
          reason: input.reason,
        }).catch(err => console.error('[Email] Failed to send cancellation notice to tutor:', err));
      }
      
      if (daysUntilSession < 7) {
        return { success: true, message: "Session cancelled. Note: cancellations within 7 days may affect your booking privileges." };
      } else {
        return { success: true, message: "Session cancelled successfully." };
      }
    }),

  rescheduleSession: protectedProcedure
    .input(z.object({ id: z.number(), newScheduledAt: z.date() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const sessions = await db.select().from(tutoringSessions).where(eq(tutoringSessions.id, input.id));
      if (!sessions || sessions.length === 0) throw new Error("Session not found");
      
      const sess = sessions[0];
      if (sess.studentId !== ctx.user.id && sess.tutorId !== ctx.user.id) {
        throw new Error("Unauthorized: you cannot reschedule this session");
      }
      
      const now = new Date();
      const scheduledTime = new Date(sess.scheduledAt);
      const daysUntilSession = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilSession < 0) {
        throw new Error("Cannot reschedule a session that has already passed");
      }
      
      if (daysUntilSession < 7) {
        throw new Error("Sessions can only be rescheduled more than 7 days in advance. Please contact support for urgent changes.");
      }
      
      const daysUntilNewSession = (input.newScheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilNewSession < 7) {
        throw new Error("New session must be scheduled at least 7 days in advance");
      }
      
      await db.update(tutoringSessions).set({ scheduledAt: input.newScheduledAt }).where(eq(tutoringSessions.id, input.id));
      
      const tutor = await getUserById(sess.tutorId);
      const student = await getUserById(sess.studentId);
      
      if (student?.email) {
        await sendSessionReminder({
          studentName: student.name || 'Student',
          studentEmail: student.email,
          tutorName: tutor?.name || 'Your Tutor',
          subject: sess.subject,
          scheduledAt: input.newScheduledAt,
        }).catch(err => console.error('[Email] Failed to send reschedule reminder:', err));
      }
      
      return { success: true, message: "Session rescheduled successfully." };
    }),
});

// ─── Feedback router ──────────────────────────────────────────────────────────
const feedbackRouter = router({
  received: protectedProcedure.query(async ({ ctx }) => {
    const items = await getFeedbackReceivedByUser(ctx.user.id);
    return Promise.all(
      items.map(async (item) => {
        const fromUser = await getUserById(item.fromUserId);
        return { ...item, fromUser: fromUser ? { id: fromUser.id, name: fromUser.name } : null };
      })
    );
  }),

  forSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return getFeedbackForSession(input.sessionId);
    }),

  submit: protectedProcedure
    .input(z.object({ sessionId: z.number(), toUserId: z.number(), rating: z.number().min(1).max(5), comment: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const id = await createFeedback({
        sessionId: input.sessionId,
        fromUserId: ctx.user.id,
        toUserId: input.toUserId,
        rating: input.rating,
        comment: input.comment,
      });
      return { success: true, id };
    }),
});

// ─── Parent router ──────────────────────────────────────────────────────────
const parentRouter = router({
  myChildren: parentProcedure.query(async ({ ctx }) => {
    return getLinkedChildrenForParent(ctx.user.id);
  }),

  sendLinkRequest: parentProcedure
    .input(z.object({ studentEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const result = await createParentLinkRequest(ctx.user.id, input.studentEmail);
      try {
        await sendParentLinkCode({
          studentName: result.studentName || "Student",
          studentEmail: result.studentEmail || input.studentEmail,
          parentName: ctx.user.name || "A parent",
          confirmCode: result.confirmCode,
        });
      } catch (e) {
        console.error("[Parent Link] Failed to send code email:", e);
      }
      return { success: true, studentName: result.studentName };
    }),

  confirmLink: parentProcedure
    .input(z.object({ code: z.string().min(6).max(6) }))
    .mutation(async ({ input, ctx }) => {
      const result = await confirmLinkByCode(ctx.user.id, input.code);
      return result;
    }),

  childData: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const children = await getLinkedChildrenForParent(ctx.user.id);
      const isLinked = children.some((c) => c.id === input.studentId);
      if (!isLinked) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not linked to this student' });
      const [sessions, tutors] = await Promise.all([
        getTutoringSessionsByStudentId(input.studentId),
        getTutoringRelationshipsByStudentId(input.studentId),
      ]);
      const tutorsEnriched = await Promise.all(
        tutors.map(async (rel) => {
          const tutor = await getUserById(rel.tutorId);
          return { ...rel, tutor };
        })
      );
      return { sessions, tutors: tutorsEnriched };
    }),

  requestLink: parentProcedure
    .input(z.object({ studentEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const result = await createParentLinkRequest(ctx.user.id, input.studentEmail);
      return { success: true, ...result };
    }),

  myChild: parentProcedure.query(async ({ ctx }) => {
    const student = await getLinkedStudentForParent(ctx.user.id);
    if (!student) return null;
    const [sessions, tutors] = await Promise.all([
      getTutoringSessionsByStudentId(student.id),
      getTutoringRelationshipsByStudentId(student.id),
    ]);
    const tutorsEnriched = await Promise.all(
      tutors.map(async (rel) => {
        const tutor = await getUserById(rel.tutorId);
        return { ...rel, tutor };
      })
    );
    return { student, sessions, tutors: tutorsEnriched };
  }),

  pendingRequests: protectedProcedure.query(async ({ ctx }) => {
    return getPendingLinkRequestsForStudent(ctx.user.id);
  }),

  respondToRequest: protectedProcedure
    .input(z.object({ requestId: z.number(), accept: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      return respondToLinkRequest(input.requestId, ctx.user.id, input.accept);
    }),
});

// ─── Tutor profile router ─────────────────────────────────────────────────────
const tutorProfileRouter = router({
  update: tutorProcedure
    .input(z.object({
      bio: z.string().optional(),
      linkedin: z.string().url().optional().or(z.literal('')),
      tutorSubjects: z.string().optional(),
      tutorLevel: z.string().optional(),
      tutorUniversity: z.string().optional(),
      tutorCourse: z.string().optional(),
      profilePhotoUrl: z.string().optional(),
      bankAccountName: z.string().optional(),
      bankSortCode: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      bankPaypalEmail: z.string().email().optional().or(z.literal('')),
    }))
    .mutation(async ({ input, ctx }) => {
      await updateTutorProfile(ctx.user.id, input);
      return { success: true };
    }),

  get: protectedProcedure
    .input(z.object({ tutorId: z.number() }))
    .query(async ({ input }) => {
      const tutor = await getUserById(input.tutorId);
      if (!tutor) throw new Error('Tutor not found');
      return {
        id: tutor.id,
        name: tutor.name,
        bio: tutor.bio,
        linkedin: tutor.linkedin,
        tutorSubjects: tutor.tutorSubjects,
        tutorLevel: tutor.tutorLevel,
        tutorUniversity: tutor.tutorUniversity,
        tutorCourse: tutor.tutorCourse,
        profilePhotoUrl: tutor.profilePhotoUrl,
      };
    }),
});

// ─── Calendar router ─────────────────────────────────────────────────────────
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
        end: addHours(new Date(s.scheduledAt), s.duration / 60),
      }));
    }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await clearUserCalendarConnection(ctx.user.id);
    return { success: true };
  }),

  tutorAvailability: protectedProcedure
    .input(z.object({ tutorId: z.number() }))
    .query(async ({ input }) => {
      const tutor = await getUserById(input.tutorId);
      if (!tutor?.googleRefreshToken || !tutor.calendarSyncEnabled) {
        return { slots: [], connected: false };
      }
      try {
        const { google } = await import('googleapis');
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
        );
        oauth2Client.setCredentials({ refresh_token: tutor.googleRefreshToken });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const now = new Date();
        const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const freeBusy = await calendar.freebusy.query({
          requestBody: {
            timeMin: now.toISOString(),
            timeMax: twoWeeks.toISOString(),
            items: [{ id: tutor.googleCalendarId || 'primary' }],
          },
        });
        const busySlots = freeBusy.data.calendars?.[tutor.googleCalendarId || 'primary']?.busy ?? [];
        const slots: { start: string; end: string }[] = [];
        for (let day = 0; day < 14; day++) {
          const base = new Date(now);
          base.setDate(base.getDate() + day);
          const dow = base.getDay();
          if (dow === 0) continue;
          for (let hour = 9; hour <= 18; hour++) {
            const slotStart = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 0, 0);
            if (slotStart <= now) continue;
            const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
            const isBusy = busySlots.some(b => {
              const bs = new Date(b.start!);
              const be = new Date(b.end!);
              return slotStart < be && slotEnd > bs;
            });
            if (!isBusy) slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
          }
        }
        return { slots: slots.slice(0, 60), connected: true };
      } catch (e) {
        console.error('[Calendar] tutorAvailability error:', e);
        return { slots: [], connected: false };
      }
    }),
});

// ─── Storage router ───────────────────────────────────────────────────────────
const storageRouter = router({
  upload: protectedProcedure
    .input(z.object({ filename: z.string(), contentType: z.string(), base64: z.string() }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const key = `uploads/${Date.now()}-${input.filename}`;
      const { key: storedKey, url } = await storagePut(key, buffer, input.contentType);
      return { key: storedKey, url };
    }),
});

// ─── Referral router ─────────────────────────────────────────────────────────
const referralRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    let user = await getUserById(ctx.user.id);
    if (!user) throw new Error("User not found");

    if (!user.referralCode) {
      const code = `OAK-${ctx.user.id}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await updateUserReferralCode(ctx.user.id, code);
      user.referralCode = code;
    }

    const rewards = await getPendingRewardsForUser(ctx.user.id);
    return {
      referralCode: user.referralCode,
      pendingRewards: rewards,
    };
  }),
});

// ─── Credit router ─────────────────────────────────────────────────────────
const creditRouter = router({
  balance: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Allow the user to query their own balance, admin to query any, or parent to view linked child
      if (ctx.user.id !== input.userId && ctx.user.role !== 'admin') {
        if (ctx.user.role === 'parent') {
          const children = await getLinkedChildrenForParent(ctx.user.id);
          const isLinked = children.some((c) => c.id === input.userId);
          if (!isLinked) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not linked to this student' });
        } else {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot view another user\'s credit balance' });
        }
      }
      return getCreditBalance(input.userId);
    }),
  history: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.id !== input.userId && ctx.user.role !== 'admin') {
        if (ctx.user.role === 'parent') {
          const children = await getLinkedChildrenForParent(ctx.user.id);
          const isLinked = children.some((c) => c.id === input.userId);
          if (!isLinked) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not linked to this student' });
        } else {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot view another user\'s credit history' });
        }
      }
      return getCreditTransactionsByUserId(input.userId);
    }),
  addCredits: protectedProcedure
    .input(z.object({
      userId: z.number(),
      amount: z.number().positive(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can manually add credits' });
      }
      await updateCreditBalance(input.userId, input.amount, 'adjustment', input.description || 'Admin credit adjustment');
      return { success: true };
    }),
});
// ─── App router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  calendar: calendarRouter,
  storage: storageRouter,
  referral: referralRouter,
  parent: parentRouter,
  credit: creditRouter,
  tutorProfile: tutorProfileRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          referralCode: z.string().optional(),
          accountType: z.enum(['student', 'parent']).optional().default('student'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || ctx.req.socket?.remoteAddress || "unknown";
        authLimiter.check(ip);
        const ADMIN_EMAIL = "team@oakscholars.com";
        const existing = await getUserByEmail(input.email);
        if (existing) throw new Error("An account with this email already exists");
        
        const passwordHash = await bcrypt.hash(input.password, 12);
        const role = input.email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user";
        const user = await createUserWithPassword({
          name: input.name,
          email: input.email,
          passwordHash,
          role,
          accountType: input.accountType,
        });

        if (input.referralCode) {
          const referrer = await getUserByReferralCode(input.referralCode);
          if (referrer && referrer.id !== user.id) {
            await createReferral({
              referrerId: referrer.id,
              refereeId: user.id,
              status: "pending",
            });
          }
        }

        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || ctx.req.socket?.remoteAddress || "unknown";
        authLimiter.check(ip);
        const ADMIN_EMAIL = "team@oakscholars.com";
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) throw new Error("Invalid email or password");
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) throw new Error("Invalid email or password");
        if (input.email.toLowerCase() === ADMIN_EMAIL && user.role !== "admin") {
          await updateUserRole(user.id, "admin");
        }
        // Generate 6-digit OTP and send it
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await setLoginOtp(user.id, code, expiresAt);
        try {
          await sendLoginOtp({ name: user.name || "", email: user.email || "", code });
        } catch (e) {
          console.error("[Login OTP] Failed to send email:", e);
        }
        return { success: true, requiresOtp: true, email: user.email };
      }),

    verifyLoginOtp: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          code: z.string().length(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        if (!user.loginOtpCode || !user.loginOtpExpiresAt) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No verification code found. Please sign in again." });
        }
        if (new Date() > new Date(user.loginOtpExpiresAt)) {
          await clearLoginOtp(user.id);
          throw new TRPCError({ code: "BAD_REQUEST", message: "Verification code has expired. Please sign in again." });
        }
        if (user.loginOtpCode !== input.code) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect verification code." });
        }
        await clearLoginOtp(user.id);
        await updateUserLastSignedIn(user.id);
        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
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
