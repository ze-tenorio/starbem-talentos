import { z } from "zod";
import { publicProcedure, supabaseAdminProcedure, router } from "../_core/trpc";
import {
  createCandidate,
  getCandidateById,
  getCandidatesByProfileAndStatus,
  getAllCandidates,
  updateCandidateStatus,
  createSubmissionLog,
} from "../db";
import { notifyOwner } from "../_core/notification";
import type { InsertCandidate } from "../db";

const submitCandidateSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email invalido"),
  phone: z.string().min(10, "Telefone invalido"),
  professionalProfile: z.enum(["clinical_doctor", "specialist_doctor", "psychologist", "nutritionist"]),
  registrationNumber: z.string().min(4, "Numero de registro invalido"),
  registrationState: z.string().length(2, "Estado deve ter 2 caracteres"),
  yearsOfExperience: z.number().min(0, "Anos de experiencia deve ser positivo"),
  hasCNPJ: z.enum(["yes", "no", "pending"]),
  cnpj: z.string().optional(),
  companyName: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  availableDays: z.array(z.string()).optional(),
  availableShifts: z.array(z.string()).optional(),
  additionalInfo: z.record(z.string(), z.unknown()).optional(),
});

type SubmitInput = z.infer<typeof submitCandidateSchema>;

function qualifyCandidate(data: SubmitInput): {
  qualificationLevel: 1 | 2 | 3;
  status: "qualified" | "semi_qualified" | "not_qualified";
  reasons: string[];
} {
  const hasCNPJ = data.hasCNPJ === "yes";
  const daysCount = data.availableDays?.length ?? 0;
  const shiftsCount = data.availableShifts?.length ?? 0;
  const highAvailability = daysCount >= 4 || shiftsCount >= 2;

  if (hasCNPJ && highAvailability) {
    return { qualificationLevel: 1, status: "qualified", reasons: [] };
  }

  if (hasCNPJ || highAvailability) {
    const reasons: string[] = [];
    if (!hasCNPJ) reasons.push("Sem CNPJ formalizado");
    if (!highAvailability) reasons.push("Disponibilidade limitada");
    return { qualificationLevel: 2, status: "semi_qualified", reasons };
  }

  return {
    qualificationLevel: 3,
    status: "not_qualified",
    reasons: ["Sem CNPJ formalizado", "Disponibilidade limitada"],
  };
}

function generateS3Path(profile: string, status: string): string {
  const profileMap: Record<string, string> = {
    clinical_doctor: "medicina-clinica",
    specialist_doctor: "medicina-especialidades",
    psychologist: "psicologia",
    nutritionist: "nutricao",
  };
  const folder = profileMap[profile] || "candidatos";
  const subfolder =
    status === "qualified" ? "qualificados" :
    status === "semi_qualified" ? "semi-qualificados" :
    "nao-qualificados";
  return `banco-talentos/${folder}/${subfolder}`;
}

export const candidatesRouter = router({
  submit: publicProcedure
    .input(submitCandidateSchema)
    .mutation(async ({ input }) => {
      const { qualificationLevel, status, reasons } = qualifyCandidate(input);

      const candidateData: InsertCandidate = {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        professionalProfile: input.professionalProfile as any,
        registrationNumber: input.registrationNumber,
        registrationState: input.registrationState,
        yearsOfExperience: input.yearsOfExperience,
        hasCNPJ: input.hasCNPJ as any,
        cnpj: input.cnpj ?? null,
        companyName: input.companyName ?? null,
        specialties: input.specialties ? JSON.stringify(input.specialties) : null,
        certifications: input.certifications ? JSON.stringify(input.certifications) : null,
        additionalInfo: input.additionalInfo ? JSON.stringify(input.additionalInfo) : null,
        availableDays: input.availableDays ? JSON.stringify(input.availableDays) : null,
        availableShifts: input.availableShifts ? JSON.stringify(input.availableShifts) : null,
        status: status as any,
        qualificationLevel,
        pendingReasons: reasons.length > 0 ? JSON.stringify(reasons) : null,
        s3FolderPath: generateS3Path(input.professionalProfile, status),
      };

      const candidate = await createCandidate(candidateData);
      if (!candidate) {
        throw new Error("Falha ao criar candidato");
      }

      await createSubmissionLog(candidate.id, "submitted", {
        profile: input.professionalProfile,
        status,
        qualificationLevel,
      });

      try {
        await notifyOwner({
          title: `Novo candidato: ${input.fullName}`,
          content: `Perfil: ${input.professionalProfile}\nNivel: ${qualificationLevel}\nStatus: ${status}\nEmail: ${input.email}`,
        });
      } catch (error) {
        console.error("Falha ao notificar owner:", error);
      }

      return {
        success: true,
        candidateId: candidate.id,
        status,
        qualificationLevel,
        needsCNPJ: input.hasCNPJ === "no",
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const candidate = await getCandidateById(input.id);
      if (!candidate) {
        throw new Error("Candidato nao encontrado");
      }

      return {
        ...candidate,
        specialties: candidate.specialties ? JSON.parse(candidate.specialties) : [],
        certifications: candidate.certifications ? JSON.parse(candidate.certifications) : [],
        additionalInfo: candidate.additionalInfo ? JSON.parse(candidate.additionalInfo) : {},
        availableDays: candidate.availableDays ? JSON.parse(candidate.availableDays) : [],
        availableShifts: candidate.availableShifts ? JSON.parse(candidate.availableShifts) : [],
        pendingReasons: candidate.pendingReasons ? JSON.parse(candidate.pendingReasons) : [],
      };
    }),

  listByProfileAndStatus: supabaseAdminProcedure
    .input(
      z.object({
        profile: z.string(),
        status: z.string(),
      })
    )
    .query(async ({ input }) => {
      const candidates = await getCandidatesByProfileAndStatus(input.profile, input.status);

      return candidates.map((c) => ({
        ...c,
        specialties: c.specialties ? JSON.parse(c.specialties) : [],
        certifications: c.certifications ? JSON.parse(c.certifications) : [],
        additionalInfo: c.additionalInfo ? JSON.parse(c.additionalInfo) : {},
        availableDays: c.availableDays ? JSON.parse(c.availableDays) : [],
        availableShifts: c.availableShifts ? JSON.parse(c.availableShifts) : [],
        pendingReasons: c.pendingReasons ? JSON.parse(c.pendingReasons) : [],
      }));
    }),

  exportAll: supabaseAdminProcedure
    .query(async () => {
      const candidates = await getAllCandidates();

      return candidates.map((c) => ({
        ...c,
        specialties: c.specialties ? JSON.parse(c.specialties) : [],
        certifications: c.certifications ? JSON.parse(c.certifications) : [],
        additionalInfo: c.additionalInfo ? JSON.parse(c.additionalInfo) : {},
        availableDays: c.availableDays ? JSON.parse(c.availableDays) : [],
        availableShifts: c.availableShifts ? JSON.parse(c.availableShifts) : [],
        pendingReasons: c.pendingReasons ? JSON.parse(c.pendingReasons) : [],
      }));
    }),

  updateStatus: supabaseAdminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["qualified", "semi_qualified", "not_qualified"]),
        pendingReasons: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const levelMap: Record<string, number> = {
        qualified: 1,
        semi_qualified: 2,
        not_qualified: 3,
      };

      await updateCandidateStatus(
        input.id,
        input.status,
        levelMap[input.status],
        input.pendingReasons ? JSON.stringify(input.pendingReasons) : undefined
      );

      await createSubmissionLog(input.id, "status_changed", {
        newStatus: input.status,
        qualificationLevel: levelMap[input.status],
        reasons: input.pendingReasons,
      });

      return { success: true };
    }),
});
