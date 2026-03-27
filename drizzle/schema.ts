import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const professionalProfileEnum = pgEnum("professionalProfile", [
  "clinical_doctor",
  "specialist_doctor",
  "psychologist",
  "nutritionist",
]);

export const candidateStatusEnum = pgEnum("candidateStatus", [
  "qualified",
  "semi_qualified",
  "not_qualified",
]);

export const cnpjStatusEnum = pgEnum("cnpjStatus", ["yes", "no", "pending"]);

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),

  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),

  professionalProfile: professionalProfileEnum("professionalProfile").notNull(),

  hasCNPJ: cnpjStatusEnum("hasCNPJ").default("no").notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  companyName: varchar("companyName", { length: 255 }),

  registrationNumber: varchar("registrationNumber", { length: 50 }).notNull(),
  registrationState: varchar("registrationState", { length: 2 }).notNull(),

  yearsOfExperience: integer("yearsOfExperience").notNull(),
  specialties: text("specialties"),
  certifications: text("certifications"),

  additionalInfo: text("additionalInfo"),

  availableDays: text("availableDays"),
  availableShifts: text("availableShifts"),

  status: candidateStatusEnum("candidateStatus").default("not_qualified").notNull(),
  qualificationLevel: integer("qualificationLevel").default(3).notNull(),
  pendingReasons: text("pendingReasons"),

  s3FolderPath: varchar("s3FolderPath", { length: 500 }),
  s3FileName: varchar("s3FileName", { length: 255 }),

  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  notificationSentAt: timestamp("notificationSentAt"),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

export const submissionLogs = pgTable("submissionLogs", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidateId").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubmissionLog = typeof submissionLogs.$inferSelect;
export type InsertSubmissionLog = typeof submissionLogs.$inferInsert;
