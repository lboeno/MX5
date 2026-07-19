import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, Camera, LogOut, Mail, Phone, User as UserIcon } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../lib/auth";
import { uploadAvatar } from "../../lib/storage";

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  organizer: "Organizador",
  pilot: "Piloto",
  team: "Equipe",
  guest: "Convidado",
};

export function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const { profile, user, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
      setPhoto(profile.photo_url);
      setError(null);
      setSaved(false);
    }
  }, [open, profile]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadAvatar(user.id, file);
      setPhoto(url);
    } catch (err) {
      console.error("Erro ao enviar foto:", err);
      setError("Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(user.id, { name, phone, photo_url: photo });
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-[#0c0c0e] border-l border-zinc-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="font-display font-semibold text-[15px] text-white">Meu Perfil</h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img
                    src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=292524&color=fafafa&size=96`}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover border border-zinc-700"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-2 border-[#0c0c0e] transition-colors"
                    title="Alterar foto"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {profile?.role ? ROLE_LABEL[profile.role] ?? profile.role : "—"}
                </span>
              </div>

              {error && (
                <div className="rounded-[6px] border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
                  {error}
                </div>
              )}
              {saved && (
                <div className="rounded-[6px] border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
                  Perfil atualizado com sucesso.
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Nome completo"
                  icon={<UserIcon className="w-4 h-4" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  label="E-mail"
                  icon={<Mail className="w-4 h-4" />}
                  value={user?.email ?? profile?.email ?? ""}
                  disabled
                  className="opacity-60"
                />

                <Input
                  label="Telefone"
                  icon={<Phone className="w-4 h-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-zinc-800 space-y-3">
              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={saving ? undefined : <Save className="w-4 h-4" />}
                loading={saving}
                onClick={handleSave}
              >
                Salvar Alterações
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                icon={<LogOut className="w-4 h-4" />}
                onClick={signOut}
              >
                Sair
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
