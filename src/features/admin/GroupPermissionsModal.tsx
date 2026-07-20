import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { getGroupPermissions, setGroupPermissions } from "../../services/admin/permissions";
import { SCREEN_GROUPS, SCREEN_LABELS, ALL_SCREENS } from "../../types/permissions";

const GROUP_ROLES = [
  { role: "admin", label: "Admin" },
  { role: "organizer", label: "Organizador" },
  { role: "pilot", label: "Piloto" },
  { role: "team", label: "Equipe" },
];

interface GroupPermissionsModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function GroupPermissionsModal({ onClose, onSaved }: GroupPermissionsModalProps) {
  const [groups, setGroups] = useState<Record<string, Record<string, boolean>>>({});
  const [activeRole, setActiveRole] = useState<string>("organizer");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGroupPermissions();
        setGroups(data);
      } catch (err) {
        console.error("Erro ao carregar grupos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const current = groups[activeRole] ?? {};

  const toggle = (screen: string) => {
    setGroups((prev) => ({
      ...prev,
      [activeRole]: {
        ...(prev[activeRole] ?? {}),
        [screen]: !current[screen],
      },
    }));
  };

  const setAll = (value: boolean) => {
    setGroups((prev) => {
      const next = { ...(prev[activeRole] ?? {}) };
      for (const s of ALL_SCREENS) next[s] = value;
      return { ...prev, [activeRole]: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setGroupPermissions(activeRole, current);
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar grupo:", err);
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = ALL_SCREENS.filter((s) => current[s]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-[12px] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-[15px] text-foreground">Acesso por Grupo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permissões padrão aplicadas a todos os usuários de um papel
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 px-5 py-3 border-b border-zinc-800 flex-shrink-0">
          {GROUP_ROLES.map((g) => (
            <button
              key={g.role}
              onClick={() => setActiveRole(g.role)}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors ${
                activeRole === g.role
                  ? "bg-rose-950 text-rose-400 border border-rose-900"
                  : "text-zinc-500 border border-zinc-800 hover:text-zinc-300"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {SCREEN_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.screens.map((screen) => (
                    <div
                      key={screen}
                      className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-card/60 transition-colors cursor-pointer"
                      onClick={() => toggle(screen)}
                    >
                      <span className="text-sm text-foreground/80">{SCREEN_LABELS[screen]}</span>
                      <div className={`w-9 h-5 rounded-full transition-colors duration-150 flex items-center ${
                        current[screen] ? "bg-rose-600 justify-end" : "bg-zinc-700 justify-start"
                      }`}>
                        <div className="w-3.5 h-3.5 bg-white rounded-full mx-1 shadow-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border flex-shrink-0">
          <span className="text-xs text-muted-foreground/70">{enabledCount}/{ALL_SCREENS.length} telas liberadas</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setAll(true)}>Tudo</Button>
              <Button variant="ghost" size="sm" onClick={() => setAll(false)}>Nada</Button>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={saving ? undefined : <Save className="w-3.5 h-3.5" />}
              loading={saving}
              onClick={handleSave}
            >
              Salvar Grupo
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
