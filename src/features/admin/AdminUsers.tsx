import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Loader2, Settings2, Trash2, ShieldCheck } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { getAllUsersWithPermissions, updateUserRole, deleteUser } from "../../services/admin/permissions";
import { UserPermissionsModal } from "./UserPermissionsModal";
import { GroupPermissionsModal } from "./GroupPermissionsModal";
import type { ProfileWithPermissions } from "../../types/permissions";
import { isAdminRole } from "../../lib/roles";

const ROLE_OPTIONS = [
  { value: "all", label: "Todos os papéis" },
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "organizer", label: "Organizador" },
  { value: "pilot", label: "Piloto" },
  { value: "team", label: "Equipe" },
];

const ROLE_BADGE: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "outline" | "ghost" }> = {
  superadmin: { label: "Super Admin", variant: "danger" },
  admin: { label: "Admin", variant: "danger" },
  organizer: { label: "Organizador", variant: "warning" },
  pilot: { label: "Piloto", variant: "info" },
  team: { label: "Equipe", variant: "success" },
};

const ROLES = ["superadmin", "admin", "organizer", "pilot", "team"] as const;

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<ProfileWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ProfileWithPermissions | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsersWithPermissions();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar usuários");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleOpenPermissions = (user: ProfileWithPermissions) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleChangeRole = async (user: ProfileWithPermissions, role: string) => {
    setBusyId(user.id);
    try {
      await updateUserRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
    } catch (err) {
      console.error("Erro ao alterar papel:", err);
      setError(err instanceof Error ? err.message : "Erro ao alterar papel");
    } finally {
      setBusyId(null);
      setEditingRoleId(null);
    }
  };

  const handleDelete = async (user: ProfileWithPermissions) => {
    if (!confirm(`Excluir ${user.name}? Esta ação remove o usuário e o acesso.`)) return;
    setBusyId(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setError(err instanceof Error ? err.message : "Erro ao excluir usuário");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Usuários & Permissões</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} {users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          onClick={() => setShowGroups(true)}
        >
          Acesso por Grupo
        </Button>
      </div>

      {/* Filters */}
      {error && (
        <div className="rounded-[6px] border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-64">
          <Input
            placeholder="Buscar por nome ou email..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            options={ROLE_OPTIONS}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
               <tr className="border-b border-border/60">
                 <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                   Usuário
                 </th>
                 <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                   Email
                 </th>
                 <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                   Papel
                 </th>
                 <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                   Telas Liberadas
                 </th>
                 <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                   Ações
                 </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filtered.map((user, i) => {
                  const allowedScreens = Object.entries(user.permissions)
                    .filter(([_, v]) => v)
                    .map(([k]) => k.replace("admin.", ""));
                  const roleBadge = ROLE_BADGE[user.role] ?? { label: user.role, variant: "default" as const };

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="group hover:bg-card/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                            {user.photo_url ? (
                              <img src={user.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {editingRoleId === user.id ? (
                          <select
                            autoFocus
                            defaultValue={user.role}
                            disabled={busyId === user.id}
                            onChange={(e) => handleChangeRole(user, e.target.value)}
                            onBlur={() => setEditingRoleId(null)}
                            className="h-8 px-2 bg-input border border-rose-800 rounded-[5px] text-xs text-foreground focus:outline-none"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setEditingRoleId(user.id)}
                            title="Clique para alterar o papel"
                            className="hover:opacity-80 transition-opacity"
                          >
                            <Badge variant={roleBadge.variant} size="sm">
                              {roleBadge.label}
                            </Badge>
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {allowedScreens.length > 0 ? (
                            allowedScreens.slice(0, 4).map((screen) => (
                              <Badge key={screen} variant="outline" size="sm">
                                {screen}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground/70">—</span>
                          )}
                          {allowedScreens.length > 4 && (
                            <Badge variant="ghost" size="sm">+{allowedScreens.length - 4}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {user.overrideCount > 0 && (
                            <Badge variant="warning" size="sm">
                              {user.overrideCount}ovr
                            </Badge>
                          )}
                          {!isAdminRole(user.role) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<ShieldCheck className="w-3.5 h-3.5" />}
                              loading={busyId === user.id}
                              onClick={() => handleChangeRole(user, "admin")}
                              title="Dar acesso de admin"
                            >
                              Admin
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Settings2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenPermissions(user)}
                          >
                            Permissões
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            loading={busyId === user.id}
                            onClick={() => handleDelete(user)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Permissions Modal */}
      {showModal && selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
        />
      )}

      {/* Group Permissions Modal */}
      {showGroups && (
        <GroupPermissionsModal
          onClose={() => setShowGroups(false)}
          onSaved={() => setShowGroups(false)}
        />
      )}
    </div>
  );
}
