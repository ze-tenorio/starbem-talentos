import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, candidates, submissionLogs, Candidate, InsertCandidate } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Criar novo candidato
 */
export async function createCandidate(data: InsertCandidate): Promise<Candidate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(candidates).values(data);
    const candidateId = result[0]?.insertId;
    if (!candidateId) return null;

    return await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, candidateId as number))
      .then(rows => rows[0] || null);
  } catch (error) {
    console.error("[Database] Failed to create candidate:", error);
    throw error;
  }
}

/**
 * Buscar candidato por ID
 */
export async function getCandidateById(id: number): Promise<Candidate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get candidate:", error);
    throw error;
  }
}

/**
 * Buscar candidatos por perfil e status
 */
export async function getCandidatesByProfileAndStatus(
  profile: string,
  status: string
): Promise<Candidate[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(candidates)
      .where(
        and(
          eq(candidates.professionalProfile, profile as any),
          eq(candidates.status, status as any)
        )
      );
    return result;
  } catch (error) {
    console.error("[Database] Failed to get candidates:", error);
    throw error;
  }
}

/**
 * Atualizar status do candidato
 */
export async function updateCandidateStatus(
  id: number,
  status: string,
  pendingReasons?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(candidates)
      .set({
        status: status as any,
        pendingReasons: pendingReasons || null,
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, id));
  } catch (error) {
    console.error("[Database] Failed to update candidate status:", error);
    throw error;
  }
}

/**
 * Registrar log de submissão
 */
export async function createSubmissionLog(
  candidateId: number,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(submissionLogs).values({
      candidateId,
      action,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error("[Database] Failed to create submission log:", error);
    throw error;
  }
}


