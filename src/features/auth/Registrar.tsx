import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  MapPin,
  Phone,
  Users,
  Heart,
  Trophy,
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Shield,
  Activity,
  Video,
} from "lucide-react";

import { Stepper } from "../../components/ui/Stepper";
import { FileUpload } from "../../components/ui/FileUpload";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Checkbox } from "../../components/ui/Checkbox";
import { Button } from "../../components/ui/Button";
import { Card, CardTitle } from "../../components/ui/Card";

import { registrationSchema, type RegistrationFormData } from "../../utils/validation";
import {
  formatPhone,
  formatLandline,
  formatCEP,
  formatDate,
  calculateAge,
} from "../../utils/format";

export type { CategoryInfo } from "../../types";
import { Step1PersonalData, Step2Emergency, Step3Competition, Step4Documents, Step5Medical, Step6Extras, Step7Accepts } from "./RegistrarSteps";
import { signUp, login } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { ROUTES } from "../../lib/routes";
import { useAuth } from "../../context/AuthContext";
import { isAdminRole } from "../../lib/roles";
import { getCategoryId } from "../../lib/categories";
import { fetchMyPilot } from "../../lib/pilots";
import { uploadFile, saveDocuments, deleteFile } from "../../lib/storage";
import type { DocumentType } from "../../lib/storage";
import { normalizeDocumentNumber } from "../../domain/document";

type RegistrationDocuments = {
  photo: File | null;
  identity: File | null;
  terms: File | null;
  cnh: File | null;
};

const GENDER_OPTIONS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
  { value: "other", label: "Outro" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Solteiro(a)" },
  { value: "married", label: "Casado(a)" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed", label: "Viúvo(a)" },
];

const BLOOD_TYPE_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const STATE_OPTIONS = [
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
];

const STEPS = [
  { label: "Dados Pessoais", icon: <User className="w-5 h-5" /> },
  { label: "Emergência", icon: <Heart className="w-5 h-5" /> },
  { label: "Competição", icon: <Trophy className="w-5 h-5" /> },
  { label: "Documentos", icon: <Upload className="w-5 h-5" /> },
  { label: "Médico", icon: <Activity className="w-5 h-5" /> },
  { label: "Extras", icon: <Users className="w-5 h-5" /> },
  { label: "Aceites", icon: <Shield className="w-5 h-5" /> },
];

const STORAGE_KEY = "pilot_registration_draft";

export function Registrar() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [showDraftLoaded, setShowDraftLoaded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<RegistrationDocuments>({
    photo: null,
    identity: null,
    terms: null,
    cnh: null,
  });
  const [documentErrors, setDocumentErrors] = useState<Partial<Record<keyof RegistrationDocuments, string>>>({});

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      documentType: "",
      documentNumber: "",
      birthDate: "",
      gender: "",
      maritalStatus: "",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
      complement: "",
      phone: "",
      email: "",
      secondaryPhone: "",
      password: "",
      confirmPassword: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "",
      bloodType: "",
      competitionCategory: "",
      bikeNumber: "",
      teamName: "",
      teamCity: "",
      teamState: "",
      medicalBloodType: "",
      hasAllergies: false,
      hasMedication: false,
      hasCondition: false,
      acceptsRegulations: false,
      acceptsPrivacy: false,
      acceptsTruthfulness: false,
    },
  });

  const birthDate = useWatch({ control, name: "birthDate" });
  const cep = useWatch({ control, name: "cep" });
  const hasAllergies = useWatch({ control, name: "hasAllergies" });
  const hasMedication = useWatch({ control, name: "hasMedication" });
  const hasCondition = useWatch({ control, name: "hasCondition" });
  const acceptsRegulations = useWatch({ control, name: "acceptsRegulations" });
  const acceptsPrivacy = useWatch({ control, name: "acceptsPrivacy" });
  const acceptsTruthfulness = useWatch({ control, name: "acceptsTruthfulness" });

  const age = birthDate ? calculateAge(birthDate.split("/").reverse().join("-")) : 0;
  const isMinor = age < 18;
  const canSubmit = acceptsRegulations && acceptsPrivacy && acceptsTruthfulness;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        Object.keys(draft).forEach((key) => {
          if (draft[key] !== undefined && draft[key] !== "") {
            setValue(key as keyof RegistrationFormData, draft[key]);
          }
        });
        setShowDraftLoaded(true);
        setTimeout(() => setShowDraftLoaded(false), 3000);
      } catch (e) {
        console.error("Erro ao carregar rascunho:", e);
      }
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = setInterval(() => {
      const data = getValues();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 1000);
    return () => clearInterval(subscription);
  }, [getValues]);

  const fetchCep = useCallback(async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue("street", data.logradouro);
        setValue("neighborhood", data.bairro);
        setValue("city", data.localidade);
        setValue("state", data.uf);
        setValue("country", "Brasil");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setCepLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (cep && cep.replace(/\D/g, "").length === 8) {
      fetchCep(cep);
    }
  }, [cep, fetchCep]);

  const getMissingDocuments = () => {
    const missing: (keyof RegistrationDocuments)[] = [];
    if (!documents.photo) missing.push("photo");
    if (!documents.identity) missing.push("identity");
    if (!documents.terms) missing.push("terms");
    if (!isMinor && !documents.cnh) missing.push("cnh");
    return missing;
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      const missing = getMissingDocuments();
      if (missing.length > 0) {
        const errors: Partial<Record<keyof RegistrationDocuments, string>> = {};
        for (const key of missing) {
          errors[key] = "Documento obrigatório";
        }
        setDocumentErrors(errors);
        return;
      }
      setDocumentErrors({});
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const getFieldsForStep = (step: number): (keyof RegistrationFormData)[] => {
    switch (step) {
      case 0:
        return ["fullName", "documentType", "documentNumber", "birthDate", "gender", "cep", "street", "number", "neighborhood", "city", "state", "phone", "email", "password", "confirmPassword"];
      case 1:
        return ["emergencyName", "emergencyPhone", "emergencyRelation"];
      case 2:
        return ["competitionCategory"];
      case 3:
        return [];
      case 4:
        return hasAllergies ? ["allergiesDescription"] : [] as any;
      case 5:
        return [] as any;
      case 6:
        return [] as any;
      default:
        return [] as any;
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const DEBUG = import.meta.env.DEV;
    const traceId = Math.random().toString(36).slice(2, 10);

    if (DEBUG) console.groupCollapsed(`[Registrar ${traceId}] Novo cadastro (${data.email})`);

    try {
      // 1. Create user in Supabase Auth (or sign in if already registered)
      let userId: string | undefined;

      try {
        const authData = await signUp(data.email, data.password, {
          name: data.fullName,
          role: "pilot",
        });
        userId = authData.user?.id;
      } catch (signUpErr: any) {
        const msg = signUpErr?.message ?? "";
        if (msg.includes("already registered") || msg.includes("User already")) {
          if (DEBUG) console.log(`[${traceId}] Auth já existe — fazendo login`);
          const loginData = await login(data.email, data.password);
          userId = loginData.user?.id;
        } else {
          throw signUpErr;
        }
      }

      if (!userId) throw new Error("Erro ao autenticar usuário");
      if (DEBUG) console.log(`[${traceId}] ✓ Auth`, userId);

      // 2. Create pilot competitive profile first (needed for pilot_registrations.pilot_id)
      const existingPilot = await fetchMyPilot();
      let pilotId = existingPilot?.id;

      if (!pilotId) {
        const pilotCategoryId = await getCategoryId(data.competitionCategory);
        const docType = data.documentType || null;
        const docNumber = data.documentNumber
          ? normalizeDocumentNumber(data.documentNumber, data.documentType as any)
          : null;
        const { data: pilotData, error: pilotError } = await supabase
          .from("pilots")
          .insert({
            profile_id: userId,
            document_type: docType,
            document_number: docNumber,
            name: data.fullName,
            number: data.bikeNumber || null,
            category_id: pilotCategoryId,
            status: "active",
          })
          .select("id")
          .single();

        if (pilotError) throw pilotError;
        pilotId = pilotData.id;
        if (DEBUG) console.log(`[${traceId}] ✓ Pilot criado`, pilotId);
      } else {
        if (DEBUG) console.log(`[${traceId}] ✓ Pilot já existia`, pilotId);
      }

      // 3. Save pilot registration
      const number = `MX-${Date.now().toString().slice(-6)}`;
      const { data: regData, error: regError } = await supabase
        .from("pilot_registrations")
        .insert({
          pilot_id: pilotId,
          profile_id: userId,
          registration_number: number,
          full_name: data.fullName,
          birth_date: data.birthDate,
          gender: data.gender,
          marital_status: data.maritalStatus || null,
          cep: data.cep,
          street: data.street,
          address_number: data.number,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          country: data.country,
          complement: data.complement || null,
          phone: data.phone,
          email: data.email,
          secondary_phone: data.secondaryPhone || null,
          emergency_name: data.emergencyName,
          emergency_phone: data.emergencyPhone,
          emergency_relation: data.emergencyRelation,
          blood_type: data.bloodType || null,
          competition_category: data.competitionCategory,
          bike_number: data.bikeNumber || null,
          team_name: data.teamName || null,
          team_city: data.teamCity || null,
          team_state: data.teamState || null,
          medical_blood_type: data.medicalBloodType || null,
          has_allergies: data.hasAllergies,
          allergies_description: data.allergiesDescription || null,
          has_medication: data.hasMedication,
          medication_description: data.medicationDescription || null,
          has_condition: data.hasCondition,
          condition_description: data.conditionDescription || null,
          sponsors: data.sponsors || null,
          instagram: data.instagram || null,
          facebook: data.facebook || null,
          tiktok: data.tiktok || null,
          accepts_regulations: data.acceptsRegulations,
          accepts_privacy: data.acceptsPrivacy,
          accepts_truthfulness: data.acceptsTruthfulness,
        })
        .select("id")
        .single();

      if (regError) throw regError;

      const registrationId = regData.id;
      setRegistrationId(registrationId);
      if (DEBUG) console.log(`[${traceId}] ✓ Registration criada`, registrationId);

      // 4. Upload documents to Storage
      const docsToUpload: { documentType: DocumentType; file: File }[] = [];
      if (documents.photo) docsToUpload.push({ documentType: "photo", file: documents.photo });
      if (documents.identity) docsToUpload.push({ documentType: "identity", file: documents.identity });
      if (documents.terms) docsToUpload.push({ documentType: "terms", file: documents.terms });
      if (documents.cnh) docsToUpload.push({ documentType: "cnh", file: documents.cnh });

      const uploadedPaths: string[] = [];

      if (DEBUG) console.log(`[${traceId}] → Upload de ${docsToUpload.length} documentos`);

      try {
        const uploadResults = await Promise.all(
          docsToUpload.map(({ documentType, file }) =>
            uploadFile(userId, registrationId, documentType, file)
              .then((result) => {
                uploadedPaths.push(result.path);
                return { ...result, documentType };
              })
          )
        );

        if (DEBUG) console.log(`[${traceId}] ✓ Uploads concluídos`, uploadResults);
        if (DEBUG) console.log(`[${traceId}] → Salvando registration_documents...`);

        await saveDocuments(
          registrationId,
          uploadResults.map((r) => ({
            documentType: r.documentType,
            storagePath: r.path,
            mimeType: r.mimeType,
            fileSize: r.fileSize,
          }))
        );

        if (DEBUG) console.log(`[${traceId}] ✓ Documents salvos`);
      } catch (err) {
        console.error(`[${traceId}] ✗ ERRO no upload/documentos:`, err);

        if (DEBUG) console.log(`[${traceId}] [Cleanup] Removendo arquivos:`, uploadedPaths);
        await Promise.allSettled(
          uploadedPaths.map((p) => deleteFile(p))
        );
        if (DEBUG) console.log(`[${traceId}] [Cleanup] Removendo pilot`);
        await supabase.from("pilots").delete().eq("profile_id", userId);
        if (DEBUG) console.log(`[${traceId}] [Cleanup] Removendo registration`);
        await supabase.from("pilot_registrations").delete().eq("id", registrationId);
        if (DEBUG) console.log(`[${traceId}] [Cleanup] Concluído`);

        setIsSubmitting(false);
        setSubmitError("Não foi possível concluir sua inscrição. Faça login novamente e tente concluir o cadastro.");
        return;
      }

      setRegistrationNumber(number);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(`[${traceId}] ✗ ERRO:`, err);
      const message = err instanceof Error ? err.message : "Erro inesperado ao realizar inscrição";
      setSubmitError(message);
    } finally {
      if (DEBUG) console.groupEnd();
      setIsSubmitting(false);
    }
  };

  if (registrationNumber) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(225,29,72,0.08) 0%, transparent 70%)" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card padding="lg" className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="font-display font-bold text-2xl text-white mb-2">Cadastro realizado</h1>
            <p className="text-zinc-400 text-sm mb-6">Seu cadastro foi realizado com sucesso.</p>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate("/eventos")}
              >
                Ir para eventos
              </Button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate(isAdminRole(profile?.role) || profile?.role === "organizer" ? ROUTES.ADMIN : ROUTES.PILOT)}
              >
                Ir para perfil
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => navigate("/")}
              >
                Ir para home
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(225,29,72,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para login
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-600 rounded-[6px] flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white">Portal<span className="text-rose-500">MX</span></h1>
              <p className="text-xs text-zinc-500">Inscrição de Piloto</p>
            </div>
          </div>
        </div>

        {showDraftLoaded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-[6px] flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-400">Rascunho carregado automaticamente</span>
          </motion.div>
        )}

        <Stepper steps={STEPS} currentStep={currentStep} />

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-[6px] text-xs text-red-400"
          >
            {submitError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
          const errorFields = Object.keys(validationErrors) as (keyof RegistrationFormData)[];
          for (let step = 0; step < STEPS.length; step++) {
            const stepFields = getFieldsForStep(step);
            if (stepFields.some((f) => errorFields.includes(f))) {
              setCurrentStep(step);
              setSubmitError("Corrija os campos em vermelho antes de finalizar.");
              return;
            }
          }
        })}>
          <Card padding="lg" className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 0 && <Step1PersonalData control={control} register={register} errors={errors} setValue={setValue} />}
                {currentStep === 1 && <Step2Emergency control={control} register={register} errors={errors} />}
                {currentStep === 2 && <Step3Competition control={control} register={register} errors={errors} />}
                {currentStep === 3 && <Step4Documents documents={documents} setDocuments={setDocuments} documentErrors={documentErrors} isMinor={isMinor} />}
                {currentStep === 4 && <Step5Medical control={control} register={register} errors={errors} hasAllergies={hasAllergies} hasMedication={hasMedication} hasCondition={hasCondition} />}
                {currentStep === 5 && <Step6Extras control={control} register={register} errors={errors} />}
                {currentStep === 6 && <Step7Accepts control={control} register={register} canSubmit={canSubmit} />}
              </motion.div>
            </AnimatePresence>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const data = getValues();
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                }}
                icon={<Save className="w-4 h-4" />}
              >
                Salvar
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  disabled={!canSubmit}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Finalizar Inscrição
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-zinc-600">
            Etapa {currentStep + 1} de {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}