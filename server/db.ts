import { getSupabaseAdmin } from "./supabase";

export type Candidate = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  professionalProfile: string;
  hasCNPJ: string;
  cnpj: string | null;
  companyName: string | null;
  registrationNumber: string;
  registrationState: string;
  yearsOfExperience: number;
  specialties: string | null;
  certifications: string | null;
  additionalInfo: string | null;
  availableDays: string | null;
  availableShifts: string | null;
  status: string;
  qualificationLevel: number;
  pendingReasons: string | null;
  s3FolderPath: string | null;
  s3FileName: string | null;
  submittedAt: string;
  updatedAt: string;
  notificationSentAt: string | null;
};

export type InsertCandidate = Omit<Candidate, "id" | "submittedAt" | "updatedAt" | "notificationSentAt"> & {
  s3FileName?: string | null;
  s3FolderPath?: string | null;
};

export async function createCandidate(data: InsertCandidate): Promise<Candidate | null> {
  const supabase = getSupabaseAdmin();

  const { data: result, error } = await supabase
    .from("candidates")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("[Database] Failed to create candidate:", error);
    throw error;
  }

  return result;
}

export async function getCandidateById(id: number): Promise<Candidate | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[Database] Failed to get candidate:", error);
    throw error;
  }

  return data;
}

export async function getCandidatesByProfileAndStatus(
  profile: string,
  status: string
): Promise<Candidate[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("professionalProfile", profile)
    .eq("status", status);

  if (error) {
    console.error("[Database] Failed to get candidates:", error);
    throw error;
  }

  return data ?? [];
}

export async function getAllCandidates(): Promise<Candidate[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("submittedAt", { ascending: false });

  if (error) {
    console.error("[Database] Failed to get all candidates:", error);
    throw error;
  }

  return data ?? [];
}

export async function updateCandidateStatus(
  id: number,
  status: string,
  qualificationLevel?: number,
  pendingReasons?: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const updateData: Record<string, any> = {
    status,
    pendingReasons: pendingReasons || null,
    updatedAt: new Date().toISOString(),
  };
  if (qualificationLevel !== undefined) {
    updateData.qualificationLevel = qualificationLevel;
  }

  const { error } = await supabase
    .from("candidates")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("[Database] Failed to update candidate status:", error);
    throw error;
  }
}

export async function createSubmissionLog(
  candidateId: number,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("submission_logs")
    .insert({
      candidateId,
      action,
      details: details ? JSON.stringify(details) : null,
    });

  if (error) {
    console.error("[Database] Failed to create submission log:", error);
    throw error;
  }
}
