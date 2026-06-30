/**
 * Simple in-memory rate limiter for server-side tRPC procedures.
 * Uses a sliding window per IP (or key) to limit the number of requests
 * within a given time window.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
 *   limiter.check(ip); // throws TRPCError if over limit
 */

import { TRPCError } from "@trpc/server";

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed per window */
  max: number;
  /** Human-readable message to return when limit is exceeded */
  message?: string;
}

interface Entry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, message = "Too many requests. Please try again later." } = options;
  const store = new Map<string, Entry>();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanup = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, windowMs * 2);

  // Allow cleanup to be stopped in tests
  cleanup.unref?.();

  return {
    check(key: string): void {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return;
      }

      entry.count += 1;
      if (entry.count > max) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message,
        });
      }
    },
  };
}

// ─── Pre-built limiters ───────────────────────────────────────────────────────

/** Auth routes: 10 attempts per 15 minutes per IP */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many sign-in attempts. Please wait 15 minutes before trying again.",
});

/** Contact / wellbeing form: 5 submissions per 10 minutes per IP */
export const contactLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "You have submitted too many messages. Please wait a few minutes before trying again.",
});
