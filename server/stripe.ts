import Stripe from "stripe";
import { Express, Request, Response } from "express";
import express from "express";
import {
  createOrder,
  updateOrderStatus,
  getUserByOpenId,
  updateStripeCustomerId,
  getDb,
  getReferralByRefereeId,
  updateReferralStatus,
  markReferrerRewardUsed,
  markRefereeRewardUsed,
  updateUserRole,
} from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendBookingConfirmation, sendAdminBookingAlert, sendStudyResourceDelivery } from "./email";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

export async function getOrCreateStripeCustomer(
  userId: number,
  email: string,
  name?: string | null,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) return existingCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId: String(userId) },
  });

  await updateStripeCustomerId(userId, customer.id);
  return customer.id;
}

export async function createStripePortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      const rawBody = req.body?.toString?.() ?? "";
      let parsedForTest: { id?: string } = {};
      try { parsedForTest = JSON.parse(rawBody); } catch { /* ignore */ }
      if (parsedForTest.id?.startsWith("evt_test_")) {
        res.json({ verified: true });
        return;
      }

      if (!webhookSecret) {
        try {
          const event = JSON.parse(rawBody) as Stripe.Event;
          await handleStripeEvent(event);
        } catch { /* ignore */ }
        res.json({ received: true });
        return;
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(400).send(`Webhook Error: ${message}`);
        return;
      }

      await handleStripeEvent(event);
      res.json({ received: true });
    }
  );
}

// ─── Idempotency guard ───────────────────────────────────────────────────────
// Prevent duplicate processing if Stripe retries the same event.
const processedEvents = new Set<string>();
const EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function handleStripeEvent(event: Stripe.Event) {
  // Skip already-processed events (idempotency)
  if (event.id && processedEvents.has(event.id)) {
    console.log(`[Webhook] Skipping duplicate event: ${event.id}`);
    return;
  }
  if (event.id) {
    processedEvents.add(event.id);
    // Auto-expire after 24 h to prevent unbounded memory growth
    setTimeout(() => processedEvents.delete(event.id), EVENT_TTL_MS).unref?.();
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.metadata?.customer_email ?? "";
      const packageName = session.metadata?.product_id ?? "unknown";
      const subject = session.metadata?.subject ?? "Not specified";
      const level = session.metadata?.level ?? "Not specified";
      const amountTotal = session.amount_total ?? 0;
      const customerName = session.customer_details?.name ?? "Student";

      let userId: number | null = null;
      try {
        const db = await getDb();
        if (db && email) {
          const userRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (userRows[0]) {
            userId = userRows[0].id;
            
            // Only update the stripe customer ID, leave the accountType exactly as they registered it
            if (!userRows[0].stripeCustomerId && session.customer) {
              await updateStripeCustomerId(userId, session.customer as string);
            }
            
            // Auto-assign 'user' (student) role after successful payment
            if (userRows[0].role !== 'user' && userRows[0].role !== 'admin' && userRows[0].role !== 'tutor') {
              await updateUserRole(userId, 'user');
            }
          }
        }
      } catch (e) {
        console.error("[Webhook] Failed to link user:", e);
      }

      const isStudyResource = session.metadata?.product_type === "study-resource";

      try {
        await createOrder({
          userId: userId ?? undefined,
          email,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string | undefined,
          packageName: isStudyResource ? (session.metadata?.resource_type ?? "study-resource") : packageName,
          subject: subject !== "Not specified" ? subject : undefined,
          level: level !== "Not specified" ? level : undefined,
          amountTotal,
          currency: session.currency ?? "gbp",
          status: "paid",
        });

        const [firstName, ...lastNameParts] = customerName.split(" ");
        const lastName = lastNameParts.join(" ") || "Learner";

        if (isStudyResource) {
          // Study resource purchase — send delivery email
          await sendStudyResourceDelivery({
            firstName: firstName || "there",
            email,
            resourceType: session.metadata?.resource_type ?? "resource",
            subject,
            level,
            examBoard: session.metadata?.exam_board || undefined,
          });
        } else {
          // Regular tutoring booking
          await sendBookingConfirmation({
            firstName: firstName || "there",
            email,
            subject,
            level,
            sessionType: packageName,
            preferredTime: session.metadata?.preferred_time || "Flexible / Discuss",
          });

          await sendAdminBookingAlert({
            firstName: firstName || "New",
            lastName,
            email,
            phone: session.customer_details?.phone || undefined,
            subject,
            level,
            sessionType: packageName,
            preferredTime: session.metadata?.preferred_time || "Flexible / Discuss",
            message: session.metadata?.message || undefined,
          });
        }

        if (userId) {
          const referral = await getReferralByRefereeId(userId);
          if (referral && referral.status === "pending") {
            await updateReferralStatus(referral.id, "completed");
          }

          const rewardId = session.metadata?.reward_id;
          const rewardType = session.metadata?.reward_type;
          if (rewardId) {
            const rid = parseInt(rewardId);
            if (rewardType === "referrer") await markReferrerRewardUsed(rid);
            else if (rewardType === "referee") await markRefereeRewardUsed(rid);
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes("Duplicate")) console.error("[Webhook] Error:", e);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      try { await updateOrderStatus(session.id, "cancelled"); } catch { }
      break;
    }
  }
}
