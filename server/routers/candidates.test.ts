import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import type { User } from "../../drizzle/schema";

/**
 * Mock de contexto para testes
 */
function createMockContext(isAdmin: boolean = false): TrpcContext {
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
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("candidates router", () => {
  describe("submit", () => {
    it("deve submeter um candidato com sucesso", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.candidates.submit({
        fullName: "Dr. João Silva",
        email: "joao@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "123456",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
        specialties: ["Cardiologia"],
        certifications: ["Especialização"],
      });

      expect(result.success).toBe(true);
      expect(result.candidateId).toBeDefined();
      expect(result.needsCNPJ).toBe(false);
    });

    it("deve marcar como pendente quando sem CNPJ", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.candidates.submit({
        fullName: "Dra. Maria Santos",
        email: "maria@example.com",
        phone: "11988888888",
        professionalProfile: "psychologist",
        registrationNumber: "654321",
        registrationState: "RJ",
        yearsOfExperience: 3,
        hasCNPJ: "no",
        specialties: ["Cognitivo-Comportamental"],
      });

      expect(result.success).toBe(true);
      expect(result.needsCNPJ).toBe(true);
      expect(result.status).toBe("pending");
    });

    it("deve rejeitar candidato com experiência insuficiente para especialista", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.candidates.submit({
        fullName: "Dr. Pedro Costa",
        email: "pedro@example.com",
        phone: "11977777777",
        professionalProfile: "specialist_doctor",
        registrationNumber: "111111",
        registrationState: "MG",
        yearsOfExperience: 1, // Menos de 3 anos exigidos
        hasCNPJ: "yes",
        specialties: ["Cardiologia"],
      });

      expect(result.status).toBe("pending");
    });

    it("deve validar email inválido", async () => {
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
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toContain("Email");
      }
    });

    it("deve validar telefone inválido", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.candidates.submit({
          fullName: "Dr. Test",
          email: "test@example.com",
          phone: "123", // Telefone muito curto
          professionalProfile: "clinical_doctor",
          registrationNumber: "123456",
          registrationState: "SP",
          yearsOfExperience: 5,
          hasCNPJ: "yes",
        });
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toContain("Telefone");
      }
    });
  });

  describe("getById", () => {
    it("deve retornar candidato por ID", async () => {
      const caller = appRouter.createCaller(createMockContext());

      // Primeiro, submeter um candidato
      const submitResult = await caller.candidates.submit({
        fullName: "Dr. Test",
        email: "test@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "123456",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
      });

      // Depois, buscar o candidato
      const candidate = await caller.candidates.getById({
        id: submitResult.candidateId,
      });

      expect(candidate).toBeDefined();
      expect(candidate.fullName).toBe("Dr. Test");
      expect(candidate.email).toBe("test@example.com");
    });

    it("deve lançar erro quando candidato não existe", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.candidates.getById({ id: 99999 });
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toContain("não encontrado");
      }
    });
  });

  describe("listByProfileAndStatus", () => {
    it("deve listar candidatos por perfil e status (admin only)", async () => {
      const adminCaller = appRouter.createCaller(createMockContext(true));

      // Submeter alguns candidatos
      await adminCaller.candidates.submit({
        fullName: "Dr. Admin Test 1",
        email: "admin1@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "111111",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
      });

      await adminCaller.candidates.submit({
        fullName: "Dr. Admin Test 2",
        email: "admin2@example.com",
        phone: "11988888888",
        professionalProfile: "clinical_doctor",
        registrationNumber: "222222",
        registrationState: "RJ",
        yearsOfExperience: 3,
        hasCNPJ: "no",
      });

      // Listar candidatos
      const candidates = await adminCaller.candidates.listByProfileAndStatus({
        profile: "clinical_doctor",
        status: "ready",
      });

      expect(Array.isArray(candidates)).toBe(true);
      expect(candidates.length).toBeGreaterThan(0);
    });

    it("deve rejeitar acesso não-admin", async () => {
      const userCaller = appRouter.createCaller(createMockContext(false));

      try {
        await userCaller.candidates.listByProfileAndStatus({
          profile: "clinical_doctor",
          status: "ready",
        });
        expect.fail("Deveria ter rejeitado acesso");
      } catch (error: any) {
        expect(error.message).toContain("Acesso negado");
      }
    });
  });

  describe("updateStatus", () => {
    it("deve atualizar status de candidato (admin only)", async () => {
      const adminCaller = appRouter.createCaller(createMockContext(true));

      // Submeter candidato
      const submitResult = await adminCaller.candidates.submit({
        fullName: "Dr. Update Test",
        email: "update@example.com",
        phone: "11999999999",
        professionalProfile: "clinical_doctor",
        registrationNumber: "333333",
        registrationState: "SP",
        yearsOfExperience: 5,
        hasCNPJ: "yes",
      });

      // Atualizar status
      const updateResult = await adminCaller.candidates.updateStatus({
        id: submitResult.candidateId,
        status: "rejected",
        pendingReasons: ["Não atende aos critérios"],
      });

      expect(updateResult.success).toBe(true);

      // Verificar se status foi atualizado
      const candidate = await adminCaller.candidates.getById({
        id: submitResult.candidateId,
      });

      expect(candidate.status).toBe("rejected");
    });

    it("deve rejeitar atualização por não-admin", async () => {
      const userCaller = appRouter.createCaller(createMockContext(false));

      try {
        await userCaller.candidates.updateStatus({
          id: 1,
          status: "ready",
        });
        expect.fail("Deveria ter rejeitado acesso");
      } catch (error: any) {
        expect(error.message).toContain("Acesso negado");
      }
    });
  });
});
