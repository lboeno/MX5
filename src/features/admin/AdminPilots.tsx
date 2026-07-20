import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, MoreHorizontal, Users,
  Edit2, Ban, Download, Trash2, X, Loader2, FileText,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { fetchPilots, updatePilot, deletePilot, createPilot } from "../../lib/pilots";
import { supabase } from "../../lib/supabase";
import { DocumentViewerModal } from "../../components/documents/DocumentViewerModal";
import type { Category, Pilot } from "../../types";

const CATEGORIES: Category[] = ["MX1", "MX2", "MXF", "MX_VET", "MX_JR", "MX_MINI"];

export function AdminPilots() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editPilot, setEditPilot] = useState<Pilot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Document viewer
  const [docViewerRegId, setDocViewerRegId] = useState<string | null>(null);
  const [docViewerLoading, setDocViewerLoading] = useState(false);

  const openDocumentViewer = async (pilotId: string) => {
    setDocViewerLoading(true);
    const { data } = await supabase
      .from("pilot_registrations")
      .select("id")
      .eq("pilot_id", pilotId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setDocViewerRegId(data?.id ?? null);
    setDocViewerLoading(false);
  };

  // Form fields
  const [formName, setFormName] = useState("");
  const [formNickname, setFormNickname] = useState("");
  const [formNumber, setFormNumber] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTeam, setFormTeam] = useState("");
  const [formNationality, setFormNationality] = useState("Brasil");
  const [formStatus, setFormStatus] = useState("active");
  const [formMotoBrand, setFormMotoBrand] = useState("");
  const [formMotoModel, setFormMotoModel] = useState("");
  const [formMotoYear, setFormMotoYear] = useState("");
  const [formMotoCC, setFormMotoCC] = useState("");
  const [formMotoColor, setFormMotoColor] = useState("");
  const [formPoints, setFormPoints] = useState("0");
  const [formWins, setFormWins] = useState("0");
  const [formPodiums, setFormPodiums] = useState("0");
  const [formRanking, setFormRanking] = useState("0");
  const [formSaving, setFormSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPilots = () => {
    setLoading(true);
    fetchPilots().then(setPilots).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadPilots(); }, []);

  const filtered = pilots.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.number.includes(search) ||
      (p.team ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditPilot(null);
    setFormName("");
    setFormNickname("");
    setFormNumber("");
    setFormCategory("");
    setFormTeam("");
    setFormNationality("Brasil");
    setFormStatus("active");
    setFormMotoBrand("");
    setFormMotoModel("");
    setFormMotoYear("");
    setFormMotoCC("");
    setFormMotoColor("");
    setFormPoints("0");
    setFormWins("0");
    setFormPodiums("0");
    setFormRanking("0");
    setShowModal(true);
  };

  const openEdit = (pilot: Pilot) => {
    setEditPilot(pilot);
    setFormName(pilot.name);
    setFormNickname(pilot.nickname ?? "");
    setFormNumber(pilot.number);
    setFormCategory(pilot.category);
    setFormTeam(pilot.team ?? "");
    setFormNationality(pilot.nationality);
    setFormStatus(pilot.status);
    setFormMotoBrand(pilot.motorcycle.brand);
    setFormMotoModel(pilot.motorcycle.model);
    setFormMotoYear(String(pilot.motorcycle.year));
    setFormMotoCC(String(pilot.motorcycle.engineCC));
    setFormMotoColor(pilot.motorcycle.color);
    setFormPoints(String(pilot.points));
    setFormWins(String(pilot.wins));
    setFormPodiums(String(pilot.podiums));
    setFormRanking(String(pilot.ranking));
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormSaving(true);
    try {
      const data = {
        name: formName,
        nickname: formNickname || undefined,
        number: formNumber,
        category: formCategory as Category,
        team: formTeam || undefined,
        nationality: formNationality,
        status: formStatus as Pilot["status"],
        motorcycle: {
          brand: formMotoBrand,
          model: formMotoModel,
          year: Number(formMotoYear) || new Date().getFullYear(),
          engineCC: Number(formMotoCC) || 0,
          color: formMotoColor,
          chassis: "",
        },
        points: Number(formPoints) || 0,
        wins: Number(formWins) || 0,
        podiums: Number(formPodiums) || 0,
        ranking: Number(formRanking) || 0,
      };

      if (editPilot) {
        await updatePilot(editPilot.id, data);
      }
      // For create, openCreate is the public page - admin can create but needs profile_id
      // For now, creation is done via registration flow; admin edits existing only
      setShowModal(false);
      loadPilots();
    } catch (err) {
      console.error("Erro ao salvar piloto:", err);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deletePilot(deleteId);
      setDeleteId(null);
      loadPilots();
    } catch (err) {
      console.error("Erro ao excluir piloto:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Pilotos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{pilots.length} pilotos cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>Exportar</Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Cadastrar Piloto</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, número ou equipe..."
            className="w-full h-9 pl-9 pr-3 bg-card border border-border rounded-[5px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-800 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(["all", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat as Category | "all")}
                  className={`flex-shrink-0 px-3 h-9 text-xs rounded-[5px] border transition-colors ${
                categoryFilter === cat
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "text-muted-foreground border-border hover:border-zinc-600 hover:text-foreground"
              }`}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
               <tr className="border-b border-border">
                 <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">#</th>
                 <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Piloto</th>
                 <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                 <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">Equipe</th>
                 <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">Moto</th>
                 <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden sm:table-cell">Pts</th>
                 <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden sm:table-cell">V/P</th>
                 <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden sm:table-cell">Docs</th>
                 <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="text-center py-16">
                      <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Nenhum piloto encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((pilot, i) => (
                  <motion.tr
                    key={pilot.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/60 last:border-0 hover:bg-card/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-base text-rose-400">{pilot.number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={pilot.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(pilot.name) + "&background=292524&color=fafafa&size=32"}
                          alt={pilot.name}
                          className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{pilot.name}</p>
                          {pilot.nickname && <p className="text-[11px] text-muted-foreground/70 truncate">"{pilot.nickname}"</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="outline">{pilot.category}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{pilot.team ?? "Independente"}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground">{pilot.motorcycle.brand} {pilot.motorcycle.model}</p>
                      <p className="text-[10px] text-muted-foreground/70 font-mono">{pilot.motorcycle.year}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-right">
                      <p className="font-mono font-bold text-sm text-foreground">{pilot.points}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-right">
                      <p className="font-mono text-xs text-muted-foreground">{pilot.wins}V / {pilot.podiums}P</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <button
                        onClick={() => openDocumentViewer(pilot.id)}
                        disabled={docViewerLoading}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {docViewerLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        Ver
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={pilot.status === "active" ? "success" : pilot.status === "suspended" ? "danger" : "default"}>
                        {pilot.status === "active" ? "Ativo" : pilot.status === "suspended" ? "Suspenso" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === pilot.id ? null : pilot.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === pilot.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                             <div className="absolute right-0 top-8 w-44 bg-card border border-border rounded-[6px] shadow-xl z-20 py-1">
                               <button onClick={() => { setOpenMenuId(null); openEdit(pilot); }}
                                 className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <Edit2 className="w-3.5 h-3.5" />
                                Editar
                              </button>
                              <button onClick={() => { setOpenMenuId(null); setDeleteId(pilot.id); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display font-bold text-lg text-foreground">{editPilot ? "Editar Piloto" : "Cadastrar Piloto"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Nome Completo" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <Input label="Apelido" value={formNickname} onChange={(e) => setFormNickname(e.target.value)} placeholder="Opcional" />
                <Input label="Número da Moto" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} />
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Categoria</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 px-3 bg-input border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800 transition-colors">
                    <option value="">Selecione</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Input label="Equipe" value={formTeam} onChange={(e) => setFormTeam(e.target.value)} placeholder="Opcional" />
                <Input label="Nacionalidade" value={formNationality} onChange={(e) => setFormNationality(e.target.value)} />
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full h-9 px-3 bg-input border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800 transition-colors">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-5">
                <h3 className="font-display font-semibold text-sm text-foreground mb-4">Motocicleta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Marca" value={formMotoBrand} onChange={(e) => setFormMotoBrand(e.target.value)} placeholder="Ex: KTM" />
                  <Input label="Modelo" value={formMotoModel} onChange={(e) => setFormMotoModel(e.target.value)} placeholder="Ex: SX-F 450" />
                  <Input label="Ano" value={formMotoYear} onChange={(e) => setFormMotoYear(e.target.value)} placeholder="Ex: 2025" />
                  <Input label="Motor (CC)" value={formMotoCC} onChange={(e) => setFormMotoCC(e.target.value)} placeholder="Ex: 450" />
                  <Input label="Cor" value={formMotoColor} onChange={(e) => setFormMotoColor(e.target.value)} placeholder="Ex: Laranja" />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-5">
                <h3 className="font-display font-semibold text-sm text-foreground mb-4">Estatísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input label="Pontos" value={formPoints} onChange={(e) => setFormPoints(e.target.value)} type="number" />
                  <Input label="Vitórias" value={formWins} onChange={(e) => setFormWins(e.target.value)} type="number" />
                  <Input label="Pódios" value={formPodiums} onChange={(e) => setFormPodiums(e.target.value)} type="number" />
                  <Input label="Ranking" value={formRanking} onChange={(e) => setFormRanking(e.target.value)} type="number" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
              <Button variant="ghost" size="md" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" size="md" loading={formSaving} onClick={handleSave}>
                {editPilot ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        registrationId={docViewerRegId}
        open={docViewerRegId !== null}
        onClose={() => setDocViewerRegId(null)}
      />

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
            <div className="relative bg-card border border-border rounded-[10px] w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-900/30 border border-rose-800 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">Excluir Piloto</h2>
            <p className="text-sm text-muted-foreground mb-6">Tem certeza que deseja excluir este piloto? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" size="md" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="primary" size="md" loading={deleteLoading} onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
