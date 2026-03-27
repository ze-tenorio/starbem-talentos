import { useState } from "react";
import { useLocation } from "wouter";
import { FormMultiStep, type FormStep, type FormField } from "@/components/FormMultiStep";
import { trpc } from "@/lib/trpc";
import {
  PROFESSIONAL_PROFILES,
  REGISTRATION_CODES,
  MEDICAL_SPECIALTIES,
  PSYCHOLOGY_APPROACHES,
  NUTRITION_SPECIALIZATIONS,
  CONTABILIZEI_URL,
} from "@shared/types";

/**
 * Validadores customizados
 */
const validators = {
  email: (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : "Email inválido";
  },
  phone: (value: string) => {
    const regex = /^(\d{10,11})$/;
    const cleaned = value.replace(/\D/g, "");
    return regex.test(cleaned) ? null : "Telefone deve ter 10 ou 11 dígitos";
  },
  crm: (value: string) => {
    return value.length >= 4 ? null : "CRM deve ter pelo menos 4 dígitos";
  },
  cnpj: (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length === 14 ? null : "CNPJ deve ter 14 dígitos";
  },
};

/**
 * Gerar etapas do formulário baseado no perfil
 */
function generateFormSteps(profile: string): FormStep[] {
  const specialtyField: FormField = {
    name: "specialties",
    label: "Especialidade",
    type: "select",
    required: true,
    options: MEDICAL_SPECIALTIES.map((s) => ({ value: s, label: s })),
  };

  const baseSteps: FormStep[] = [
    {
      id: "profile",
      title: "Qual é seu perfil profissional?",
      description: "Selecione a opção que melhor descreve sua área de atuação",
      fields: [
        {
          name: "professionalProfile",
          label: "Perfil Profissional",
          type: "radio",
          required: true,
          options: [
            { value: "clinical_doctor", label: "Médico Clínico" },
            { value: "specialist_doctor", label: "Médico Especialista" },
            { value: "psychologist", label: "Psicólogo" },
            { value: "nutritionist", label: "Nutricionista" },
          ],
        },
      ],
    },
    {
      id: "personal",
      title: "Informações Pessoais",
      description: "Nos ajude a conhecer melhor seus dados de contato",
      fields: [
        {
          name: "fullName",
          label: "Nome Completo",
          type: "text",
          placeholder: "Seu nome completo",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "seu@email.com",
          required: true,
          validation: validators.email,
        },
        {
          name: "phone",
          label: "Telefone",
          type: "tel",
          placeholder: "(11) 99999-9999",
          required: true,
          validation: validators.phone,
        },
      ],
    },
    {
      id: "registration",
      title: "Registro Profissional",
      description: "Informe seu número de registro profissional",
      fields: [
        {
          name: "registrationNumber",
          label:
            profile === "clinical_doctor" || profile === "specialist_doctor"
              ? "CRM"
              : profile === "psychologist"
                ? "CRP"
                : "CRN",
          type: "text",
          placeholder: "Número do registro",
          required: true,
          validation: validators.crm,
        },
        {
          name: "registrationState",
          label: "Estado (UF)",
          type: "select",
          required: true,
          options: [
            { value: "AC", label: "Acre" },
            { value: "AL", label: "Alagoas" },
            { value: "AP", label: "Amapá" },
            { value: "AM", label: "Amazonas" },
            { value: "BA", label: "Bahia" },
            { value: "CE", label: "Ceará" },
            { value: "DF", label: "Distrito Federal" },
            { value: "ES", label: "Espírito Santo" },
            { value: "GO", label: "Goiás" },
            { value: "MA", label: "Maranhão" },
            { value: "MT", label: "Mato Grosso" },
            { value: "MS", label: "Mato Grosso do Sul" },
            { value: "MG", label: "Minas Gerais" },
            { value: "PA", label: "Pará" },
            { value: "PB", label: "Paraíba" },
            { value: "PR", label: "Paraná" },
            { value: "PE", label: "Pernambuco" },
            { value: "PI", label: "Piauí" },
            { value: "RJ", label: "Rio de Janeiro" },
            { value: "RN", label: "Rio Grande do Norte" },
            { value: "RS", label: "Rio Grande do Sul" },
            { value: "RO", label: "Rondônia" },
            { value: "RR", label: "Roraima" },
            { value: "SC", label: "Santa Catarina" },
            { value: "SP", label: "São Paulo" },
            { value: "SE", label: "Sergipe" },
            { value: "TO", label: "Tocantins" },
          ],
        },
      ],
    },
    {
      id: "experience",
      title: "Experiência Profissional",
      description: "Informe sua experiência e especializações",
      fields: [
        {
          name: "yearsOfExperience",
          label: "Anos de Experiência",
          type: "number",
          placeholder: "0",
          required: true,
        },
        ...(profile === "clinical_doctor" || profile === "specialist_doctor"
          ? [
              {
                name: "specialties",
                label:
                  profile === "specialist_doctor"
                    ? "Especialidade Principal"
                    : "Especialidades",
                type: "select" as const,
                required: true,
                options: MEDICAL_SPECIALTIES.map((s) => ({ value: s, label: s })),
              },
            ]
          : []),
        ...(profile === "psychologist"
          ? [
              {
                name: "specialties",
                label: "Abordagem Terapêutica",
                type: "select" as const,
                required: true,
                options: PSYCHOLOGY_APPROACHES.map((a) => ({ value: a, label: a })),
              },
            ]
          : []),
        ...(profile === "nutritionist"
          ? [
              {
                name: "specialties",
                label: "Especialização",
                type: "select" as const,
                required: true,
                options: NUTRITION_SPECIALIZATIONS.map((s) => ({
                  value: s,
                  label: s,
                })),
              },
            ]
          : []),
      ],
    },
    {
      id: "availability",
      title: "Disponibilidade de Atendimento",
      description: "Selecione os dias da semana e turnos em que você está disponível",
      fields: [
        {
          name: "availableDays",
          label: "Dias da Semana",
          type: "checkbox",
          required: true,
          options: [
            { value: "segunda", label: "Segunda-feira" },
            { value: "terca", label: "Terça-feira" },
            { value: "quarta", label: "Quarta-feira" },
            { value: "quinta", label: "Quinta-feira" },
            { value: "sexta", label: "Sexta-feira" },
            { value: "sabado", label: "Sábado" },
            { value: "domingo", label: "Domingo" },
          ],
        },
        {
          name: "availableShifts",
          label: "Turnos",
          type: "checkbox",
          required: true,
          options: [
            { value: "manha", label: "Manhã (6h - 12h)" },
            { value: "tarde", label: "Tarde (12h - 18h)" },
            { value: "noite", label: "Noite (18h - 24h)" },
          ],
        },
      ],
    },
    {
      id: "formalization",
      title: "Formalização Empresarial",
      description: "Informe se sua empresa está formalizada com CNPJ",
      fields: [
        {
          name: "hasCNPJ",
          label: "Você possui CNPJ formalizado?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Sim, tenho CNPJ" },
            { value: "no", label: "Não tenho CNPJ, quero formalizar agora" },
            { value: "pending", label: "Já estou em processo de formalização" },
          ],
        },
      ],
    },
  ];

  return baseSteps;
}

export default function TalentForm() {
  const [, setLocation] = useLocation();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const submitCandidateMutation = trpc.candidates.submit.useMutation();

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      // Se o candidato nao tem CNPJ, redirecionar para Contabilizei
      if (formData.hasCNPJ === "no") {
        // Abrir link da Contabilizei em nova aba
        window.open(CONTABILIZEI_URL, "_blank");
        
        // Salvar candidato como pendente no banco de dados
        const result = await submitCandidateMutation.mutateAsync({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ""),
          professionalProfile: formData.professionalProfile,
          registrationNumber: formData.registrationNumber,
          registrationState: formData.registrationState,
          yearsOfExperience: formData.yearsOfExperience,
          hasCNPJ: "pending",
          cnpj: "",
          companyName: "",
          specialties: formData.specialties ? [formData.specialties] : [],
          certifications: formData.certifications ? [formData.certifications] : [],
          availableDays: formData.availableDays || [],
          availableShifts: formData.availableShifts || [],
        });
        
        // Redirecionar para pagina de boas-vindas com mensagem especial
        setLocation(`/welcome/${result.candidateId}?redirected=true`);
        return;
      }

      // Fluxo normal para candidatos com CNPJ
      const result = await submitCandidateMutation.mutateAsync({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ""),
        professionalProfile: formData.professionalProfile,
        registrationNumber: formData.registrationNumber,
        registrationState: formData.registrationState,
        yearsOfExperience: formData.yearsOfExperience,
        hasCNPJ: formData.hasCNPJ,
        cnpj: formData.cnpj,
        companyName: formData.companyName,
        specialties: formData.specialties ? [formData.specialties] : [],
        certifications: formData.certifications ? [formData.certifications] : [],
        availableDays: formData.availableDays || [],
        availableShifts: formData.availableShifts || [],
      });

      // Redirecionar para página de boas-vindas
      setLocation(`/welcome/${result.candidateId}`);
    } catch (error) {
      console.error("Erro ao submeter:", error);
      throw error;
    }
  };

  const steps = generateFormSteps(selectedProfile || "clinical_doctor");

  return (
    <FormMultiStep
      steps={steps}
      onSubmit={handleSubmit}
      onCancel={() => setLocation("/")}
    />
  );
}
