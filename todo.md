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

## Improvement Backlog (Not Yet Implemented)

### Booking & Payments
- [x] Cancelled payment handling — show a clear "Payment cancelled" message on /booking?payment=cancelled so students who abandon Stripe checkout see a prompt to try again
- [x] Post-booking role assignment — after Stripe checkout.session.completed fires, automatically set the student's role to "student" so the Navbar shows "My Dashboard" pointing to the student dashboard
- [x] Post-booking redirect — on /booking/success, add a 10-second countdown that auto-redirects the student to their dashboard so they land somewhere useful without navigating manually
- [x] Email confirmation to student on booking — trigger an automated email to the student immediately after checkout.session.completed, including their subject, level, package, and a note that the team will be in touch with timings
- [x] Email notification to team on new booking — send an alert to team@oakscholars.com when a new booking is paid, including the student name, subject, level, and package selected

### Admin Dashboard
- [x] Admin dashboard auto-refresh — add a "Refresh" button or 60-second auto-poll on the Admin Overview tab so new bookings and applications appear without a full page reload
- [x] Admin: manage tutor applications inline — allow the admin to accept or reject tutor applications directly from the dashboard without needing to open a separate page
- [x] Admin: view booking details — clicking a booking row in the admin panel should expand or navigate to a detail view showing the student's contact info, subject, level, and Stripe payment reference
- [x] Admin: send email to student from dashboard — a one-click "Email Student" button on each booking row that opens a pre-filled email compose form

### Tutor & Session Management
- [x] Tutor: schedule a session — allow tutors to create a session (subject, date/time, duration) for a linked student from the Tutor Dashboard, which then appears in the student's Upcoming Sessions
- [x] Tutor: leave session feedback/notes — after a session is marked complete, prompt the tutor to leave a short note for the student, which then appears in the student's Scholar Feedback panel
- [x] Tutor: mark a session as complete — add a "Mark as Completed" button on each upcoming session in the Tutor Dashboard
- [x] Tutor application status emails — send an automated email to applicants when their status changes from "reviewing" to "accepted" or "rejected"

### Student & Parent Dashboards
- [x] Student: view assigned tutor profile — show the tutor's name, university, subjects, and LinkedIn link prominently at the top of the Student Dashboard once a tutor is assigned
- [x] Parent: receive email when student's session is scheduled — notify the parent's email address whenever a new session is added to their linked child's calendar
- [x] Parent: view child's booking history — add an "Orders" tab to the Parent Dashboard showing all packages the child has purchased

### Study Resources & Content
- [x] Study Resources: allow students to purchase individual packs — wire the /study-resources page pricing cards to Stripe Checkout so students can buy revision packs directly
- [x] Study Resources: file delivery after purchase — after a study pack is purchased, email the student a download link or show it in their Account > Orders tab
- [x] Blog / Insights section — add a simple /blog page with 3–5 articles on exam tips, university applications, and wellbeing to improve SEO and build trust with prospective parents

### UX & Design
- [x] Mobile navigation — audit the Navbar on small screens; ensure the hamburger menu opens cleanly and all links (including Admin Dashboard, My Dashboard) are accessible on mobile
- [x] Accessibility audit — check colour contrast ratios for the amber-on-cream and white-on-navy combinations; ensure all interactive elements have visible focus rings and ARIA labels
- [x] 404 page — improve the /not-found page with a friendly message, the Oak Scholars logo, and links back to Home and Book a Session
- [x] Cookie consent — the current banner blocks the bottom of the screen on mobile; move it to a smaller bottom-left toast style that doesn't obscure content
- [x] Loading skeletons on all dashboards — ensure every data-fetching section shows a skeleton while loading, not a blank space, to avoid layout shift

### SEO & Trust
- [x] Meta tags — add <title>, <meta description>, and Open Graph tags to each page (Home, Booking, Philosophy, Study Resources, etc.) for better search visibility
- [x] Sitemap.xml — generate and serve a /sitemap.xml listing all public routes so search engines can index the site properly
- [x] Structured data (JSON-LD) — add TutoringService schema markup to the homepage so Google can display rich results for the business
- [x] Google Analytics / tracking — add a privacy-friendly analytics integration so the team can see which pages get the most traffic and where users drop off

### Security & Reliability
- [x] Rate limiting on auth routes — add per-IP rate limiting to /api/auth/login and /api/auth/register to prevent brute-force attacks
- [x] Input sanitisation on contact and wellbeing forms — ensure all free-text fields are sanitised server-side before being stored or emailed
- [x] Webhook idempotency — guard the Stripe webhook handler against duplicate event delivery by checking event IDs against a processed-events log before acting

## Round 9: Admin Earnings + Google Calendar Integration
- [x] Admin Dashboard: add Earnings tab showing total revenue, monthly breakdown, and per-package stats
- [x] Backend: admin.earnings procedure returning total, monthly, and by-package revenue from orders
- [x] Google Calendar OAuth: add /api/auth/google/calendar and /api/auth/google/calendar/callback routes
- [x] Backend: calendar.status, calendar.disconnect, calendar.tutorAvailability procedures
- [x] Backend: setUserCalendarConnection and clearUserCalendarConnection db helpers
- [x] Tutor Dashboard: add Google Calendar connect/disconnect card in profile tab
- [x] Student Dashboard: add Calendar tab with Google Calendar connect/disconnect card
- [x] Booking Step 3: smart availability picker — shows tutor's live free slots if connected, falls back to generic time-preference grid
- [x] Step3Availability component: groups slots by date, handles no-tutor/no-calendar fallback states
- [x] TypeScript check — zero errors

## Round 10: Admin Dashboard Overhaul & Advanced Features
- [x] Admin: clickable detail views for all tabs (Bookings, Messages, Applications, Orders, Users)
- [x] Admin: user dashboard modal to view student/tutor/parent data from admin side
- [x] Admin: grid-based equidistant tab navigation for dashboard
- [x] Admin: messages & status management endpoints
- [x] Admin: auto-refresh toggle and activity feed improvements

## Round 11: Trial Lesson Restriction & UI Cleanup
- [x] Backend: account.trialEligibility query to prevent multiple trial purchases
- [x] Payments: implement trial guard in createCheckout mutation
- [x] UI: hide 'Trial Session' package for ineligible users
- [x] Home: remove gold connector lines from 'How it works' section

## Round 12: Cross-Role Dashboard & UI Enhancements
- [x] Visibility: Parents can see student profiles and assigned tutors
- [x] Visibility: Students can see their tutors, and Tutors can see students/parents
- [x] UI: Rename all dashboards to "My Dashboard" for a cleaner feel
- [x] Tutor Dashboard: Dedicated Earnings tab with detailed history and stat card shortcut
- [x] Interactivity: All dashboard stat cards are now clickable to navigate to relevant tabs
- [x] Calendar: Expandable 6-month view for upcoming sessions
- [x] Fix: Photo visibility for non-admin users across the site (ensured public access to storage proxy)
- [x] Compliance: Ensure cookie consent bar is properly displayed and functional

## Round 13: Credit System & Advanced Booking
- [x] Backend: Credit balance and transaction tracking system (1 credit = 1 hour)
- [x] Emails: Automated assignment notifications for tutors, students, and parents
- [x] Booking: Credit-based booking for students and parents (on behalf of child)
- [x] Duration: Flexible session lengths (60, 90, or 120 minutes)
- [x] Tutor Flow: Accept, Reject, or Propose new time for pending bookings
- [x] Dashboard: Dedicated Credit History tab for students and parents to track usage/balance
