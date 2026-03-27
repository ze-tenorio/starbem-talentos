import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

/**
 * Enum para perfis profissionais no banco de talentos
 */
export const professionalProfileEnum = mysqlEnum("professionalProfile", [
  "clinical_doctor",
  "specialist_doctor",
  "psychologist",
  "nutritionist",
]);

/**
 * Enum para status de candidato
 */
export const candidateStatusEnum = mysqlEnum("candidateStatus", [
  "ready",      // Candidato pronto para contato
  "pending",    // Candidato com pendências
  "rejected",   // Candidato rejeitado
]);

/**
 * Tabela de candidatos para o banco de talentos
 */
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Informações básicas
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  
  // Perfil profissional
  professionalProfile: professionalProfileEnum.notNull(),
  
  // Informações de formalização
  hasCNPJ: mysqlEnum("hasCNPJ", ["yes", "no", "pending"]).default("no").notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  companyName: varchar("companyName", { length: 255 }),
  
  // Informações de registro profissional
  registrationNumber: varchar("registrationNumber", { length: 50 }).notNull(), // CRM, CRP, CRN
  registrationState: varchar("registrationState", { length: 2 }).notNull(), // UF
  
  // Experiência profissional
  yearsOfExperience: int("yearsOfExperience").notNull(),
  specialties: text("specialties"), // JSON array de especialidades
  certifications: text("certifications"), // JSON array de certificações
  
  // Informações adicionais por perfil
  additionalInfo: text("additionalInfo"), // JSON com dados específicos do perfil
  
  // Disponibilidade
  availableDays: text("availableDays"), // JSON array: ["segunda", "terça", ...]
  availableShifts: text("availableShifts"), // JSON array: ["manhã", "tarde", "noite"]
  
  // Status e classificação
  status: candidateStatusEnum.default("pending").notNull(),
  pendingReasons: text("pendingReasons"), // JSON array de motivos de pendência
  
  // Armazenamento em nuvem
  s3FolderPath: varchar("s3FolderPath", { length: 500 }), // Caminho no S3
  s3FileName: varchar("s3FileName", { length: 255 }), // Nome do arquivo PDF
  
  // Rastreamento
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  notificationSentAt: timestamp("notificationSentAt"),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

/**
 * Tabela de logs de submissão para auditoria
 */
export const submissionLogs = mysqlTable("submissionLogs", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // "submitted", "updated", "status_changed"
  details: text("details"), // JSON com detalhes da ação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubmissionLog = typeof submissionLogs.$inferSelect;
export type InsertSubmissionLog = typeof submissionLogs.$inferInsert;