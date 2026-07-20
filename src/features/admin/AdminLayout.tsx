import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { Bell, Search, LogOut, Settings, CheckCheck, Loader2, Calendar, Newspaper, Image as ImageIcon, Users, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotifications, getUnreadCount, markAsRead, markAllAsRead, subscribeNotifications,
} from "../../services/notifications";
import type { AppNotification } from "../../types/notifications";
import { searchAll, type SearchResult } from "../../services/search";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

const RESULT_ICON: Record<SearchResult["type"], typeof Calendar> = {
  evento: Calendar,
  noticia: Newspaper,
  galeria: ImageIcon,
  piloto: Users,
  pagamento: CreditCard,
};

const LEVEL_DOT: Record<AppNotification["level"], string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = query.trim();
    if (!t) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const r = await searchAll(t);
        setResults(r);
        setSearchOpen(true);
      } catch (err) {
        console.error("[AdminLayout] Erro na busca:", err);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [list, count] = await Promise.all([
        fetchNotifications(user.id, 20),
        getUnreadCount(user.id),
      ]);
      setNotifications(list);
      setUnread(count);
    } catch (err) {
      console.error("[AdminLayout] Erro ao carregar notificações:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    load();
    const sub = subscribeNotifications(user.id, (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 20));
      setUnread((c) => c + 1);
    });
    return () => sub.unsubscribe();
  }, [user, load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleOpen() {
    setNotifOpen((v) => !v);
  }

  async function handleItemClick(n: AppNotification) {
    if (!n.read) {
      try {
        await markAsRead(n.id);
        setUnread((c) => Math.max(0, c - 1));
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  }

  async function handleMarkAll() {
    if (!user) return;
    try {
      await markAllAsRead(user.id);
      setUnread(0);
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${collapsed ? "ml-14" : "ml-56"}`}>
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center gap-3 px-4 flex-shrink-0 sticky top-0 z-30">
          <div className="relative flex-1 max-w-xs" ref={searchRef}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const first = results[0];
                  if (first) {
                    setSearchOpen(false);
                    navigate(first.link);
                  }
                }
                if (e.key === "Escape") setSearchOpen(false);
              }}
              placeholder="Busca rápida..."
              className="w-full h-8 pl-8 pr-8 bg-input border border-border rounded-[4px] text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            {searching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70 animate-spin" />
            )}
            {searchOpen && query.trim() && (
              <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto bg-card border border-border rounded-[8px] shadow-2xl z-50 p-1">
                {results.length === 0 && !searching ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum resultado para "{query.trim()}"
                  </p>
                ) : (
                  results.map((r) => {
                    const Icon = RESULT_ICON[r.type];
                    return (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(r.link);
                        }}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-[6px] hover:bg-muted/50 transition-colors"
                      >
                        <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-[4px] bg-muted text-muted-foreground">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{r.label}</p>
                          {r.sublabel && (
                            <p className="text-[10px] text-muted-foreground/80 truncate">{r.sublabel}</p>
                          )}
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 flex-shrink-0">
                          {r.type}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpen}
                className="relative w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-[8px] shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Notificações</span>
                    {unread > 0 && (
                      <button
                        onClick={handleMarkAll}
                        className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Marcar lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-10">Nenhuma notificação.</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleItemClick(n)}
                          className={`w-full text-left px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors flex gap-3 ${
                            n.read ? "opacity-70" : ""
                          }`}
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${LEVEL_DOT[n.level]}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground truncate">{n.title}</p>
                            {n.body && <p className="text-xs text-muted-foreground truncate mt-0.5">{n.body}</p>}
                            <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link to="/admin/configuracoes">
              <button className="w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
            <div className="h-5 w-px bg-border mx-1" />
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format"
                alt="Admin"
                className="w-7 h-7 rounded-full border border-border"
              />
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground/80">Admin</p>
                <p className="text-[10px] text-muted-foreground/70 font-mono">admin@portalmx.com.br</p>
              </div>
            </div>
            <Link to="/">
              <button className="w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-rose-400 hover:bg-rose-950/50 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
