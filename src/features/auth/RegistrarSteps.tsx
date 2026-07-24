import { type Control, type UseFormRegister, FieldErrors, Controller } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { FileUpload } from "../../components/ui/FileUpload";
import { Checkbox } from "../../components/ui/Checkbox";
import type { RegistrationFormData } from "../../utils/validation";
import { formatPhone, formatCEP, formatDate, formatLandline } from "../../utils/format";
import { DOCUMENT_TYPES, DOCUMENT_LABELS } from "../../domain/document";
import { Camera, Globe, Video, CheckCircle } from "lucide-react";
import { CATEGORY_OPTIONS as CATEGORIES } from "./categorias";

interface Step1Props {
  control: Control<RegistrationFormData>;
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
  setValue: any;
}

interface Step2Props {
  control: Control<RegistrationFormData>;
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
}

interface Step3Props {
  control: Control<RegistrationFormData>;
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
}

interface Step4Props {
  documents: {
    photo: File | null;
    identity: File | null;
    terms: File | null;
    cnh: File | null;
  };
  setDocuments: React.Dispatch<React.SetStateAction<{
    photo: File | null;
    identity: File | null;
    terms: File | null;
    cnh: File | null;
  }>>;
  documentErrors: Partial<Record<"photo" | "identity" | "terms" | "cnh", string>>;
  isMinor: boolean;
}

interface Step5Props {
  control: Control<RegistrationFormData>;
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
  hasAllergies: boolean;
  hasMedication: boolean;
  hasCondition: boolean;
}

interface Step6Props {
  control: Control<RegistrationFormData>;
  register: UseFormRegister<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
}

interface Step7Props {
  control: Control<RegistrationFormData>;
  register: UseFormRegister<RegistrationFormData>;
  canSubmit: boolean;
}

export function Step1PersonalData({ control, register, errors, setValue }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle title="Informações Básicas" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              required
              error={errors.fullName?.message}
              {...register("fullName")}
            />
          </div>

          <Controller
            control={control}
            name="documentType"
            render={({ field }) => (
              <Select
                label="Tipo de Documento"
                required
                error={errors.documentType?.message}
                options={DOCUMENT_TYPES.map((t) => ({ value: t, label: DOCUMENT_LABELS[t] }))}
                placeholder="Selecione"
                {...field}
              />
            )}
          />

          <Input
            label="Número do Documento"
            placeholder="Digite o número do documento"
            required
            error={errors.documentNumber?.message}
            {...register("documentNumber")}
          />

          <Input
            label="Data de Nascimento"
            placeholder="DD/MM/AAAA"
            required
            error={errors.birthDate?.message}
            {...register("birthDate", {
              onChange: (e) => {
                e.target.value = formatDate(e.target.value);
              },
            })}
          />

          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select
                label="Gênero"
                required
                error={errors.gender?.message}
                options={GENDER_OPTIONS}
                placeholder="Selecione"
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="maritalStatus"
            render={({ field }) => (
              <Select
                label="Estado Civil"
                options={MARITAL_STATUS_OPTIONS}
                placeholder="Selecione (opcional)"
                {...field}
              />
            )}
          />
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <CardTitle title="Endereço" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Input
            label="CEP"
            placeholder="00000-000"
            required
            error={errors.cep?.message}
            {...register("cep", {
              onChange: (e) => {
                e.target.value = formatCEP(e.target.value);
              },
            })}
          />

          <div className="lg:col-span-2">
            <Input
              label="Rua"
              placeholder="Nome da rua"
              required
              error={errors.street?.message}
              {...register("street")}
            />
          </div>

          <Input
            label="Número"
            placeholder="Número"
            required
            error={errors.number?.message}
            {...register("number")}
          />

          <Input
            label="Complemento"
            placeholder="Apto, Bloco, etc. (opcional)"
            {...register("complement")}
          />

          <Input
            label="Bairro"
            placeholder="Bairro"
            required
            error={errors.neighborhood?.message}
            {...register("neighborhood")}
          />

          <Input
            label="Cidade"
            placeholder="Cidade"
            required
            error={errors.city?.message}
            {...register("city")}
          />

          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <Select
                label="Estado"
                required
                error={errors.state?.message}
                options={STATE_OPTIONS}
                placeholder="UF"
                {...field}
              />
            )}
          />

          <Input
            label="País"
            placeholder="País"
            defaultValue="Brasil"
            {...register("country")}
          />
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <CardTitle title="Contato" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Celular"
            placeholder="(00) 00000-0000"
            required
            error={errors.phone?.message}
            {...register("phone", {
              onChange: (e) => {
                e.target.value = formatPhone(e.target.value);
              },
            })}
          />

          <Input
            label="E-mail"
            placeholder="seu@email.com"
            type="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Telefone (Opcional)"
            placeholder="(00) 0000-0000"
            {...register("secondaryPhone", {
              onChange: (e) => {
                e.target.value = formatLandline(e.target.value);
              },
            })}
          />
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <CardTitle title="Segurança" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            type="password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirmar Senha"
            placeholder="Repita a senha"
            type="password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>
      </div>
    </div>
  );
}

function CardTitle({ title }: { title: string }) {
  return (
    <h3 className="font-display font-semibold text-zinc-100 text-[15px] flex items-center gap-2">
      <div className="w-1 h-4 bg-rose-600 rounded-full" />
      {title}
    </h3>
  );
}

function InfoIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

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

export function Step2Emergency({ control, register, errors }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle title="Contato de Emergência" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Nome Completo"
            placeholder="Nome do contato de emergência"
            required
            error={errors.emergencyName?.message}
            {...register("emergencyName")}
          />

          <Input
            label="Telefone"
            placeholder="(00) 0000-0000"
            required
            error={errors.emergencyPhone?.message}
            {...register("emergencyPhone", {
              onChange: (e) => {
                e.target.value = formatPhone(e.target.value);
              },
            })}
          />

          <Input
            label="Grau de Parentesco"
            placeholder="Ex: Pai, Mãe, Esposa, etc."
            required
            error={errors.emergencyRelation?.message}
            {...register("emergencyRelation")}
          />

          <Controller
            control={control}
            name="bloodType"
            render={({ field }) => (
              <Select
                label="Tipo Sanguíneo"
                options={BLOOD_TYPE_OPTIONS}
                placeholder="Selecione (opcional)"
                {...field}
              />
            )}
          />
        </div>
      </div>

      <div className="bg-amber-950/20 border border-amber-900 rounded-[6px] p-4 mt-6">
        <p className="text-xs text-amber-400 flex items-start gap-2">
          <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          O contato de emergência será acionado em caso de acidentes ou imprevistos durante os eventos.
        </p>
      </div>
    </div>
  );
}

export function Step3Competition({ control, register, errors }: Step3Props) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle title="Dados da Competição" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Controller
            control={control}
            name="competitionCategory"
            render={({ field }) => (
              <Select
                label="Categoria"
                required
                error={errors.competitionCategory?.message}
                options={CATEGORIES}
                placeholder="Selecione a categoria"
                {...field}
              />
            )}
          />

          <Input
            label="Número da Moto"
            placeholder="Ex: 1, 7, 21, 88"
            {...register("bikeNumber")}
          />

          <Input
            label="Nome da Equipe"
            placeholder="Sua equipe (opcional)"
            {...register("teamName")}
          />

          <Input
            label="Cidade da Equipe"
            placeholder="Cidade base da equipe"
            {...register("teamCity")}
          />

          <Controller
            control={control}
            name="teamState"
            render={({ field }) => (
              <Select
                label="Estado da Equipe"
                options={STATE_OPTIONS}
                placeholder="UF (opcional)"
                {...field}
              />
            )}
          />

        </div>
      </div>

      <div className="bg-blue-950/20 border border-blue-900 rounded-[6px] p-4 mt-6">
        <p className="text-xs text-blue-400 flex items-start gap-2">
          <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          A categoria deve corresponder à sua habilitação e nível de experiência. Em caso de dúvidas, consulte o regulamento.
        </p>
      </div>
    </div>
  );
}

export function Step4Documents({ documents, setDocuments, documentErrors, isMinor }: Step4Props) {
  const handleChange = (key: keyof typeof documents, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  return (
    <div className="space-y-6">
      <div>
        <CardTitle title="Documentos Obrigatórios" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FileUpload
            label="Foto do Piloto"
            accept="image/*"
            value={documents.photo}
            onChange={(file) => handleChange("photo", file)}
            error={documentErrors.photo}
          />

          <FileUpload
            label="Documento Oficial com Foto (RG/CIN)"
            accept="image/*,.pdf"
            value={documents.identity}
            onChange={(file) => handleChange("identity", file)}
            error={documentErrors.identity}
          />

          <FileUpload
            label="Termo de Responsabilidade"
            accept=".pdf"
            value={documents.terms}
            onChange={(file) => handleChange("terms", file)}
            error={documentErrors.terms}
          />

          {!isMinor && (
            <FileUpload
              label="CNH"
              accept="image/*,.pdf"
              value={documents.cnh}
              onChange={(file) => handleChange("cnh", file)}
              error={documentErrors.cnh}
            />
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <CardTitle title="Documentos Adicionais" />
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[6px] p-4 mt-4">
          <p className="text-xs text-zinc-500">
            Os documentos adicionais como autorização de menor, laudo médico, licença federativa,
            comprovante de residência e comprovante de pagamento serão solicitados conforme necessário
            pela organização do evento.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4">
        <p className="text-xs text-zinc-400 mb-2">Formatos aceitos:</p>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>• PDF, JPG, JPEG, PNG</li>
          <li>• Tamanho máximo: 15MB por arquivo</li>
          <li>• Documentos devem estar legíveis</li>
        </ul>
      </div>
    </div>
  );
}

export function Step5Medical({ control, register, errors, hasAllergies, hasMedication, hasCondition }: Step5Props) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle title="Informações Médicas" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Controller
            control={control}
            name="medicalBloodType"
            render={({ field }) => (
              <Select
                label="Tipo Sanguíneo"
                options={BLOOD_TYPE_OPTIONS}
                placeholder="Selecione (opcional)"
                {...field}
              />
            )}
          />
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <CardTitle title="Condições Especiais" />
        <div className="space-y-4 mt-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4">
            <Controller
              control={control}
              name="hasAllergies"
              render={({ field }) => (
                <Checkbox
                  label="Possui alergias?"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {hasAllergies && (
              <div className="mt-3">
                <Input
                  label="Descreva as alergias"
                  placeholder="Liste suas alergias e reações"
                  required
                  error={errors.allergiesDescription?.message}
                  {...register("allergiesDescription")}
                />
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4">
            <Controller
              control={control}
              name="hasMedication"
              render={({ field }) => (
                <Checkbox
                  label="Faz uso de medicamento contínuo?"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {hasMedication && (
              <div className="mt-3">
                <Input
                  label="Descreva os medicamentos"
                  placeholder="Nome dos medicamentos e dosagem"
                  required
                  error={errors.medicationDescription?.message}
                  {...register("medicationDescription")}
                />
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4">
            <Controller
              control={control}
              name="hasCondition"
              render={({ field }) => (
                <Checkbox
                  label="Possui restrição ou condição médica?"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {hasCondition && (
              <div className="mt-3">
                <Input
                  label="Descreva a condição"
                  placeholder="Descreva sua condição médica"
                  required
                  error={errors.conditionDescription?.message}
                  {...register("conditionDescription")}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-green-950/20 border border-green-900 rounded-[6px] p-4 mt-6">
        <p className="text-xs text-green-400 flex items-start gap-2">
          <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Estas informações são confidenciais e ajudam a equipe médica em caso de emergência.
        </p>
      </div>
    </div>
  );
}

export function Step6Extras({ control, register, errors }: Step6Props) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle title="Informações Extras" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Patrocinadores"
            placeholder="Lista de patrocinadores (separados por vírgula)"
            {...register("sponsors")}
          />

          <Input
            label="Instagram"
            placeholder="@seuinstagram"
            icon={<Camera className="w-4 h-4" />}
            {...register("instagram")}
          />

          <Input
            label="Facebook"
            placeholder="facebook.com/seuperfil"
            icon={<Globe className="w-4 h-4" />}
            {...register("facebook")}
          />

          <Input
            label="TikTok"
            placeholder="@seutiktok"
            icon={<Video className="w-4 h-4" />}
            {...register("tiktok")}
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4 mt-6">
        <p className="text-xs text-zinc-400 mb-2">Redes Sociais:</p>
        <p className="text-xs text-zinc-500">
          Suas redes sociais podem ser utilizadas para divulgação de resultados e matérias no Portal MX.
        </p>
      </div>
    </div>
  );
}

export function Step7Accepts({ control, register, canSubmit }: Step7Props) {
  return (
    <div className="space-y-6">
      <div>
        <CardTitle title="Termos e Aceites" />
        <p className="text-sm text-zinc-400 mt-2">
          Para finalizar sua inscrição, é necessário aceitar todos os termos abaixo:
        </p>

        <div className="space-y-4 mt-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4">
            <Controller
              control={control}
              name="acceptsRegulations"
              render={({ field }) => (
                <Checkbox
                  label="Li e aceito o Regulamento Oficial do evento."
                  checked={field.value}
                  onChange={field.onChange}
                  required
                />
              )}
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4">
            <Controller
              control={control}
              name="acceptsPrivacy"
              render={({ field }) => (
                <Checkbox
                  label="Li e concordo com a Política de Privacidade (LGPD)."
                  checked={field.value}
                  onChange={field.onChange}
                  required
                />
              )}
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[6px] p-4">
            <Controller
              control={control}
              name="acceptsTruthfulness"
              render={({ field }) => (
                <Checkbox
                  label="Confirmo que todos os documentos enviados são verdadeiros e autênticos."
                  checked={field.value}
                  onChange={field.onChange}
                  required
                />
              )}
            />
          </div>
        </div>
      </div>

      {!canSubmit && (
        <div className="bg-amber-950/20 border border-amber-900 rounded-[6px] p-4 mt-6">
          <p className="text-xs text-amber-400 flex items-start gap-2">
            <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Marque todas as opções acima para habilitar o botão de finalizar inscrição.
          </p>
        </div>
      )}

      {canSubmit && (
        <div className="bg-green-950/20 border border-green-900 rounded-[6px] p-4 mt-6">
          <p className="text-xs text-green-400 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Todos os termos aceitos. Você pode finalizar sua inscrição.
          </p>
        </div>
      )}
    </div>
  );
}