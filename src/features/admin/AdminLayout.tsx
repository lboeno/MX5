import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { Bell, Search, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${collapsed ? "ml-14" : "ml-56"}`}>
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center gap-3 px-4 flex-shrink-0 sticky top-0 z-30">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70" />
            <input
              placeholder="Busca rápida..."
              className="w-full h-8 pl-8 pr-3 bg-input border border-border rounded-[4px] text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
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
