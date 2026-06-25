import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
} from "./email";
import { storagePut } from "./storage";
import { sendPushToAll, getVapidPublicKey } from "./push";
import {
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
} from "./db";
import { stripe, getOrCreateStripeCustomer, createStripePortalSession } from "./stripe";
import { PRODUCTS } from "./products";

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
          // Default to tomorrow 10am if we can't parse a specific date/time from the free-text input
          // In a real scenario, we'd use LLM or more structured input to get exact start/end
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

  list: adminProcedure.query(async () => getAllBookings()),

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
    .mutation(async ({ input }) => {
      await createContactMessage({ name: input.name, email: input.email, subject: input.subject, message: input.message });
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
      })
    )
    .mutation(async ({ input }) => {
      const product = PRODUCTS.find((p) => p.id === input.productId);
      if (!product) throw new Error("Invalid product");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Oak Scholars — ${product.name}`,
                description: product.description,
              },
              unit_amount: product.priceInPence,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        allow_promotion_codes: true,
        customer_email: input.customerEmail,
        client_reference_id: input.customerEmail ?? undefined,
        metadata: {
          product_id: input.productId,
          customer_email: input.customerEmail ?? "",
          customer_name: input.customerName ?? "",
        },
        success_url: `${input.origin}/booking?payment=success`,
        cancel_url: `${input.origin}/booking?payment=cancelled`,
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
    // Try by userId first, fall back to email
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

    // Recent activity feed (last 7 days, mixed)
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

  createSession: tutorProcedure
    .input(z.object({ relationshipId: z.number(), studentId: z.number(), subject: z.string(), scheduledAt: z.date(), duration: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const id = await createTutoringSession({
        relationshipId: input.relationshipId,
        tutorId: ctx.user.id,
        studentId: input.studentId,
        subject: input.subject,
        scheduledAt: input.scheduledAt,
        duration: input.duration,
        status: 'scheduled',
      });
      return { success: true, id };
    }),

  updateStatus: tutorProcedure
    .input(z.object({ id: z.number(), status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      await updateTutoringSessionStatus(input.id, input.status, input.notes);
      return { success: true };
    }),
});

// ─── Feedback router ──────────────────────────────────────────────────────────
const feedbackRouter = router({
  received: protectedProcedure.query(async ({ ctx }) => {
    return getFeedbackReceivedByUser(ctx.user.id);
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

// ─── App router ───────────────────────────────────────────────────────────────

// ─── App router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
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
