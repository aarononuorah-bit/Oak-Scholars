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
- [x] Save checkpoint
- [x] Connect to GitHub and push code — pushed to aarononuorah-bit/Oak-Scholars

## Pending Actions
- [x] Register Stripe webhook at dashboard.stripe.com/webhooks → /api/stripe/webhook (production webhook already configured at https://oakscholar-jrd8pqdk.manus.space/api/stripe/webhook)
- [x] Claim Stripe sandbox at dashboard.stripe.com/claim_sandbox/... (user action — reminder provided)

## Brand Update & User Account (new)
- [x] Update live Stripe keys (pk_live + secret) — user to enter in Settings → Payment
- [x] Update CSS theme to match original: deep purple #281A39 hero, cream #F9F7F2 body, amber #E8A838 accent
- [x] Replace logo in Navbar with original oak tree logo image
- [x] Update DB schema: add stripe_customer_id to users, add orders table
- [x] Build /account page: profile, order history, saved cards
- [x] Wire Stripe Customer Portal for saved card management
- [x] Add login/auth flow visible in Navbar (Login button → Manus OAuth)

## Content & Feature Updates (Round 3)

- [x] Change "7+ subjects covered" stat to "12+ subjects covered"
- [x] Change 8-session bundle price from £190 to £200 (saving £40, not £50)
- [x] Update products.ts with new £200 bundle price
- [x] Split ServicesSection into 4 distinct cards: Tuition, Study Resources, Academic Support, Wellbeing Support
- [x] Create /study-resources page with its own pricing (revision notes, mock questions, model answers, PowerPoints — £15–£20 per pack)
- [x] Create /support-guidance page split into two groups: (1) Academic Support: personal statement help, EPQ support, CV writing, interview prep; (2) Wellbeing: support for students with mental health concerns, bullying, general wellbeing
- [x] Update all service card CTAs to link to their correct dedicated pages (not all to booking)
- [x] Register new routes in App.tsx

## UI/UX Fixes (Round 4)
- [x] Space out navbar links so they are less clumped
- [x] Fix navbar background on scroll — solid white on all non-home pages, transparent purple only on homepage hero
- [x] Make entire service card clickable (already wrapped in Link, confirmed)
- [x] Build dedicated Academic Support enquiry form at /academic-support
- [x] Build dedicated Wellbeing Support enquiry form at /wellbeing-support
- [x] Update Support & Guidance page service card buttons to link to their specific forms
- [x] No "Group 1" / "Group 2" labels found in SupportGuidance.tsx (already clean)
- [x] Register new routes in App.tsx

## Email/Password Auth & Admin Email Fix
- [x] Extend users table: add passwordHash, emailVerified columns
- [x] Apply DB migration for new auth columns
- [x] Build server auth routes: register, login, logout, me (bcrypt + JWT cookie)
- [x] Add admin bootstrap: team@oakscholars.com auto-promoted to admin on first login
- [x] Build /login page (email + password form)
- [x] Build /register page (name + email + password form)
- [x] Update Navbar: show Login/Register for guests, name + dropdown for signed-in users
- [x] Update Account page to work with new auth
- [x] Update all email notification targets to team@oakscholars.com
- [x] Fix StudentDashboard Unicode bullet parse error
- [x] TypeScript check — zero errors

## Direct Google OAuth (Independent of Manus)
- [x] Create Google OAuth app in Google Cloud Console and get CLIENT_ID + CLIENT_SECRET
- [x] Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET as project secrets
- [x] Build server-side /api/auth/google and /api/auth/google/callback routes
- [x] Handle new user creation and existing user login via Google profile
- [x] Add Google sign-in button back to Login.tsx and Register.tsx
- [x] Google OAuth secrets test — 3/3 passing

## Navbar & Chatbot Polish
- [x] Differentiate "Become an Oak Scholar" button (outline/ghost style) vs "Book a Session" (primary amber fill)
- [x] Add hover pop/scale animation to "Book a Session" button in navbar
- [x] Inject accurate Oak Scholars system prompt into AI chatbot (services, pricing, how to book, etc.)
- [x] Add "Connect to agent" fallback option in chatbot when AI cannot answer
- [x] Move chatbot close button to bottom-right, change from red to brand-consistent colour

## Four Role-Based Dashboards
- [x] Schema: add parent_link_requests table (consent flow for parent-student linking)
- [x] Schema: add accountType field to users (student/parent choice at signup)
- [x] Schema: add tutor profile fields (bio, linkedin, subjects, level) to users
- [x] Apply DB migrations for new tables/columns
- [x] Backend: parent router (myChild, requestLink, acceptLink, pendingRequests)
- [x] Backend: tutor profile update procedure
- [x] Backend: admin assign-tutor-to-student procedure
- [x] Frontend: role selection (student/parent) on Register page and Account page
- [x] Frontend: Admin Dashboard - wire assign tutor to student form
- [x] Frontend: Tutor Dashboard - show student preferences, education level, subjects
- [x] Frontend: Student Dashboard - show tutor LinkedIn/profile, real data
- [x] Frontend: Parent Dashboard - consent flow to link to student, view real student data
- [x] Wire /dashboard route in App.tsx
- [x] TypeScript check — zero errors

## Fixes & Polish (Round 5)
- [x] Admin auto-promotion: ensure team@oakscholars.com gets admin role on login/register
- [x] Fix broken images (question marks) across the site — updated all stale manus-storage paths in Navbar, Footer, Home, Philosophy, Login, Register
- [x] Booking flow: auto-redirect to Stripe immediately after subject/level/package selection — submitMutation.onSuccess now triggers checkoutMutation automatically
- [x] Add /booking/success thank-you page shown after Stripe payment completes — new BookingSuccess.tsx page with confirmation message and next steps
- [x] Smooth page transitions (fade/slide between routes) — page-enter CSS animation (220ms ease-out) applied to Router wrapper in App.tsx
- [x] Polish animations site-wide (tasteful, professional) — added card-hover, stagger-item, pulse-amber utilities; prefers-reduced-motion respected

## Referral Program (Round 6)
- [x] Add referral_code to users table and create referrals table
- [x] Implement referral stats and automatic code generation (tRPC)
- [x] Update registration to support referral code entry
- [x] Update Stripe integration to complete referrals and apply 20% discounts
- [x] Add referral dashboard to Account page
- [x] Update Booking flow to handle referral rewards and show discounted prices
