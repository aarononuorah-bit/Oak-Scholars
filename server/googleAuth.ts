import type { Express, Request, Response } from "express";
import { google } from "googleapis";
import crypto from "crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { upsertGoogleUser, updateUserRole } from "./db";
import { ENV } from "./_core/env";

// In-memory CSRF state store (keyed by state token, value = expiry timestamp)
// For multi-instance deployments this should be moved to Redis/DB, but works fine for single-instance
const pendingStates = new Map<string, number>();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateState(): string {
  const state = crypto.randomBytes(24).toString("hex");
  pendingStates.set(state, Date.now() + STATE_TTL_MS);
  // Clean up expired states
  Array.from(pendingStates.entries()).forEach(([k, exp]) => {
    if (Date.now() > exp) pendingStates.delete(k);
  });
  return state;
}

function consumeState(state: string): boolean {
  const exp = pendingStates.get(state);
  if (!exp) return false;
  pendingStates.delete(state);
  return Date.now() < exp;
}

function getOAuth2Client(redirectUri: string) {
  return new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    redirectUri
  );
}

function getRedirectUri(req: Request): string {
  // Use the forwarded headers from the Manus reverse proxy (trust proxy is set)
  // x-forwarded-proto may be comma-separated (e.g. "https,http") — take the first value
  const rawProto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const proto = rawProto.split(",")[0].trim();
  // x-forwarded-host may also be comma-separated — take the first value
  const rawHost = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string);
  const host = rawHost.split(",")[0].trim();
  return `${proto}://${host}/api/auth/google/callback`;
}

export function registerGoogleAuthRoutes(app: Express) {
  // Step 1: Redirect user to Google's consent screen
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const redirectUri = getRedirectUri(req);
    const oauth2Client = getOAuth2Client(redirectUri);
    const state = generateState();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
      state,
    });
    res.redirect(302, url);
  });

  // Step 2: Handle Google's callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    const error = req.query.error as string | undefined;
    const state = req.query.state as string | undefined;

    if (error || !code) {
      console.error("[Google OAuth] Callback error:", error);
      res.redirect(302, "/login?error=google_cancelled");
      return;
    }

    // Verify CSRF state
    if (!state || !consumeState(state)) {
      console.error("[Google OAuth] Invalid or expired state parameter");
      res.redirect(302, "/login?error=google_state_invalid");
      return;
    }

    try {
      const redirectUri = getRedirectUri(req);
      const oauth2Client = getOAuth2Client(redirectUri);

      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Fetch user profile from Google
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: profile } = await oauth2.userinfo.get();

      if (!profile.id || !profile.email) {
        res.redirect(302, "/login?error=google_no_email");
        return;
      }

      // Upsert user in our DB
      const user = await upsertGoogleUser({
        googleId: profile.id,
        name: profile.name || profile.email.split("@")[0],
        email: profile.email,
        picture: profile.picture ?? undefined,
      });

      // Auto-promote team@oakscholars.com to admin
      const ADMIN_EMAIL = "team@oakscholars.com";
      if (profile.email.toLowerCase() === ADMIN_EMAIL && user.role !== "admin") {
        await updateUserRole(user.id, "admin");
        user.role = "admin";
      }

      // Create session cookie using the same mechanism as email/password login
      const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (err) {
      console.error("[Google OAuth] Callback failed:", err);
      res.redirect(302, "/login?error=google_failed");
    }
  });
}
