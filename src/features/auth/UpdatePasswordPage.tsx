import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Eye, EyeOff, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";

export function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      setDone(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(225,29,72,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-rose-600 rounded-[6px] flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Portal<span className="text-rose-500">MX</span></span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Redefinir senha</h1>
          <p className="text-zinc-500 text-sm">Crie uma nova senha para sua conta</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] border border-zinc-800 rounded-[10px] p-6"
        >
          {done ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm text-zinc-300">Senha atualizada com sucesso!</p>
              <p className="text-xs text-zinc-600">Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Nova senha</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-9 pl-3 pr-9 bg-zinc-900 border border-zinc-800 rounded-[5px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 bg-rose-950/50 border border-rose-900 px-3 py-2 rounded-[4px]">{error}</p>
              )}

              <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
                {loading ? "Salvando..." : "Atualizar senha"}
              </Button>
            </form>
          )}
        </motion.div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-700">
          <ShieldCheck className="w-3 h-3" />
          <span>Acesso protegido por SSL · Portal MX v2.0</span>
        </div>
      </div>
    </div>
  );
}
