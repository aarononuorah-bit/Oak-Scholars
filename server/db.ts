import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  announcementBanners,
  bookings,
  contactMessages,
  feedback,
  InsertAnnouncementBanner,
  InsertBooking,
  InsertContactMessage,
  InsertFeedback,
  InsertOrder,
  InsertPushSubscription,
  InsertReferral,
  InsertTutorApplication,
  InsertTutorAvailability,
  InsertTutoringRelationship,
  InsertTutoringSession,
  InsertUser,
  orders,
  pushSubscriptions,
  parentLinkRequests,
  referrals,
  tutorApplications,
  tutorAvailability,
  tutoringRelationships,
  creditBalances
  tutoringSessions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(bookings).values(data);
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(id: number, status: "new" | "contacted" | "confirmed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
}

// ─── Contact Messages ─────────────────────────────────────────────────────────
export async function createContactMessage(data: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contactMessages).values(data);
}

export async function getAllContactMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function updateContactStatus(id: number, status: "new" | "read" | "replied") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}

// ─── Tutor Applications ───────────────────────────────────────────────────────
export async function createTutorApplication(data: InsertTutorApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tutorApplications).values(data);
}

export async function getAllTutorApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorApplications).orderBy(desc(tutorApplications.createdAt));
}

export async function updateTutorApplicationStatus(
  id: number,
  status: "new" | "reviewing" | "interview" | "accepted" | "rejected"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tutorApplications).set({ status }).where(eq(tutorApplications.id, id));
}

// ─── Announcement Banners ─────────────────────────────────────────────────────
export async function createBanner(data: InsertAnnouncementBanner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(announcementBanners).values(data);
}

export async function getAllBanners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcementBanners).orderBy(desc(announcementBanners.createdAt));
}

export async function getActiveBanner() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(announcementBanners)
    .where(eq(announcementBanners.isActive, 1))
    .limit(1);
  return result[0] ?? null;
}

export async function setBannerActive(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(announcementBanners).set({ isActive: 0 });
  if (isActive) {
    await db.update(announcementBanners).set({ isActive: 1 }).where(eq(announcementBanners.id, id));
  }
}

export async function deleteBanner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(announcementBanners).where(eq(announcementBanners.id, id));
}

// ─── Push Subscriptions ───────────────────────────────────────────────────────
export async function savePushSubscription(data: InsertPushSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pushSubscriptions).values(data);
}

export async function getAllPushSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pushSubscriptions);
}

export async function deletePushSubscription(endpoint: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(data);
}

export async function getOrdersByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.email, email)).orderBy(desc(orders.createdAt));
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(stripeSessionId: string, status: "pending" | "paid" | "cancelled" | "refunded", paymentIntentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (paymentIntentId) updateData.stripePaymentIntentId = paymentIntentId;
  await db.update(orders).set(updateData).where(eq(orders.stripeSessionId, stripeSessionId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

// ─── User profile ───────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserProfile(id: number, data: { name?: string; email?: string; phone?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function updateStripeCustomerId(id: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ stripeCustomerId }).where(eq(users.id, id));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function updateUserRole(id: number, role: "user" | "admin" | "tutor" | "parent", parentOf?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { role };
  if (parentOf !== undefined) updateData.parentOf = parentOf;
  await db.update(users).set(updateData).where(eq(users.id, id));
}

export async function approveTutorByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (result.length === 0) throw new Error("User not found");
  await db.update(users).set({ role: "tutor", approvedAsTutor: 1 }).where(eq(users.id, result[0].id));
  return result[0].id;
}

// ─── Tutoring Relationships ───────────────────────────────────────────────────
export async function createTutoringRelationship(data: InsertTutoringRelationship) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tutoringRelationships).values(data);
  return result[0]?.insertId || 0;
}

export async function getTutoringRelationshipsByTutorId(tutorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutoringRelationships).where(eq(tutoringRelationships.tutorId, tutorId));
}

export async function getTutoringRelationshipsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutoringRelationships).where(eq(tutoringRelationships.studentId, studentId));
}

export async function getAllTutoringRelationships() {
  const db = await getDb();
  if (!db) return [];
  const relationships = await db.select().from(tutoringRelationships);
  // Enrich with tutor and student data
  const enriched = await Promise.all(
    relationships.map(async (rel) => {
      const tutor = await getUserById(rel.tutorId);
      const student = await getUserById(rel.studentId);
      return { ...rel, tutor, student };
    })
  );
  return enriched;
}

export async function updateTutoringRelationshipStatus(id: number, status: "active" | "paused" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tutoringRelationships).set({ status }).where(eq(tutoringRelationships.id, id));
}

// ─── Tutoring Sessions ────────────────────────────────────────────────────────
export async function createTutoringSession(data: InsertTutoringSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tutoringSessions).values(data);
  return result[0]?.insertId || 0;
}

export async function getTutoringSessionsByTutorId(tutorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutoringSessions).where(eq(tutoringSessions.tutorId, tutorId)).orderBy(desc(tutoringSessions.scheduledAt));
}

export async function getTutoringSessionsByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutoringSessions).where(eq(tutoringSessions.studentId, studentId)).orderBy(desc(tutoringSessions.scheduledAt));
}

export async function getTutoringSessionsByRelationshipId(relationshipId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutoringSessions).where(eq(tutoringSessions.relationshipId, relationshipId)).orderBy(desc(tutoringSessions.scheduledAt));
}

export async function updateTutoringSessionStatus(id: number, status: "scheduled" | "completed" | "cancelled" | "no-show", notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (notes !== undefined) updateData.notes = notes;
  if (status === "completed") updateData.completedAt = new Date();
  await db.update(tutoringSessions).set(updateData).where(eq(tutoringSessions.id, id));
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export async function createFeedback(data: InsertFeedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(feedback).values(data);
  return result[0]?.insertId || 0;
}

export async function getFeedbackForSession(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedback).where(eq(feedback.sessionId, sessionId));
}

export async function getFeedbackReceivedByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedback).where(eq(feedback.toUserId, userId)).orderBy(desc(feedback.createdAt));
}

// ─── Referrals ────────────────────────────────────────────────────────────────
export async function createReferral(data: InsertReferral) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(referrals).values(data);
}

export async function getReferralByRefereeId(refereeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referrals).where(eq(referrals.refereeId, refereeId)).limit(1);
  return result[0] ?? undefined;
}

export async function updateReferralStatus(id: number, status: "pending" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referrals).set({ status }).where(eq(referrals.id, id));
}

export async function markReferrerRewardUsed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referrals).set({ referrerRewardUsed: 1 }).where(eq(referrals.id, id));
}

export async function markRefereeRewardUsed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(referrals).set({ refereeRewardUsed: 1 }).where(eq(referrals.id, id));
}

export async function getPendingRewardsForUser(userId: number) {
  const db = await getDb();
  if (!db) return { asReferrer: [], asReferee: [] };
  
  const allReferrals = await db.select().from(referrals);
  
  return {
    asReferrer: allReferrals.filter(r => r.referrerId === userId && r.status === "completed" && r.referrerRewardUsed === 0),
    asReferee: allReferrals.filter(r => r.refereeId === userId && r.status === "completed" && r.refereeRewardUsed === 0)
  };
}
// --- PASTE NEW CODE HERE ---
export async function getCreditBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const res = await db.select().from(creditBalances).where(eq(creditBalances.userId, userId)).limit(1);
  return res[0]?.balance ?? 0;
}

export async function updateCreditBalance(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database offline");
  const current = await getCreditBalance(userId);
  await db.update(creditBalances)
    .set({ balance: current + amount })
    .where(eq(creditBalances.userId, userId));
}

// ─── Tutor Availability ───────────────────────────────────────────────────────
export async function createTutorAvailability(data: InsertTutorAvailability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tutorAvailability).values(data);
  return result[0]?.insertId || 0;
}

export async function getTutorAvailabilityByTutorId(tutorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorAvailability).where(eq(tutorAvailability.tutorId, tutorId));
}

export async function deleteTutorAvailability(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tutorAvailability).where(eq(tutorAvailability.id, id));
}

// ─── Email/Password Auth ──────────────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserByReferralCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
  return result[0] ?? undefined;
}

export async function updateUserReferralCode(id: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ referralCode: code }).where(eq(users.id, id));
}

export async function createUserWithPassword(data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "user" | "admin" | "tutor" | "parent";
  accountType?: "student" | "parent";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Generate a unique openId for email/password users (prefix ep_ to distinguish from OAuth)
  const openId = `ep_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    emailVerified: 1,
    loginMethod: "email",
    role: data.role ?? "user",
    accountType: data.accountType ?? "student",
    lastSignedIn: new Date(),
  });
  const created = await getUserByEmail(data.email);
  return created!;
}

export async function updateUserPasswordHash(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));
}

export async function updateUserLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

// ─── Parent Link Requests ───────────────────────────────────────────────────
export async function createParentLinkRequest(parentId: number, studentEmail: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const student = await db.select().from(users).where(eq(users.email, studentEmail)).limit(1);
  if (!student[0]) throw new Error("No account found with that email address.");
  const studentId = student[0].id;
  const existing = await db.select().from(parentLinkRequests)
    .where(and(eq(parentLinkRequests.parentId, parentId), eq(parentLinkRequests.studentId, studentId))).limit(1);
  if (existing[0]) {
    if (existing[0].status === "accepted") throw new Error("You are already linked to this student.");
    // If pending, regenerate the code and resend
    if (existing[0].status === "pending") {
      const confirmCode = String(Math.floor(100000 + Math.random() * 900000));
      const codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.update(parentLinkRequests)
        .set({ confirmCode, codeExpiresAt, updatedAt: new Date() })
        .where(eq(parentLinkRequests.id, existing[0].id));
      return { studentId, studentName: student[0].name, studentEmail: student[0].email, confirmCode };
    }
  }
  const confirmCode = String(Math.floor(100000 + Math.random() * 900000));
  const codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.insert(parentLinkRequests).values({ parentId, studentId, confirmCode, codeExpiresAt });
  return { studentId, studentName: student[0].name, studentEmail: student[0].email, confirmCode };
}

export async function getPendingLinkRequestsForStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  const requests = await db.select().from(parentLinkRequests)
    .where(and(eq(parentLinkRequests.studentId, studentId), eq(parentLinkRequests.status, "pending")));
  return Promise.all(requests.map(async (r) => {
    const parent = await getUserById(r.parentId);
    return { ...r, parent };
  }));
}

export async function respondToLinkRequest(requestId: number, studentId: number, accept: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const status = accept ? "accepted" : "declined";
  await db.update(parentLinkRequests)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(parentLinkRequests.id, requestId), eq(parentLinkRequests.studentId, studentId)));
  if (accept) {
    const req = await db.select().from(parentLinkRequests).where(eq(parentLinkRequests.id, requestId)).limit(1);
    if (req[0]) {
      await db.update(users).set({ parentOf: studentId }).where(eq(users.id, req[0].parentId));
    }
  }
  return { success: true };
}

export async function confirmLinkByCode(parentId: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const requests = await db.select().from(parentLinkRequests)
    .where(and(eq(parentLinkRequests.parentId, parentId), eq(parentLinkRequests.status, "pending"))).limit(10);
  const match = requests.find((r) => r.confirmCode === code);
  if (!match) throw new Error("Invalid confirmation code. Please check the code and try again.");
  if (match.codeExpiresAt && new Date() > match.codeExpiresAt) throw new Error("This confirmation code has expired. Please request a new one.");
  await db.update(parentLinkRequests)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(parentLinkRequests.id, match.id));
  await db.update(users).set({ parentOf: match.studentId }).where(eq(users.id, parentId));
  const student = await getUserById(match.studentId);
  return { success: true, studentName: student?.name, studentId: match.studentId };
}

export async function getLinkedChildrenForParent(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  const requests = await db
    .select()
    .from(parentLinkRequests)
    .where(and(eq(parentLinkRequests.parentId, parentId), eq(parentLinkRequests.status, 'accepted')));
  if (requests.length === 0) return [];
  const studentIds = requests.map((r) => r.studentId);
  const students = await db
    .select({ id: users.id, name: users.name, email: users.email, accountType: users.accountType })
    .from(users)
    .where(inArray(users.id, studentIds));
  return students;
}

export async function getLinkedStudentForParent(parentId: number) {
  const db = await getDb();
  if (!db) return null;
  const parent = await getUserById(parentId);
  if (!parent?.parentOf) return null;
  return getUserById(parent.parentOf);
}

export async function updateTutorProfile(userId: number, data: {
  bio?: string;
  linkedin?: string;
  tutorSubjects?: string;
  tutorLevel?: string;
  tutorUniversity?: string;
  tutorCourse?: string;
  profilePhotoUrl?: string;
  bankAccountName?: string;
  bankSortCode?: string;
  bankAccountNumber?: string;
  bankPaypalEmail?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function updateAccountType(userId: number, accountType: "student" | "parent") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ accountType, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function upsertGoogleUser(data: {
  googleId: string;
  name: string;
  email: string;
  picture?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ADMIN_EMAIL = "team@oakscholars.com";
  // Check if a user with this email already exists (could be email/password user)
  const existing = await getUserByEmail(data.email);
  if (existing) {
    // Update last signed in and link Google openId if not already set
    await db.update(users)
      .set({
        lastSignedIn: new Date(),
        loginMethod: existing.loginMethod ?? "google",
        // If openId starts with ep_ it was email/password — update to google openId
        openId: existing.openId.startsWith("ep_") ? `google_${data.googleId}` : existing.openId,
      })
      .where(eq(users.id, existing.id));
    const updated = await getUserByEmail(data.email);
    return updated!;
  }
  // New user — create with google openId
  const openId = `google_${data.googleId}`;
  const role = data.email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user";
  await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    loginMethod: "google",
    emailVerified: 1,
    role,
    lastSignedIn: new Date(),
  });
  const created = await getUserByEmail(data.email);
  return created!;
}
