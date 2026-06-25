# Oak Scholars — Project TODO

## Phase 1: Database & Server
- [x] Update drizzle/schema.ts with all tables (bookings, contact_messages, tutor_applications, announcement_banners, push_subscriptions)
- [x] Run migration and apply SQL via webdev_execute_sql
- [x] Write server/db.ts with all query helpers
- [x] Write server/email.ts for transactional emails
- [x] Write server/push.ts for VAPID push notifications
- [x] Write server/stripe.ts for Stripe integration
- [x] Write server/products.ts for session packages
- [x] Write server/routers.ts with all tRPC routes (booking, contact, tutor, payments, banners, push)
- [x] Add sw.js service worker to client/public/

## Phase 2: Frontend Pages & Components
- [x] Update client/index.html with fonts (Playfair Display, DM Sans)
- [x] Update client/src/index.css with brand theme (navy #0F1B35, amber #E8A838)
- [x] Update client/src/App.tsx with all routes + AnnouncementBanner + CookieConsent
- [x] Build client/src/components/AnnouncementBanner.tsx
- [x] Build client/src/components/CookieConsent.tsx
- [x] Build client/src/components/Navbar.tsx
- [x] Build client/src/components/Footer.tsx
- [x] Build client/src/components/TrustBar.tsx
- [x] Build client/src/components/CtaBanner.tsx
- [x] Build client/src/pages/Home.tsx (Hero, HowItWorks, Services, Subjects, Pricing, Testimonials, TrustBar, Team, CTA)
- [x] Build client/src/pages/Booking.tsx (4-step form + Stripe checkout)
- [x] Build client/src/pages/Contact.tsx
- [x] Build client/src/pages/TutorApply.tsx (multi-step + CV upload)
- [x] Build client/src/pages/AdminDashboard.tsx
- [x] Build client/src/pages/PrivacyPolicy.tsx
- [x] Build client/src/pages/TermsOfService.tsx
- [x] Build client/src/hooks/usePushNotifications.ts
- [x] Build client/src/components/PushNotificationPrompt.tsx

## Phase 3: Integrations & Tests
- [x] Add Stripe feature via webdev_add_feature
- [x] Configure SMTP secrets (Gmail, team@oakscholars.com)
- [x] Configure VAPID push notification keys
- [x] Write secrets.test.ts — all 9 tests passing
- [x] TypeScript check — zero errors

## Phase 4: GitHub
- [ ] Save checkpoint
- [ ] Connect to GitHub and push code (deferred by user)

## Pending Actions
- [ ] Register Stripe webhook at dashboard.stripe.com/webhooks → /api/stripe/webhook
- [ ] Claim Stripe sandbox at dashboard.stripe.com/claim_sandbox/...

## Brand Update & User Account (new)
- [x] Update live Stripe keys (pk_live + secret) — user to enter in Settings → Payment
- [x] Update CSS theme to match original: deep purple #281A39 hero, cream #F9F7F2 body, amber #E8A838 accent
- [x] Replace logo in Navbar with original oak tree logo image
- [x] Update DB schema: add stripe_customer_id to users, add orders table
- [x] Build /account page: profile, order history, saved cards
- [x] Wire Stripe Customer Portal for saved card management
- [x] Add login/auth flow visible in Navbar (Login button → Manus OAuth)
