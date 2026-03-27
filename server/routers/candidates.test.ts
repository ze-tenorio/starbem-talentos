import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import type { User } from "../../drizzle/schema";

function createMockContext(options: { isAdmin?: boolean; isSupabaseAuth?: boolean } = {}): TrpcContext {
  const { isAdmin = false, isSupabaseAuth = false } = options;

  const user: User = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: isAdmin ? "admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    supabaseUser: isSupabaseAuth
      ? { id: "supabase-uid", email: "admin@starbem.com" } as any
      : null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("candidates router", () => {
  describe("submit", () => {
    it("deve qualificar nivel 1: tem CNPJ + alta disponibilidade", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.candidates.submit({
        fullName: "Dr. Joao Silva",
        email: "joao@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "123456",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
        specialties: ["Cardiologia"],
        availableDays: ["segunda", "terca", "quarta", "quinta"],
        availableShifts: ["manha", "tarde"],
      });

      expect(result.success).toBe(true);
      expect(result.candidateId).toBeDefined();
      expect(result.qualificationLevel).toBe(1);
      expect(result.status).toBe("qualified");
      expect(result.needsCNPJ).toBe(false);
    });

    it("deve qualificar nivel 2: tem CNPJ mas baixa disponibilidade", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.candidates.submit({
        fullName: "Dra. Maria Santos",
        email: "maria@example.com",
        phone: "11988888888",
        professionalProfile: "psychologist",
        registrationNumber: "654321",
        registrationState: "RJ",
        yearsOfExperience: 3,
        hasCNPJ: "yes",
        specialties: ["Cognitivo-Comportamental"],
        availableDays: ["segunda"],
        availableShifts: ["manha"],
      });

      expect(result.success).toBe(true);
      expect(result.qualificationLevel).toBe(2);
      expect(result.status).toBe("semi_qualified");
    });

    it("deve qualificar nivel 2: sem CNPJ mas alta disponibilidade", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.candidates.submit({
        fullName: "Dra. Ana Costa",
        email: "ana@example.com",
        phone: "11977777777",
        professionalProfile: "nutritionist",
        registrationNumber: "111111",
        registrationState: "MG",
        yearsOfExperience: 4,
        hasCNPJ: "no",
        specialties: ["Nutricao Clinica"],
        availableDays: ["segunda", "terca", "quarta", "quinta", "sexta"],
        availableShifts: ["manha", "tarde"],
      });

      expect(result.success).toBe(true);
      expect(result.qualificationLevel).toBe(2);
      expect(result.status).toBe("semi_qualified");
      expect(result.needsCNPJ).toBe(true);
    });

    it("deve qualificar nivel 3: sem CNPJ + baixa disponibilidade", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.candidates.submit({
        fullName: "Dr. Pedro Lima",
        email: "pedro@example.com",
        phone: "11966666666",
        professionalProfile: "clinical_doctor",
        registrationNumber: "222222",
        registrationState: "SP",
        yearsOfExperience: 2,
        hasCNPJ: "no",
        availableDays: ["segunda"],
        availableShifts: ["manha"],
      });

      expect(result.success).toBe(true);
      expect(result.qualificationLevel).toBe(3);
      expect(result.status).toBe("not_qualified");
    });

    it("deve validar email invalido", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.candidates.submit({
          fullName: "Dr. Test",
          email: "invalid-email",
          phone: "11999999999",
          professionalProfile: "clinical_doctor",
          registrationNumber: "123456",
          registrationState: "SP",
          yearsOfExperience: 5,
          hasCNPJ: "yes",
        });
        expect.fail("Deveria ter lancado erro");
      } catch (error: any) {
        expect(error.message).toContain("Email");
      }
    });

    it("deve validar telefone invalido", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.candidates.submit({
          fullName: "Dr. Test",
          email: "test@example.com",
          phone: "123",
          professionalProfile: "clinical_doctor",
          registrationNumber: "123456",
          registrationState: "SP",
          yearsOfExperience: 5,
          hasCNPJ: "yes",
        });
        expect.fail("Deveria ter lancado erro");
      } catch (error: any) {
        expect(error.message).toContain("Telefone");
      }
    });
  });

  describe("getById", () => {
    it("deve retornar candidato por ID", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const submitResult = await caller.candidates.submit({
        fullName: "Dr. Test",
        email: "test@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "123456",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
        availableDays: ["segunda", "terca", "quarta", "quinta"],
        availableShifts: ["manha", "tarde"],
      });

      const candidate = await caller.candidates.getById({
        id: submitResult.candidateId,
      });

      expect(candidate).toBeDefined();
      expect(candidate.fullName).toBe("Dr. Test");
      expect(candidate.email).toBe("test@example.com");
    });

    it("deve lancar erro quando candidato nao existe", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.candidates.getById({ id: 99999 });
        expect.fail("Deveria ter lancado erro");
      } catch (error: any) {
        expect(error.message).toContain("nao encontrado");
      }
    });
  });

  describe("listByProfileAndStatus", () => {
    it("deve rejeitar acesso sem autenticacao Supabase", async () => {
      const userCaller = appRouter.createCaller(createMockContext({ isSupabaseAuth: false }));

      try {
        await userCaller.candidates.listByProfileAndStatus({
          profile: "clinical_doctor",
          status: "qualified",
        });
        expect.fail("Deveria ter rejeitado acesso");
      } catch (error: any) {
        expect(error.message).toContain("Supabase");
      }
    });

    it("deve permitir acesso com autenticacao Supabase", async () => {
      const adminCaller = appRouter.createCaller(createMockContext({ isSupabaseAuth: true }));

      await adminCaller.candidates.submit({
        fullName: "Dr. Admin Test 1",
        email: "admin1@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "111111",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
        availableDays: ["segunda", "terca", "quarta", "quinta"],
        availableShifts: ["manha", "tarde"],
      });

      const candidates = await adminCaller.candidates.listByProfileAndStatus({
        profile: "clinical_doctor",
        status: "qualified",
      });

      expect(Array.isArray(candidates)).toBe(true);
    });
  });

  describe("updateStatus", () => {
    it("deve atualizar status de candidato (admin Supabase)", async () => {
      const adminCaller = appRouter.createCaller(createMockContext({ isSupabaseAuth: true }));

      const submitResult = await adminCaller.candidates.submit({
        fullName: "Dr. Update Test",
        email: "update@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "333333",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
        availableDays: ["segunda", "terca", "quarta", "quinta"],
        availableShifts: ["manha", "tarde"],
      });

      const updateResult = await adminCaller.candidates.updateStatus({
        id: submitResult.candidateId,
        status: "not_qualified",
        pendingReasons: ["Nao atende aos criterios"],
      });

      expect(updateResult.success).toBe(true);

      const candidate = await adminCaller.candidates.getById({
        id: submitResult.candidateId,
      });

      expect(candidate.status).toBe("not_qualified");
    });

    it("deve rejeitar atualizacao sem auth Supabase", async () => {
      const userCaller = appRouter.createCaller(createMockContext({ isSupabaseAuth: false }));

      try {
        await userCaller.candidates.updateStatus({
          id: 1,
          status: "qualified",
        });
        expect.fail("Deveria ter rejeitado acesso");
      } catch (error: any) {
        expect(error.message).toContain("Supabase");
      }
    });
  });
});
