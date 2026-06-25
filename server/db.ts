import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  announcementBanners,
  bookings,
  contactMessages,
  InsertAnnouncementBanner,
  InsertBooking,
  InsertContactMessage,
  InsertPushSubscription,
  InsertTutorApplication,
  InsertUser,
  pushSubscriptions,
  tutorApplications,
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
