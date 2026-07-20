import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Flag, Users, CreditCard, BarChart3,
  FileText, Settings, ShieldCheck, Activity, MapPin,
  Trophy, ChevronRight, ChevronLeft,
  Camera, Newspaper, Calendar,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { isAdminRole } from "../../lib/roles";
import { ProfilePanel } from "./ProfilePanel";

type NavItem = {
  screen: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
  badgeVariant?: "default" | "warning";
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Principal",
    items: [
      { screen: "admin.dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      { screen: "admin.analytics", label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Gestão",
    items: [
      { screen: "admin.eventos", label: "Eventos", href: "/admin/eventos", icon: Flag, badge: "24" },
      { screen: "admin.pilotos", label: "Pilotos", href: "/admin/pilotos", icon: Users, badge: "1847" },
      { screen: "admin.inscricoes", label: "Inscrições", href: "/admin/inscricoes", icon: FileText, badge: "38", badgeVariant: "warning" as const },
      { screen: "admin.pagamentos", label: "Pagamentos", href: "/admin/pagamentos", icon: CreditCard },
      { screen: "admin.rankings", label: "Rankings", href: "/admin/rankings", icon: Trophy },
      { screen: "admin.calendario", label: "Calendário", href: "/admin/calendario", icon: Calendar },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { screen: "admin.noticias", label: "Notícias", href: "/admin/noticias", icon: Newspaper },
      { screen: "admin.galeria", label: "Galeria", href: "/admin/galeria", icon: Camera },
    ],
  },
  {
    label: "Sistema",
    items: [
      { screen: "admin.usuarios", label: "Usuários", href: "/admin/usuarios", icon: ShieldCheck },
      { screen: "admin.logs", label: "Logs", href: "/admin/logs", icon: Activity },
      { screen: "admin.configuracoes", label: "Configurações", href: "/admin/configuracoes", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<Record<string, number | null>>({
    "/admin/eventos": null,
    "/admin/pilotos": null,
    "/admin/inscricoes": null,
  });
  const [allowedScreens, setAllowedScreens] = useState<Set<string> | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    async function loadCounts() {
      const [events, pilots, registrations] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("pilots").select("*", { count: "exact", head: true }),
        supabase.from("pilot_registrations").select("*", { count: "exact", head: true }),
      ]);

      const hasError = events.error || pilots.error || registrations.error;
      if (hasError) {
        console.error("[AdminSidebar] Erro ao carregar contadores:", hasError);
        return;
      }

      setCounts({
        "/admin/eventos": events.count ?? 0,
        "/admin/pilotos": pilots.count ?? 0,
        "/admin/inscricoes": registrations.count ?? 0,
      });
    }

    loadCounts();
  }, []);

  useEffect(() => {
    async function loadPermissions() {
      if (!user || !profile) return;

      if (isAdminRole(profile.role)) {
        setAllowedScreens(new Set(NAV_GROUPS.flatMap((g) => g.items.map((i) => i.screen))));
        return;
      }

      try {
        const { data: rolePerm } = await supabase
          .from("role_permissions")
          .select("screens")
          .eq("role", profile.role)
          .single();

        const defaults = (rolePerm?.screens as Record<string, boolean>) ?? {};

        const { data: userPerm } = await supabase
          .from("user_permissions")
          .select("screens")
          .eq("user_id", user.id)
          .maybeSingle();

        const overrides = (userPerm?.screens as Record<string, boolean>) ?? {};

        const allowed = new Set<string>();
        for (const item of NAV_GROUPS.flatMap((g) => g.items)) {
          const access = item.screen in overrides ? overrides[item.screen] : defaults[item.screen];
          if (access) allowed.add(item.screen);
        }

        setAllowedScreens(allowed);
      } catch (err) {
        console.error("[AdminSidebar] Erro ao carregar permissões:", err);
        setAllowedScreens(new Set());
      }
    }

    loadPermissions();
  }, [user, profile]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const getBadge = (item: NavItem) => {
    if (item.href in counts) {
      const count = counts[item.href];
      return count === null || count === undefined ? undefined : String(count);
    }
    const count = counts[item.href];
    return count === null || count === undefined ? item.badge : String(count);
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-background transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Logo */}
        <div className={`h-14 flex items-center border-b border-border flex-shrink-0 ${collapsed ? "justify-center px-0" : "px-4"}`}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-rose-600 rounded-[4px] flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.35)] flex-shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-[14px] text-white tracking-tight whitespace-nowrap">
              Portal<span className="text-rose-500">MX</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map((group) => {
          const visibleItems = allowedScreens
            ? group.items.filter((item) => allowedScreens.has(item.screen))
            : group.items;

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-2 mb-1">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-[5px] text-sm transition-all duration-100 group relative ${
                          active
                            ? "bg-rose-950/60 text-rose-400 border border-rose-900/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-rose-400" : ""}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {getBadge(item) && (
                              <Badge variant={(item.badgeVariant ?? "default") as "default" | "warning"} size="sm">
                                {getBadge(item)}
                              </Badge>
                            )}
                          </>
                        )}
                        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-rose-500 rounded-r-full" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2 flex-shrink-0">
        <button
          onClick={() => setShowProfile(true)}
          className={`flex items-center gap-2.5 px-2 py-2 rounded-[5px] w-full text-left hover:bg-muted/50 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <img
            src={profile?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "U")}&background=292524&color=fafafa&size=64`}
            alt="Perfil"
            className="w-7 h-7 rounded-full border border-border flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground/80 truncate">{profile?.name || "Portal Admin"}</p>
              <p className="text-[10px] text-muted-foreground/70 truncate font-mono">{profile?.email || "—"}</p>
            </div>
          )}
        </button>
        <button
          onClick={onToggle}
          className="w-full mt-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-[4px] text-xs text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>

      <ProfilePanel open={showProfile} onClose={() => setShowProfile(false)} />
    </aside>
  );
}
