import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../lib/routes";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AwaitingProfile() {
  const { profileStatus, refreshProfile, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const isError = profileStatus === "error";
  const title = isError ? "Erro ao carregar perfil" : "Perfil não encontrado";
  const description = isError
    ? "Ocorreu um erro ao consultar seu perfil. Tente novamente."
    : "Seu perfil ainda não foi criado. Em alguns casos, pode levar alguns segundos.";

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <span className="text-2xl text-zinc-600">?</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-white mb-2">{title}</h1>
        <p className="text-zinc-500 text-sm mb-6">{description}</p>

        {user?.email && (
          <p className="text-xs text-zinc-600 mb-6 font-mono">{user.email}</p>
        )}

        <button
          onClick={refreshProfile}
          disabled={loading}
          className="text-sm text-rose-500 hover:text-rose-400 disabled:text-zinc-600 transition-colors"
        >
          {loading ? "Verificando..." : "Tentar novamente"}
        </button>
      </div>
    </div>
  );
}
