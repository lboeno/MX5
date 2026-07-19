import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { MapPin, Eye, EyeOff, LogIn, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, Mail } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { login } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const DASHBOARD_ROUTES: Record<string, string> = {
  admin: "/admin",
  organizer: "/admin",
  pilot: "/piloto",
  team: "/equipe",
};

function redirectUser(role: string, navigate: ReturnType<typeof useNavigate>) {
  const path = DASHBOARD_ROUTES[role] ?? "/login";
  navigate(path);
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const authData = await login(data.email, data.password);
      const role = authData.user?.user_metadata?.role ?? "pilot";
      redirectUser(role, navigate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const email = getValues("email");
    if (!email) {
      setResetError("Informe seu e-mail no campo acima para receber o link.");
      return;
    }
    setResetLoading(true);
    setResetError("");
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });
      if (resetErr) throw resetErr;
      setResetSent(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Não foi possível enviar o e-mail.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(225,29,72,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-rose-600 rounded-[6px] flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)]">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Portal<span className="text-rose-500">MX</span></span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Bem-vindo de volta</h1>
          <p className="text-zinc-500 text-sm">Entre na sua conta para continuar</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] border border-zinc-800 rounded-[10px] p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">E-mail</label>
<input
                {...register("email", { required: "E-mail obrigatório" })}
                type="email"
                placeholder="seu@email.com"
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-[5px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors"
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Senha</label>
              <div className="relative">
<input
                  {...register("password", { required: "Senha obrigatória" })}
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
              {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register("remember")} type="checkbox" className="w-3.5 h-3.5 accent-rose-600" />
                <span className="text-xs text-zinc-500">Lembrar-me</span>
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-rose-500 hover:text-rose-400 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {resetSent && (
              <div className="flex items-start gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-3 py-2 rounded-[4px]">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>E-mail de redefinição enviado. Verifique sua caixa de entrada (e o spam).</span>
              </div>
            )}
            {resetError && (
              <p className="text-[11px] text-rose-500 bg-rose-950/50 border border-rose-900 px-3 py-2 rounded-[4px]">{resetError}</p>
            )}
            {resetLoading && (
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando e-mail...
              </p>
            )}

            {error && (
              <p className="text-[11px] text-rose-500 bg-rose-950/50 border border-rose-900 px-3 py-2 rounded-[4px]">{error}</p>
            )}

            <Button type="submit" variant="primary" size="md" fullWidth loading={loading} icon={<LogIn className="w-4 h-4" />}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-zinc-600">Não tem conta?</p>
            <Link to="/registrar" className="text-xs text-rose-500 hover:text-rose-400">Criar conta gratuita →</Link>
          </div>
        </motion.div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-700">
          <ShieldCheck className="w-3 h-3" />
          <span>Acesso protegido por SSL · Portal MX v2.0</span>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
