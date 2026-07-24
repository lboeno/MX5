import { z } from "zod";
import { validateEmail } from "../utils/format";
import { validateDocumentNumber } from "../domain/document";

export const registrationSchema = z.object({
  // Dados Pessoais
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  documentType: z.string().min(1, "Tipo de documento é obrigatório"),
  documentNumber: z.string().min(1, "Número do documento é obrigatório"),
  birthDate: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val.split("/").reverse().join("-"));
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 6 && age <= 100;
  }, "Data de nascimento inválida (idade entre 6 e 100 anos)"),
  gender: z.string().min(1, "Gênero é obrigatório"),
  maritalStatus: z.string().optional(),
  
  // Endereço
  cep: z.string().min(8, "CEP é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado é obrigatório"),
  country: z.string(),
  complement: z.string().optional(),
  
  // Contato
  phone: z.string().refine((val) => val.replace(/\D/g, "").length === 11, "Celular inválido"),
  email: z.string().refine((val) => validateEmail(val), "E-mail inválido"),
  secondaryPhone: z.string().optional(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
  
  // Contato de Emergência
  emergencyName: z.string().min(3, "Nome é obrigatório"),
  emergencyPhone: z.string().refine((val) => val.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  emergencyRelation: z.string().min(1, "Grau de parentesco é obrigatório"),
  bloodType: z.string().optional(),
  
  // Dados da Competição
  competitionCategory: z.string().min(1, "Categoria é obrigatória"),
  bikeNumber: z.string().optional(),
  teamName: z.string().optional(),
  teamCity: z.string().optional(),
  teamState: z.string().optional(),
  // Informações Médicas
  medicalBloodType: z.string().optional(),
  hasAllergies: z.boolean(),
  allergiesDescription: z.string().optional(),
  hasMedication: z.boolean(),
  medicationDescription: z.string().optional(),
  hasCondition: z.boolean(),
  conditionDescription: z.string().optional(),
  
  // Informações Extras
  sponsors: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  
  // Aceites
  acceptsRegulations: z.boolean().refine((val) => val === true, "É necessário aceitar o regulamento"),
  acceptsPrivacy: z.boolean().refine((val) => val === true, "É necessário aceitar a política de privacidade"),
  acceptsTruthfulness: z.boolean().refine((val) => val === true, "É necessário confirmar a veracidade"),
}).refine((data) => {
  const error = validateDocumentNumber(data.documentNumber, data.documentType as any);
  if (error) return false;
  return true;
}, {
  message: "Documento inválido",
  path: ["documentNumber"],
}).refine((data) => {
  if (data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.hasAllergies && !data.allergiesDescription) {
    return false;
  }
  return true;
}, {
  message: "Descreva as alergias",
  path: ["allergiesDescription"],
}).refine((data) => {
  if (data.hasMedication && !data.medicationDescription) {
    return false;
  }
  return true;
}, {
  message: "Descreva os medicamentos",
  path: ["medicationDescription"],
}).refine((data) => {
  if (data.hasCondition && !data.conditionDescription) {
    return false;
  }
  return true;
}, {
  message: "Descreva a condição",
  path: ["conditionDescription"],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;