import { useState, useEffect, useRef } from "react";
import {
  Settings, User as UserIcon, Mail, Phone, Camera, Save, Loader2, Plus, Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Checkbox } from "../../components/ui/Checkbox";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../lib/auth";
import { uploadAvatar } from "../../lib/storage";
import {
  fetchSiteSettings, updateSiteSettings, uploadSiteAsset,
} from "../../services/siteSettings";
import type { SiteSettings, SiteSettingsInput, SocialLink } from "../../types/siteSettings";

const THEME_OPTIONS = [
  { value: "dark", label: "Escuro" },
  { value: "light", label: "Claro" },
];

const GATEWAY_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "stripe", label: "Stripe" },
  { value: "pagseguro", label: "PagSeguro" },
];

function settingsToForm(s: SiteSettings): SiteSettingsInput {
  return {
    platformName: s.platformName,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    defaultTheme: s.defaultTheme,
    language: s.language,
    timezone: s.timezone,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    contactWhatsapp: s.contactWhatsapp,
    contactAddress: s.contactAddress,
    siteUrl: s.siteUrl,
    socialLinks: s.socialLinks,
    eventsOpen: s.eventsOpen,
    maxSignups: s.maxSignups,
    allowWaitlist: s.allowWaitlist,
    requireCompleteProfile: s.requireCompleteProfile,
    allowCancellation: s.allowCancellation,
    paymentsEnabled: s.paymentsEnabled,
    pixKey: s.pixKey,
    paymentGateway: s.paymentGateway,
    defaultFee: s.defaultFee,
    paymentDeadlineHours: s.paymentDeadlineHours,
    emailConfirmation: s.emailConfirmation,
    emailApproval: s.emailApproval,
    emailPayment: s.emailPayment,
    emailTemplates: s.emailTemplates,
    allowSignup: s.allowSignup,
    requireEmailConfirm: s.requireEmailConfirm,
    adminMfa: s.adminMfa,
    sessionTimeoutMinutes: s.sessionTimeoutMinutes,
    googleLogin: s.googleLogin,
    turnstile: s.turnstile,
    gaId: s.gaId,
    metaPixel: s.metaPixel,
    maintenanceMode: s.maintenanceMode,
    maintenanceMessage: s.maintenanceMessage,
    infoBanner: s.infoBanner,
    systemVersion: s.systemVersion,
  };
}

export function AdminConfiguracoes() {
  const { profile, user, refreshProfile } = useAuth();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<SiteSettingsInput>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Perfil
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetchSiteSettings()
      .then((s) => {
        if (!active) return;
        setSettings(s);
        setForm(settingsToForm(s));
      })
      .catch((err) => console.error("[AdminConfiguracoes] Erro ao carregar:", err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
      setPhoto(profile.photo_url);
    }
  }, [profile]);

  function set<K extends keyof SiteSettingsInput>(key: K, value: SiteSettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleAssetUpload(kind: "logo" | "favicon", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const url = await uploadSiteAsset(file);
      if (kind === "logo") set("logoUrl", url);
      else set("faviconUrl", url);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao enviar imagem.");
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateSiteSettings(form);
      setSettings(updated);
      setForm(settingsToForm(updated));
      setSaved(true);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProfilePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadAvatar(user.id, file);
      setPhoto(url);
    } catch (err) {
      console.error(err);
      setProfileError("Não foi possível enviar a foto.");
    }
  }

  async function handleSaveProfile() {
    if (!user) return;
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      await updateProfile(user.id, { name, phone, photo_url: photo });
      await refreshProfile();
      setProfileSaved(true);
    } catch (err) {
      console.error(err);
      setProfileError("Não foi possível salvar o perfil.");
    } finally {
      setProfileSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground text-sm">Carregando configurações...</div>
    );
  }

  const socialLinks: SocialLink[] = form.socialLinks ?? [];

  function setSocial(index: number, field: keyof SocialLink, value: string) {
    const next = socialLinks.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    set("socialLinks", next);
  }
  function addSocial() {
    set("socialLinks", [...socialLinks, { label: "", url: "" }]);
  }
  function removeSocial(index: number) {
    set("socialLinks", socialLinks.filter((_, i) => i !== index));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-500" /> Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configurações gerais da plataforma
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          loading={saving}
          onClick={handleSave}
        >
          Salvar alterações
        </Button>
      </div>

      {error && (
        <div className="rounded-[6px] border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-[6px] border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
          Configurações salvas com sucesso.
        </div>
      )}

      {/* Meu Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Dados do administrador logado</CardDescription>
        </CardHeader>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=292524&color=fafafa&size=96`}
                alt=""
                className="w-24 h-24 rounded-full object-cover border border-border"
              />
              <button
                onClick={() => profileFileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-2 border-background"
                title="Alterar foto"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={profileFileRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground/80 border border-border">
              {profile?.role === "admin" ? "Administrador" : profile?.role ?? "—"}
            </span>
          </div>
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
            <Input label="Nome completo" icon={<UserIcon className="w-4 h-4" />} value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="E-mail" icon={<Mail className="w-4 h-4" />} value={user?.email ?? profile?.email ?? ""} disabled className="opacity-60" />
            <Input label="Telefone" icon={<Phone className="w-4 h-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            <div className="flex items-end">
              <Button variant="outline" size="md" onClick={handleSaveProfile} loading={profileSaving}>
                {profileSaved ? "Salvo!" : "Salvar perfil"}
              </Button>
            </div>
          </div>
        </div>
        {profileError && <p className="text-[11px] text-red-500 mt-2">{profileError}</p>}
      </Card>

      {/* Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
          <CardDescription>Identidade e aparência da plataforma</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Nome da plataforma" value={form.platformName ?? ""} onChange={(e) => set("platformName", e.target.value)} />
          <Select label="Tema padrão" options={THEME_OPTIONS} value={form.defaultTheme ?? "dark"} onChange={(e) => set("defaultTheme", e.target.value as "light" | "dark")} />
          <Select label="Idioma" options={[{ value: "pt-BR", label: "Português (BR)" }, { value: "en", label: "English" }, { value: "es", label: "Español" }]} value={form.language ?? "pt-BR"} onChange={(e) => set("language", e.target.value)} />
          <Input label="Fuso horário" value={form.timezone ?? ""} onChange={(e) => set("timezone", e.target.value)} placeholder="America/Sao_Paulo" />
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Logo</label>
            <div className="flex items-center gap-3">
              {form.logoUrl ? <img src={form.logoUrl} alt="Logo" className="h-10 w-auto object-contain border border-border rounded bg-background" /> : <div className="h-10 w-20 border border-dashed border-border rounded flex items-center justify-center text-muted-foreground"><ImageIcon className="w-4 h-4" /></div>}
              <input type="file" accept="image/*" onChange={(e) => handleAssetUpload("logo", e)} className="hidden" id="logo-input" />
              <label htmlFor="logo-input" className="cursor-pointer text-xs px-3 h-9 inline-flex items-center rounded-[6px] border border-border text-muted-foreground hover:text-foreground hover:border-zinc-600">
                {uploading === "logo" ? "Enviando..." : "Enviar logo"}
              </label>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Favicon</label>
            <div className="flex items-center gap-3">
              {form.faviconUrl ? <img src={form.faviconUrl} alt="Favicon" className="h-10 w-10 object-contain border border-border rounded bg-background" /> : <div className="h-10 w-10 border border-dashed border-border rounded flex items-center justify-center text-muted-foreground"><ImageIcon className="w-4 h-4" /></div>}
              <input type="file" accept="image/*,image/x-icon" onChange={(e) => handleAssetUpload("favicon", e)} className="hidden" id="favicon-input" />
              <label htmlFor="favicon-input" className="cursor-pointer text-xs px-3 h-9 inline-flex items-center rounded-[6px] border border-border text-muted-foreground hover:text-foreground hover:border-zinc-600">
                {uploading === "favicon" ? "Enviando..." : "Enviar favicon"}
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
          <CardDescription>Canais de atendimento e redes sociais</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="E-mail de contato" value={form.contactEmail ?? ""} onChange={(e) => set("contactEmail", e.target.value)} />
          <Input label="Telefone" value={form.contactPhone ?? ""} onChange={(e) => set("contactPhone", e.target.value)} />
          <Input label="WhatsApp" value={form.contactWhatsapp ?? ""} onChange={(e) => set("contactWhatsapp", e.target.value)} placeholder="5511999999999" />
          <Input label="Site" value={form.siteUrl ?? ""} onChange={(e) => set("siteUrl", e.target.value)} placeholder="https://" />
          <div className="sm:col-span-2">
            <Input label="Endereço" value={form.contactAddress ?? ""} onChange={(e) => set("contactAddress", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Redes sociais</span>
            <button onClick={addSocial} className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
          </div>
          <div className="space-y-2">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={link.label} onChange={(e) => setSocial(i, "label", e.target.value)} placeholder="Nome (ex: Instagram)" className="flex-1 h-9 px-3 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
                <input value={link.url} onChange={(e) => setSocial(i, "url", e.target.value)} placeholder="https://..." className="flex-1 h-9 px-3 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
                <button onClick={() => removeSocial(i)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {socialLinks.length === 0 && <p className="text-xs text-muted-foreground/60">Nenhuma rede social cadastrada.</p>}
          </div>
        </div>
      </Card>

      {/* Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>Regras de inscrição e participação</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <Checkbox label="Inscrições abertas" checked={!!form.eventsOpen} onChange={(e) => set("eventsOpen", e.target.checked)} />
            <Checkbox label="Permitir lista de espera" checked={!!form.allowWaitlist} onChange={(e) => set("allowWaitlist", e.target.checked)} />
            <Checkbox label="Exigir perfil completo para inscrição" checked={!!form.requireCompleteProfile} onChange={(e) => set("requireCompleteProfile", e.target.checked)} />
            <Checkbox label="Permitir cancelamento de inscrição" checked={!!form.allowCancellation} onChange={(e) => set("allowCancellation", e.target.checked)} />
          </div>
          <Input label="Máximo de inscritos por evento (padrão)" type="number" min={0} value={form.maxSignups ?? 100} onChange={(e) => set("maxSignups", Number(e.target.value))} />
        </div>
      </Card>

      {/* Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>Configuração de cobrança de inscrições</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <Checkbox label="Ativar pagamentos" checked={!!form.paymentsEnabled} onChange={(e) => set("paymentsEnabled", e.target.checked)} />
            <Select label="Gateway" options={GATEWAY_OPTIONS} value={form.paymentGateway ?? ""} onChange={(e) => set("paymentGateway", e.target.value)} />
          </div>
          <div className="space-y-4">
            <Input label="Chave PIX" value={form.pixKey ?? ""} onChange={(e) => set("pixKey", e.target.value)} placeholder="e-mail, CPF ou chave aleatória" />
            <Input label="Valor padrão de inscrição (R$)" type="number" min={0} step="0.01" value={form.defaultFee ?? 0} onChange={(e) => set("defaultFee", Number(e.target.value))} />
            <Input label="Prazo de pagamento (horas)" type="number" min={0} value={form.paymentDeadlineHours ?? 48} onChange={(e) => set("paymentDeadlineHours", Number(e.target.value))} />
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>E-mails automáticos enviados pelo sistema</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-3 gap-4">
          <Checkbox label="E-mail de confirmação" checked={!!form.emailConfirmation} onChange={(e) => set("emailConfirmation", e.target.checked)} />
          <Checkbox label="E-mail de aprovação" checked={!!form.emailApproval} onChange={(e) => set("emailApproval", e.target.checked)} />
          <Checkbox label="E-mail de pagamento" checked={!!form.emailPayment} onChange={(e) => set("emailPayment", e.target.checked)} />
        </div>
        <div className="mt-4">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Template de e-mail de confirmação</label>
          <textarea value={form.emailTemplates?.["confirmation"] ?? ""} onChange={(e) => set("emailTemplates", { ...(form.emailTemplates ?? {}), confirmation: e.target.value })} rows={3} placeholder="Olá {nome}, sua inscrição foi confirmada..." className="w-full px-3 py-2 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
        </div>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Acesso e sessão</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <Checkbox label="Permitir cadastro de novos usuários" checked={!!form.allowSignup} onChange={(e) => set("allowSignup", e.target.checked)} />
            <Checkbox label="Exigir confirmação de e-mail" checked={!!form.requireEmailConfirm} onChange={(e) => set("requireEmailConfirm", e.target.checked)} />
            <Checkbox label="MFA para administradores" checked={!!form.adminMfa} onChange={(e) => set("adminMfa", e.target.checked)} />
          </div>
          <Input label="Tempo de sessão (minutos)" type="number" min={1} value={form.sessionTimeoutMinutes ?? 60} onChange={(e) => set("sessionTimeoutMinutes", Number(e.target.value))} />
        </div>
      </Card>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Serviços externos</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <Checkbox label="Google Login" checked={!!form.googleLogin} onChange={(e) => set("googleLogin", e.target.checked)} />
            <Checkbox label="Cloudflare Turnstile" checked={!!form.turnstile} onChange={(e) => set("turnstile", e.target.checked)} />
          </div>
          <div className="space-y-4">
            <Input label="Google Analytics ID" value={form.gaId ?? ""} onChange={(e) => set("gaId", e.target.value)} placeholder="G-XXXXXXXXXX" />
            <Input label="Meta Pixel ID" value={form.metaPixel ?? ""} onChange={(e) => set("metaPixel", e.target.value)} placeholder="1234567890" />
          </div>
        </div>
      </Card>

      {/* Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle>Manutenção</CardTitle>
          <CardDescription>Modo manutenção e avisos</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4 items-start">
          <Checkbox label="Modo manutenção (bloqueia o site)" checked={!!form.maintenanceMode} onChange={(e) => set("maintenanceMode", e.target.checked)} />
          <div />
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Mensagem de manutenção</label>
            <textarea value={form.maintenanceMessage ?? ""} onChange={(e) => set("maintenanceMessage", e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Banner informativo</label>
            <textarea value={form.infoBanner ?? ""} onChange={(e) => set("infoBanner", e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" placeholder="Aviso exibido no topo do site" />
          </div>
        </div>
      </Card>

      {/* Sobre */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
          <CardDescription>Informações do sistema</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Versão do sistema" value={form.systemVersion ?? ""} onChange={(e) => set("systemVersion", e.target.value)} />
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Última atualização</label>
            <p className="text-sm text-foreground/80 py-2">
              {settings?.lastUpdated ? new Date(settings.lastUpdated).toLocaleString("pt-BR") : "—"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
