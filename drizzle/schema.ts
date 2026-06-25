import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "tutor", "parent"]).default("user").notNull(),
  parentOf: int("parentOf"), // if role is 'parent', this is the student user ID
  approvedAsTutor: int("approvedAsTutor").default(0).notNull(), // 1 if admin approved as tutor
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
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

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }).notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 200 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 200 }),
  packageName: varchar("packageName", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 100 }),
  level: varchar("level", { length: 50 }),
  amountTotal: int("amountTotal").notNull(), // in pence
  currency: varchar("currency", { length: 10 }).default("gbp").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "cancelled", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Tutoring Relationships ───────────────────────────────────────────────────
export const tutoringRelationships = mysqlTable("tutoring_relationships", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  studentId: int("studentId").notNull(),
  subjects: text("subjects").notNull(), // JSON array of subjects
  level: varchar("level", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutoringRelationship = typeof tutoringRelationships.$inferSelect;
export type InsertTutoringRelationship = typeof tutoringRelationships.$inferInsert;

// ─── Tutoring Sessions ────────────────────────────────────────────────────────
export const tutoringSessions = mysqlTable("tutoring_sessions", {
  id: int("id").autoincrement().primaryKey(),
  relationshipId: int("relationshipId").notNull(),
  tutorId: int("tutorId").notNull(),
  studentId: int("studentId").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration").notNull(), // in minutes
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled").notNull(),
  notes: text("notes"), // tutor notes from the session
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutoringSession = typeof tutoringSessions.$inferSelect;
export type InsertTutoringSession = typeof tutoringSessions.$inferInsert;

// ─── Feedback ─────────────────────────────────────────────────────────────────
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  fromUserId: int("fromUserId").notNull(), // tutor or student giving feedback
  toUserId: int("toUserId").notNull(), // tutor or student receiving feedback
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

// ─── Tutor Availability ───────────────────────────────────────────────────────
export const tutorAvailability = mysqlTable("tutor_availability", {
  id: int("id").autoincrement().primaryKey(),
  tutorId: int("tutorId").notNull(),
  dayOfWeek: varchar("dayOfWeek", { length: 20 }).notNull(), // "Monday", "Tuesday", etc.
  startTime: varchar("startTime", { length: 10 }).notNull(), // "09:00"
  endTime: varchar("endTime", { length: 10 }).notNull(), // "17:00"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TutorAvailability = typeof tutorAvailability.$inferSelect;
export type InsertTutorAvailability = typeof tutorAvailability.$inferInsert;
