import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../lib/routes";
import { useAuth } from "../context/AuthContext";

export function Forbidden() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <ShieldX className="w-16 h-16 text-rose-600 mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-white mb-2">Acesso Negado</h1>
        <p className="text-zinc-500 text-sm mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}>
          <Button variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            {isAuthenticated ? "Voltar ao início" : "Ir para o login"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
