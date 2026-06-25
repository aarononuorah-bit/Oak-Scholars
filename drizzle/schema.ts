import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  subject: varchar("subject", { length: 100 }).notNull(),
  level: varchar("level", { length: 50 }).notNull(),
  sessionType: varchar("sessionType", { length: 50 }).notNull(),
  preferredTime: varchar("preferredTime", { length: 50 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "confirmed", "cancelled"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── Contact Messages ─────────────────────────────────────────────────────────
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

// ─── Tutor Applications ───────────────────────────────────────────────────────
export const tutorApplications = mysqlTable("tutor_applications", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  university: varchar("university", { length: 200 }).notNull(),
  degreeSubject: varchar("degreeSubject", { length: 200 }).notNull(),
  yearOfStudy: varchar("yearOfStudy", { length: 50 }).notNull(),
  subjects: text("subjects").notNull(),
  levels: text("levels").notNull(),
  experience: text("experience").notNull(),
  availability: text("availability"),
  cvFileKey: varchar("cvFileKey", { length: 500 }),
  cvFileUrl: varchar("cvFileUrl", { length: 500 }),
  coverLetter: text("coverLetter"),
  status: mysqlEnum("status", ["new", "reviewing", "interview", "accepted", "rejected"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TutorApplication = typeof tutorApplications.$inferSelect;
export type InsertTutorApplication = typeof tutorApplications.$inferInsert;

// ─── Announcement Banners ─────────────────────────────────────────────────────
export const announcementBanners = mysqlTable("announcement_banners", {
  id: int("id").autoincrement().primaryKey(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "promo"]).default("info").notNull(),
  linkText: varchar("linkText", { length: 100 }),
  linkUrl: varchar("linkUrl", { length: 500 }),
  isActive: int("isActive").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnnouncementBanner = typeof announcementBanners.$inferSelect;
export type InsertAnnouncementBanner = typeof announcementBanners.$inferInsert;

// ─── Push Subscriptions ───────────────────────────────────────────────────────
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;
