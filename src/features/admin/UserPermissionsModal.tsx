import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, RotateCcw, Save, Loader2, Check, Minus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { getUserPermissions, setUserPermission, resetUserPermissions } from "../../services/admin/permissions";
import type { ProfileWithPermissions } from "../../types/permissions";
import { SCREEN_GROUPS, SCREEN_LABELS, ALL_SCREENS, getDefaultScreens } from "../../types/permissions";

interface UserPermissionsModalProps {
  user: ProfileWithPermissions;
  onClose: () => void;
  onSaved: () => void;
}

export function UserPermissionsModal({ user, onClose, onSaved }: UserPermissionsModalProps) {
  const [screens, setScreens] = useState<Record<string, boolean>>({});
  const [defaults, setDefaults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserPermissions(user.id);
        const allDefaults = getDefaultScreens(data.role);
        const merged = { ...allDefaults, ...data.overrides };
        setDefaults(data.role === "admin" ? allDefaults : data.defaults);
        setScreens(merged);
      } catch (err) {
        console.error("Erro ao carregar permissões:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  const toggle = (screen: string) => {
    setScreens((prev) => ({
      ...prev,
      [screen]: !prev[screen],
    }));
  };

  const setAll = (value: boolean) => {
    setScreens((prev) => {
      const next = { ...prev };
      for (const screen of ALL_SCREENS) {
        next[screen] = value;
      }
      return next;
    });
  };

  const setDefault = () => {
    setScreens({ ...defaults });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const overrides: Record<string, boolean> = {};
      for (const screen of ALL_SCREENS) {
        if (screens[screen] !== defaults[screen]) {
          overrides[screen] = screens[screen];
        }
      }
      await setUserPermission(user.id, overrides);
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar permissões:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetUserPermissions(user.id);
      setScreens({ ...defaults });
    } catch (err) {
      console.error("Erro ao resetar permissões:", err);
    } finally {
      setResetting(false);
    }
  };

  const hasChanges = ALL_SCREENS.some((s) => screens[s] !== (defaults[s] ?? false));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] border border-zinc-800 rounded-[12px] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-[15px] text-white">Permissões</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {user.name} · <span className="text-zinc-400 capitalize">{user.role}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {SCREEN_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.screens.map((screen) => {
                    const isDefault = screens[screen] === defaults[screen];
                    const hasOverride = !isDefault;

                    return (
                      <div
                        key={screen}
                        className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                        onClick={() => toggle(screen)}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm text-zinc-300">{SCREEN_LABELS[screen]}</span>
                          {hasOverride && (
                            <span className="text-[10px] font-mono text-amber-500 border border-amber-800/50 px-1.5 rounded-[3px] bg-amber-950/30">
                              override
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600">
                            role: {defaults[screen] ? <Check className="w-3 h-3 inline text-emerald-500" /> : <Minus className="w-3 h-3 inline text-zinc-600" />}
                          </span>
                          <div className={`w-9 h-5 rounded-full transition-colors duration-150 flex items-center ${
                            screens[screen] ? "bg-rose-600 justify-end" : "bg-zinc-700 justify-start"
                          } ${hasOverride ? "ring-1 ring-amber-600/50" : ""}`}>
                            <div className="w-3.5 h-3.5 bg-white rounded-full mx-1 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            loading={resetting}
            onClick={handleReset}
          >
            Restaurar Padrão
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setAll(true)}>
                Tudo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAll(false)}>
                Nada
              </Button>
              <Button variant="ghost" size="sm" onClick={setDefault}>
                Padrão
              </Button>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={saving ? undefined : <Save className="w-3.5 h-3.5" />}
              loading={saving}
              disabled={!hasChanges}
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
