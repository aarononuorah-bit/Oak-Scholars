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
} from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

// ─── Stripe Customer helpers ──────────────────────────────────────────────────

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

// ─── Webhook registration ─────────────────────────────────────────────────────

export function registerStripeWebhook(app: Express) {
  // MUST be registered BEFORE express.json() — uses raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      // Test event detection (required by Stripe test mode)
      const rawBody = req.body?.toString?.() ?? "";
      let parsedForTest: { id?: string } = {};
      try { parsedForTest = JSON.parse(rawBody); } catch { /* ignore */ }
      if (parsedForTest.id?.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }

      if (!webhookSecret) {
        // No secret configured — still try to parse and persist
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
        console.error("[Webhook] Signature verification failed:", message);
        res.status(400).send(`Webhook Error: ${message}`);
        return;
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);
      await handleStripeEvent(event);
      res.json({ received: true });
    }
  );
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.metadata?.customer_email ?? "";
      const packageName = session.metadata?.product_id ?? "unknown";
      const subject = session.metadata?.subject ?? null;
      const level = session.metadata?.level ?? null;
      const amountTotal = session.amount_total ?? 0;

      // Try to link to a user account by email
      let userId: number | null = null;
      try {
        const db = await getDb();
        if (db && email) {
          const userRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (userRows[0]) {
            userId = userRows[0].id;
            // Save Stripe customer ID if not already stored
            if (!userRows[0].stripeCustomerId && session.customer) {
              await updateStripeCustomerId(userId, session.customer as string);
            }
          }
        }
      } catch (e) {
        console.error("[Webhook] Failed to link user:", e);
      }

      try {
        await createOrder({
          userId: userId ?? undefined,
          email,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string | undefined,
          packageName,
          subject: subject ?? undefined,
          level: level ?? undefined,
          amountTotal,
          currency: session.currency ?? "gbp",
          status: "paid",
        });
        console.log(`[Webhook] Order created for session ${session.id} (${email})`);

        // ─── Referral Reward Logic ─────────────────────────────────────────────
        if (userId) {
          // 1. If this is the referee's first purchase, complete the referral
          const referral = await getReferralByRefereeId(userId);
          if (referral && referral.status === "pending") {
            await updateReferralStatus(referral.id, "completed");
            console.log(`[Referral] Referral ${referral.id} completed for referee ${userId}`);
          }

          // 2. If a reward was used in this session, mark it as used in DB
          const rewardId = session.metadata?.reward_id;
          const rewardType = session.metadata?.reward_type; // "referrer" or "referee"
          if (rewardId) {
            const rid = parseInt(rewardId);
            if (rewardType === "referrer") {
              await markReferrerRewardUsed(rid);
              console.log(`[Referral] Referrer reward ${rid} marked as used`);
            } else if (rewardType === "referee") {
              await markRefereeRewardUsed(rid);
              console.log(`[Referral] Referee reward ${rid} marked as used`);
            }
          }
        }
      } catch (e: unknown) {
        // Duplicate session — already recorded
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes("Duplicate")) {
          console.error("[Webhook] Failed to create order:", e);
        }
      }
      break;
    }

    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[Webhook] PaymentIntent succeeded: ${pi.id}`);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        await updateOrderStatus(session.id, "cancelled");
      } catch { /* order may not exist yet */ }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}
