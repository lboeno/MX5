import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Trophy, Newspaper, MapPin, Users,
  Menu, X, LogIn, UserPlus, LogOut, User,
  Flag, Zap,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../lib/routes";

const NAV_LINKS = [
  { label: "Eventos", href: "/eventos", icon: Flag },
  { label: "Calendário", href: "/calendario", icon: Calendar },
  { label: "Rankings", href: "/rankings", icon: Trophy },
  { label: "Resultados", href: "/resultados", icon: Zap },
  { label: "Pilotos", href: "/pilotos", icon: Users },
  { label: "Notícias", href: "/noticias", icon: Newspaper },
  { label: "Galeria", href: "/galeria", icon: MapPin },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile, signOut } = useAuth();
  const isActive = (href: string) => location.pathname.startsWith(href);

  const profileHref =
    profile?.role === "admin" || profile?.role === "organizer"
      ? ROUTES.ADMIN
      : ROUTES.PILOT;

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-7 h-7 bg-rose-600 rounded-[4px] flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.4)] group-hover:shadow-[0_0_20px_rgba(225,29,72,0.6)] transition-shadow">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-[15px] text-white tracking-tight">
            Portal<span className="text-rose-500">MX</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-sm transition-all duration-150 ${
                isActive(link.href)
                  ? "text-zinc-100 bg-zinc-800"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to={profileHref}>
                <Button variant="outline" size="sm" icon={<User className="w-4 h-4" />}>
                  Perfil
                </Button>
              </Link>
              <Button variant="primary" size="sm" icon={<LogOut className="w-4 h-4" />} onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/registrar">
                <Button variant="outline" size="sm" icon={<UserPlus className="w-4 h-4" />}>
                  Cadastrar
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="primary" size="sm" icon={<LogIn className="w-4 h-4" />}>
                  Entrar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden border-t border-zinc-800 bg-[#09090b] px-4 py-3"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[5px] text-sm transition-colors ${
                      isActive(link.href)
                        ? "text-zinc-100 bg-zinc-800"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-800">
                {isAuthenticated ? (
                  <>
                    <Link to={profileHref} className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" fullWidth icon={<User className="w-4 h-4" />}>Perfil</Button>
                    </Link>
                    <Button variant="primary" size="sm" fullWidth icon={<LogOut className="w-4 h-4" />} onClick={() => { setMobileOpen(false); handleLogout(); }}>Sair</Button>
                  </>
                ) : (
                  <>
                    <Link to="/registrar" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" fullWidth icon={<UserPlus className="w-4 h-4" />}>Cadastrar</Button>
                    </Link>
                    <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="primary" size="sm" fullWidth icon={<LogIn className="w-4 h-4" />}>Entrar</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
