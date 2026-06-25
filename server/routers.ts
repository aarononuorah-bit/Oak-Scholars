import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { aiRouter } from "./ai";
import { notifyOwner } from "./_core/notification";
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

// ─── Booking router ───────────────────────────────────────────────────────────
const bookingRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
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
        content: `Subject: ${input.subject} | Level: ${input.level} | Session: ${input.sessionType} | Time: ${input.preferredTime}\nEmail: ${input.email}${input.phone ? ` | Phone: ${input.phone}` : ""}${input.message ? `\nNote: ${input.message}` : ""}`,
      });
      Promise.all([
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
        subject: z.string().min(1),
        message: z.string().min(10),
      })
    )
    .mutation(async ({ input }) => {
      await createContactMessage(input);
      await notifyOwner({
        title: `New Contact Message — ${input.name}`,
        content: `Subject: ${input.subject}\nFrom: ${input.email}\n\n${input.message}`,
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
        phone: z.string().optional(),
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
        content: `University: ${input.university} | Degree: ${input.degreeSubject} | Year: ${input.yearOfStudy}\nSubjects: ${input.subjects}\nEmail: ${input.email}`,
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
  payments: paymentsRouter,
  banners: bannersRouter,
  push: pushRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;
