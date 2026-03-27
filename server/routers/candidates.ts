import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  createCandidate,
  getCandidateById,
  getCandidatesByProfileAndStatus,
  updateCandidateStatus,
  createSubmissionLog,
} from "../db";
import { notifyOwner } from "../_core/notification";
import type { InsertCandidate } from "../../drizzle/schema";

/**
 * Schema de validação para submissão de candidato
 */
const submitCandidateSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  professionalProfile: z.enum(["clinical_doctor", "specialist_doctor", "psychologist", "nutritionist"]),
  registrationNumber: z.string().min(4, "Número de registro inválido"),
  registrationState: z.string().length(2, "Estado deve ter 2 caracteres"),
  yearsOfExperience: z.number().min(0, "Anos de experiência deve ser positivo"),
  hasCNPJ: z.enum(["yes", "no", "pending"]),
  cnpj: z.string().optional(),
  companyName: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  availableDays: z.array(z.string()).optional(),
  availableShifts: z.array(z.string()).optional(),
  additionalInfo: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Lógica de validação de candidato
 */
function validateCandidate(data: z.infer<typeof submitCandidateSchema>): {
  status: "ready" | "pending";
  pendingReasons: string[];
} {
  const pendingReasons: string[] = [];

  // Validar CNPJ
  if (data.hasCNPJ === "no") {
    pendingReasons.push("Candidato sem CNPJ formalizado");
  } else if (data.hasCNPJ === "pending") {
    pendingReasons.push("Aguardando confirmação de CNPJ");
  }

  // Validar experiência mínima
  const minExperience = data.professionalProfile === "specialist_doctor" ? 3 : 1;
  if (data.yearsOfExperience < minExperience) {
    pendingReasons.push(`Experiência mínima de ${minExperience} anos não atingida`);
  }

  // Validar especialidades/certificações
  if (!data.specialties || data.specialties.length === 0) {
    pendingReasons.push("Especialidades não informadas");
  }

  const status = pendingReasons.length === 0 ? "ready" : "pending";

  return { status, pendingReasons };
}

/**
 * Gerar caminho S3 baseado no perfil e status
 */
function generateS3Path(profile: string, status: string): string {
  const profileMap: Record<string, string> = {
    clinical_doctor: "medicina-clinica",
    specialist_doctor: "medicina-especialidades",
    psychologist: "psicologia",
    nutritionist: "nutricao",
  };

  const folder = profileMap[profile] || "candidatos";
  const subfolder = status === "ready" ? "prontos" : "pendencias";

  return `banco-talentos/${folder}/${subfolder}`;
}

export const candidatesRouter = router({
  /**
   * Submeter novo candidato
   */
  submit: publicProcedure
    .input(submitCandidateSchema)
    .mutation(async ({ input }) => {
      try {
        // Validar candidato
        const { status, pendingReasons } = validateCandidate(input);

        // Preparar dados para inserção
        const candidateData: InsertCandidate = {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          professionalProfile: input.professionalProfile as any,
          registrationNumber: input.registrationNumber,
          registrationState: input.registrationState,
          yearsOfExperience: input.yearsOfExperience,
          hasCNPJ: input.hasCNPJ as any,
          cnpj: input.cnpj,
          companyName: input.companyName,
          specialties: input.specialties ? JSON.stringify(input.specialties) : null,
          certifications: input.certifications ? JSON.stringify(input.certifications) : null,
          additionalInfo: input.additionalInfo ? JSON.stringify(input.additionalInfo) : null,
          status: status as any,
          pendingReasons: pendingReasons.length > 0 ? JSON.stringify(pendingReasons) : null,
          s3FolderPath: generateS3Path(input.professionalProfile, status),
        };

        // Criar candidato
        const candidate = await createCandidate(candidateData);
        if (!candidate) {
          throw new Error("Falha ao criar candidato");
        }

        // Registrar log
        await createSubmissionLog(candidate.id, "submitted", {
          profile: input.professionalProfile,
          status,
        });

        // Notificar owner
        try {
          await notifyOwner({
            title: `Novo candidato: ${input.fullName}`,
            content: `Perfil: ${input.professionalProfile}\nStatus: ${status}\nEmail: ${input.email}`,
          });
        } catch (error) {
          console.error("Falha ao notificar owner:", error);
        }

        return {
          success: true,
          candidateId: candidate.id,
          status,
          needsCNPJ: input.hasCNPJ === "no",
        };
      } catch (error) {
        console.error("Erro ao submeter candidato:", error);
        throw error;
      }
    }),

  /**
   * Obter candidato por ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const candidate = await getCandidateById(input.id);
      if (!candidate) {
        throw new Error("Candidato não encontrado");
      }

      return {
        ...candidate,
        specialties: candidate.specialties ? JSON.parse(candidate.specialties) : [],
        certifications: candidate.certifications ? JSON.parse(candidate.certifications) : [],
        additionalInfo: candidate.additionalInfo ? JSON.parse(candidate.additionalInfo) : {},
        pendingReasons: candidate.pendingReasons ? JSON.parse(candidate.pendingReasons) : [],
      };
    }),

  /**
   * Listar candidatos por perfil e status (admin)
   */
  listByProfileAndStatus: protectedProcedure
    .input(
      z.object({
        profile: z.string(),
        status: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const candidates = await getCandidatesByProfileAndStatus(input.profile, input.status);

      return candidates.map((c) => ({
        ...c,
        specialties: c.specialties ? JSON.parse(c.specialties) : [],
        certifications: c.certifications ? JSON.parse(c.certifications) : [],
        additionalInfo: c.additionalInfo ? JSON.parse(c.additionalInfo) : {},
        pendingReasons: c.pendingReasons ? JSON.parse(c.pendingReasons) : [],
      }));
    }),

  /**
   * Atualizar status de candidato (admin)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ready", "pending", "rejected"]),
        pendingReasons: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      await updateCandidateStatus(
        input.id,
        input.status,
        input.pendingReasons ? JSON.stringify(input.pendingReasons) : undefined
      );

      await createSubmissionLog(input.id, "status_changed", {
        newStatus: input.status,
        reasons: input.pendingReasons,
      });

      return { success: true };
    }),
});
