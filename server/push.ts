/**
 * Oak Scholars — Web Push Notification Service
 * Uses the web-push library with VAPID authentication.
 * Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in env.
 */

import webpush from "web-push";
import { getAllPushSubscriptions, deletePushSubscription } from "./db";

let _vapidConfigured = false;

function ensureVapid() {
  if (_vapidConfigured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:team@oakscholars.com";
  if (!publicKey || !privateKey) {
    console.warn("[Push] VAPID keys not set. Push notifications will not work.");
    return;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  _vapidConfigured = true;
}

export function getVapidPublicKey(): string {
  return process.env.VAPID_PUBLIC_KEY || "";
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}) {
  ensureVapid();
  if (!_vapidConfigured) return { sent: 0, failed: 0 };

  const subscriptions = await getAllPushSubscriptions();
  let sent = 0;
  let failed = 0;

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/",
    icon: payload.icon || "/favicon.ico",
    badge: "/favicon.ico",
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
          await deletePushSubscription(sub.endpoint).catch(() => {});
        } else {
          console.error("[Push] Failed to send to", sub.endpoint, err);
        }
      }
    })
  );

  console.log(`[Push] Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}
