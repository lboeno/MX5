import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  Trophy, Flag, Phone, FileText,
  ChevronRight, Loader2,
  Shield, Eye,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { fetchPilot } from "../../lib/pilots";
import { supabase } from "../../lib/supabase";
import { DocumentViewerModal } from "../../components/documents/DocumentViewerModal";
import type { Pilot } from "../../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PilotProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);
  const [docRegId, setDocRegId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPilot(id)
      .then(setPilot)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const openDocuments = async () => {
    if (!pilot) return;
    const { data } = await supabase
      .from("pilot_registrations")
      .select("id")
      .eq("pilot_id", pilot.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setDocRegId(data?.id ?? null);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-14 bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="min-h-screen pt-14 bg-[#09090b] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Piloto não encontrado</p>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(pilot.birthDate).getFullYear();

  return (
    <div className="min-h-screen pt-14 bg-[#09090b]">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-[#09090b] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-6">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/pilotos" className="hover:text-zinc-400">Pilotos</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">{pilot.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative flex-shrink-0">
              <img
                src={pilot.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(pilot.name) + "&background=292524&color=fafafa&size=96"}
                alt={pilot.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-rose-600 border-2 border-[#09090b] flex items-center justify-center">
                <span className="font-display font-extrabold text-white text-sm">#{pilot.number}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline">{pilot.category}</Badge>
                <Badge variant={pilot.status === "active" ? "success" : "danger"} dot>
                  {pilot.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">{pilot.name}</h1>
              {pilot.nickname && <p className="text-zinc-500 text-base">"{pilot.nickname}"</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="text-sm text-zinc-400">{pilot.team ?? "Piloto Independente"}</span>
                <span className="text-sm text-zinc-600">·</span>
                <span className="text-sm text-zinc-400">{pilot.nationality} · {age} anos</span>
                <span className="text-sm text-zinc-600">·</span>
                <span className="text-sm text-zinc-400">{pilot.motorcycle.brand} {pilot.motorcycle.model} {pilot.motorcycle.year}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Pts", value: pilot.points, color: "text-rose-400" },
                { label: "Vitórias", value: pilot.wins, color: "text-amber-400" },
                { label: "Pódios", value: pilot.podiums, color: "text-zinc-300" },
                { label: "Ranking", value: `#${pilot.ranking}`, color: "text-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`font-display font-extrabold text-2xl ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {/* Motorcycle */}
            <Card>
              <CardHeader>
                <CardTitle>Motocicleta</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { label: "Marca", value: pilot.motorcycle.brand },
                  { label: "Modelo", value: pilot.motorcycle.model },
                  { label: "Ano", value: String(pilot.motorcycle.year) },
                  { label: "Motor", value: `${pilot.motorcycle.engineCC}cc` },
                  { label: "Cor", value: pilot.motorcycle.color },
                  { label: "Chassi", value: pilot.motorcycle.chassis },
                ].map((field) => (
                  <div key={field.label} className="flex justify-between items-center py-1.5 border-b border-zinc-800/60 last:border-0">
                    <span className="text-xs text-zinc-600">{field.label}</span>
                    <span className="text-xs font-mono text-zinc-300">{field.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* License */}
            <Card>
              <CardHeader>
                <CardTitle>Licença</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {[
                  { label: "Número", value: pilot.licenseNumber || "—" },
                  { label: "Vencimento", value: pilot.licenseExpiry ? format(new Date(pilot.licenseExpiry), "dd/MM/yyyy") : "—" },
                  { label: "Nascimento", value: pilot.birthDate ? format(new Date(pilot.birthDate), "dd/MM/yyyy", { locale: ptBR }) : "—" },
                ].map((field) => (
                  <div key={field.label} className="flex justify-between items-center py-1.5 border-b border-zinc-800/60 last:border-0">
                    <span className="text-xs text-zinc-600">{field.label}</span>
                    <span className="text-xs font-mono text-zinc-300">{field.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contato de Emergência</CardTitle>
              </CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{pilot.emergencyContact.name}</p>
                  <p className="text-xs text-zinc-500">{pilot.emergencyContact.relation}</p>
                  <p className="text-xs font-mono text-zinc-400 mt-1">{pilot.emergencyContact.phone}</p>
                </div>
              </div>
            </Card>

            {/* Sponsors */}
            {pilot.sponsors && pilot.sponsors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Patrocinadores</CardTitle>
                </CardHeader>
                <div className="flex flex-wrap gap-2">
                  {pilot.sponsors.map((s) => (
                    <span key={s} className="px-2.5 py-1 border border-zinc-800 rounded-[3px] text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors">
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Season Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance na Temporada 2025</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Pontos Totais", value: pilot.points, suffix: "pts", color: "text-rose-400" },
                  { label: "Vitórias", value: pilot.wins, suffix: "", color: "text-amber-400" },
                  { label: "Pódios", value: pilot.podiums, suffix: "", color: "text-zinc-300" },
                  { label: "DNF", value: pilot.dnf, suffix: "", color: pilot.dnf > 3 ? "text-rose-500" : "text-zinc-500" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-[6px] bg-zinc-900 border border-zinc-800">
                    <p className={`font-display font-bold text-3xl ${stat.color}`}>
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Points bar */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso no Campeonato</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Posição #{pilot.ranking} — {pilot.category}</span>
                  <span className="font-mono">{pilot.points} / 312 pts (líder)</span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-700 to-rose-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(pilot.points / 312) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-700">0</span>
                  <span className="text-zinc-700">312 pts</span>
                </div>
              </div>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos da Inscrição</CardTitle>
              </CardHeader>
              <div className="flex items-center gap-3 py-4">
                <FileText className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                <p className="text-sm text-zinc-500 flex-1">Visualize os documentos enviados no cadastro</p>
                <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />} onClick={openDocuments}>
                  Ver Documentos
                </Button>
              </div>
            </Card>

            <DocumentViewerModal
              registrationId={docRegId}
              open={docRegId !== null}
              onClose={() => setDocRegId(null)}
              readOnly
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" icon={<FileText className="w-4 h-4" />}>Gerar Resumo</Button>
              <Button variant="outline" size="sm" icon={<Trophy className="w-4 h-4" />}>Histórico Completo</Button>
              <Button variant="outline" size="sm" icon={<Flag className="w-4 h-4" />}>Inscrever em Evento</Button>
              <Button variant="ghost" size="sm" icon={<Shield className="w-4 h-4" />}>Licença</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
