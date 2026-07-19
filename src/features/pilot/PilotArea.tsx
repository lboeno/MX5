import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, ArrowLeft, User, Bike, Award, Tag, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { fetchMyPilot, updatePilot, createPilot } from "../../lib/pilots";
import { supabase } from "../../lib/supabase";
import { logout } from "../../lib/auth";
import type { Pilot } from "../../types";
import { getMyRegistrations } from "../../services/registrations";
import { STEP_LABELS, PAYMENT_LABELS } from "../../domain/registration/stateMachine";
import type { EventRegistration, PaymentStatus } from "../../types/events";

const PAYMENT_DOT: Record<PaymentStatus, string> = {
  pending: "bg-amber-500",
  paid: "bg-emerald-500",
  refunded: "bg-blue-500",
  cancelled: "bg-rose-500",
  na: "bg-zinc-500",
};

const CATEGORIES = ["MX1", "MX2", "MX3", "MXF", "MX_VET", "MX_JR", "MX_MINI", "ENDURO", "TRAIL"];

export function PilotArea() {
  const navigate = useNavigate();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  const [nickname, setNickname] = useState("");
  const [nationality, setNationality] = useState("Brasil");
  const [motoBrand, setMotoBrand] = useState("");
  const [motoModel, setMotoModel] = useState("");
  const [motoYear, setMotoYear] = useState("");
  const [motoCC, setMotoCC] = useState("");
  const [motoColor, setMotoColor] = useState("");
  const [sponsors, setSponsors] = useState("");

  useEffect(() => {
    fetchMyPilot()
      .then((p) => {
        if (p) {
          setPilot(p);
          setNickname(p.nickname ?? "");
          setNationality(p.nationality);
          setMotoBrand(p.motorcycle.brand);
          setMotoModel(p.motorcycle.model);
          setMotoYear(String(p.motorcycle.year));
          setMotoCC(String(p.motorcycle.engineCC));
          setMotoColor(p.motorcycle.color);
          setSponsors(p.sponsors?.join(", ") ?? "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getMyRegistrations()
      .then(setRegistrations)
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!pilot) return;
    setSaving(true);
    setMessage(null);
    try {
      await updatePilot(pilot.id, {
        nickname: nickname || undefined,
        nationality,
        motorcycle: {
          brand: motoBrand,
          model: motoModel,
          year: Number(motoYear) || new Date().getFullYear(),
          engineCC: Number(motoCC) || 0,
          color: motoColor,
          chassis: "",
        },
        sponsors: sponsors ? sponsors.split(",").map((s) => s.trim()) : [],
      });
      setMessage({ type: "success", text: "Dados atualizados com sucesso!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erro ao salvar dados." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center flex-col gap-4 p-4 text-center">
        <p className="text-zinc-500 text-sm">Você ainda não possui um perfil de piloto.</p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/registrar")}>Nova Inscrição</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <button onClick={handleLogout} className="text-xs text-zinc-600 hover:text-rose-400 transition-colors">
            Sair
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
            {pilot.photo ? (
              <img src={pilot.photo} alt={pilot.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">{pilot.name}</h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" size="sm">{pilot.category}</Badge>
              <Badge variant={pilot.status === "active" ? "success" : "danger"} size="sm">
                {pilot.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-[6px] text-sm ${
              message.type === "success"
                ? "bg-green-900/20 border border-green-800 text-green-400"
                : "bg-rose-900/20 border border-rose-800 text-rose-400"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Tag className="w-4 h-4 text-rose-500" />
              <h2 className="font-display font-semibold text-base text-zinc-100">Informações Pessoais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nome" value={pilot.name} disabled />
              <Input label="Número da Moto" value={pilot.number} disabled />
              <Input label="Apelido" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={'Ex: "Foguete"'} />
              <Input label="Nacionalidade" value={nationality} onChange={(e) => setNationality(e.target.value)} />
              <Input label="Equipe" value={pilot.team ?? "—"} disabled />
              <Input label="Categoria" value={pilot.category} disabled />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Bike className="w-4 h-4 text-rose-500" />
              <h2 className="font-display font-semibold text-base text-zinc-100">Motocicleta</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Marca" value={motoBrand} onChange={(e) => setMotoBrand(e.target.value)} placeholder="Ex: KTM" />
              <Input label="Modelo" value={motoModel} onChange={(e) => setMotoModel(e.target.value)} placeholder="Ex: SX-F 450" />
              <Input label="Ano" value={motoYear} onChange={(e) => setMotoYear(e.target.value)} placeholder="Ex: 2025" />
              <Input label="Motor (CC)" value={motoCC} onChange={(e) => setMotoCC(e.target.value)} placeholder="Ex: 450" />
              <Input label="Cor" value={motoColor} onChange={(e) => setMotoColor(e.target.value)} placeholder="Ex: Laranja" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-rose-500" />
              <h2 className="font-display font-semibold text-base text-zinc-100">Patrocinadores</h2>
            </div>
            <Input
              label="Patrocinadores (separados por vírgula)"
              value={sponsors}
              onChange={(e) => setSponsors(e.target.value)}
              placeholder="Ex: Fox, Alpinestars, KTM"
            />
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="primary" size="lg" loading={saving} onClick={handleSave} icon={<Save className="w-4 h-4" />}>
              Salvar Alterações
            </Button>
          </div>
        </div>

        <Card className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-rose-500" />
            <h2 className="font-display font-semibold text-base text-zinc-100">Minhas inscrições</h2>
          </div>
          {registrations.length === 0 ? (
            <p className="text-sm text-zinc-500">Você ainda não se inscreveu em eventos.</p>
          ) : (
            <div className="space-y-3">
              {registrations.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/piloto/inscricao/${r.id}`)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-[6px] bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{r.eventTitle}</p>
                    <p className="text-xs font-mono text-zinc-500">{r.registrationNumber}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">{STEP_LABELS[r.currentStep]}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${PAYMENT_DOT[r.paymentStatus] ?? "bg-zinc-500"}`} />
                      {PAYMENT_LABELS[r.paymentStatus]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-8 p-4 bg-zinc-900/50 rounded-[6px] border border-zinc-800">
          <p className="text-xs text-zinc-600">
            Dados competitivos (pontos, ranking, vitórias) são gerenciados pela administração do evento.
          </p>
        </div>
      </div>
    </div>
  );
}
