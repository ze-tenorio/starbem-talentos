/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/**
 * Tipos customizados para banco de talentos
 */

export type ProfessionalProfile = 
  | "clinical_doctor"
  | "specialist_doctor"
  | "psychologist"
  | "nutritionist";

export type CandidateStatus = "ready" | "pending" | "rejected";

export type CNPJStatus = "yes" | "no" | "pending";

export const PROFESSIONAL_PROFILES: Record<ProfessionalProfile, string> = {
  clinical_doctor: "Médico Clínico",
  specialist_doctor: "Médico Especialista",
  psychologist: "Psicólogo",
  nutritionist: "Nutricionista",
};

export const REGISTRATION_CODES: Record<ProfessionalProfile, string> = {
  clinical_doctor: "CRM",
  specialist_doctor: "CRM",
  psychologist: "CRP",
  nutritionist: "CRN",
};

export const MEDICAL_SPECIALTIES = [
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Oncologia",
  "Ortopedia",
  "Otorrinolaringologia",
  "Pediatria",
  "Pneumologia",
  "Psiquiatria",
  "Reumatologia",
  "Urologia",
  "Outra",
];

export const PSYCHOLOGY_APPROACHES = [
  "Cognitivo-Comportamental",
  "Psicanálise",
  "Humanista",
  "Gestalt",
  "Sistêmica",
  "Transpessoal",
  "Outra",
];

export const NUTRITION_SPECIALIZATIONS = [
  "Nutrição Clínica",
  "Nutrição Esportiva",
  "Nutrição Infantil",
  "Nutrição Geriátrica",
  "Nutrição Hospitalar",
  "Nutrição Funcional",
  "Outra",
];

export const S3_FOLDER_STRUCTURE = {
  clinical_doctor: "medicina-clinica",
  specialist_doctor: "medicina-especialidades",
  psychologist: "psicologia",
  nutritionist: "nutricao",
};

export const CONTABILIZEI_URL = "https://e.contabilizei.com.br/parceria-starbem-e-contabilizei";


export const WHATSAPP_GROUPS: Record<ProfessionalProfile, string> = {
  clinical_doctor: "https://chat.whatsapp.com/JQNGq223gjN77Bl0SUF6ex?mode=gi_t",
  specialist_doctor: "",
  psychologist: "",
  nutritionist: "",
};
