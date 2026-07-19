import { Link } from "react-router-dom";
import { MapPin, ExternalLink, Share2, Link2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-rose-600 rounded-[4px] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white">Portal<span className="text-rose-500">MX</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              A plataforma definitiva para gestão de motocross no Brasil.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-[4px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-zinc-600 transition-colors"><Share2 className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-[4px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-zinc-600 transition-colors"><Link2 className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-[4px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-zinc-600 transition-colors"><ExternalLink className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Esporte</h4>
            <ul className="space-y-2">
              {["Eventos", "Calendário", "Rankings", "Resultados", "Pilotos", "Galeria"].map((l) => (
                <li key={l}><Link to={`/${l.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Plataforma</h4>
            <ul className="space-y-2">
              {["Painel Admin", "Organizadores", "Pilotos", "Equipes", "Cronometragem", "Imprensa"].map((l) => (
                <li key={l}><Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Empresa</h4>
            <ul className="space-y-2">
              {["Sobre", "Blog", "Parceiros", "Termos de Uso", "Privacidade", "Contato"].map((l) => (
                <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground/70 font-mono">© 2025 Portal MX. Todos os direitos reservados.</p>
          <p className="text-xs text-zinc-700 font-mono">v2.0.0 · FIM Homologado</p>
        </div>
      </div>
    </footer>
  );
}
