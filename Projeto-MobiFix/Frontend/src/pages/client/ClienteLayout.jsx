import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Wrench, ShoppingCart, FileText, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../../utils/auth";

const NAV_ITEMS = [
  { id: "home",        label: "Início",                path: "/FixNRide/",            Icon: Home },
  { id: "agendar",     label: "Agendar Diagnóstico",   path: "/FixNRide/agendar",     Icon: Calendar },
  { id: "reparacoes",  label: "Minhas Reparações",     path: "/FixNRide/reparacoes",  Icon: Wrench },
  { id: "trotinetes",  label: "Minhas Trotinetes",     path: "/FixNRide/trotinetes",  Icon: ShoppingCart },
  { id: "catalogo",    label: "Catálogo de Peças",     path: "/FixNRide/catalogo",    Icon: ShoppingCart },
  { id: "faturas",     label: "Faturas",               path: "/FixNRide/faturas",     Icon: FileText },
];

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function ClienteLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null;
  const nome = payload?.nome ?? 'Cliente';
  const inicial = nome.charAt(0).toUpperCase();

  const handleLogout = () => {
    if (window.confirm('Deseja terminar a sessão?')) {
      logout(queryClient);
    }
  };

  const isActive = (path) => {
    if (path === "/FixNRide/") return location.pathname === "/FixNRide/" || location.pathname === "/FixNRide";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#1a237e] to-[#1565c0] flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
                <path d="M5 17H3v-4l4-3h8l2 3h1a2 2 0 0 1 0 4h-1" />
                <path d="M9 17V9h4" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-[15px] text-slate-900 tracking-tight">FIXN<span className="text-blue-700">RIDE</span></div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Service Center</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] text-left w-full transition-all ${
                  active
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold'
                    : 'border border-transparent text-slate-500 hover:bg-slate-50 font-medium'
                }`}
              >
                <item.Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-[1.5px] border-blue-200 flex items-center justify-center text-[13px] font-extrabold text-blue-700 shrink-0">
              {inicial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-900 truncate">{nome}</div>
              <div className="text-[11px] text-slate-400">Cliente</div>
            </div>
            <button
              onClick={handleLogout}
              title="Terminar sessão"
              className="text-slate-300 hover:text-red-500 p-1 transition-colors"
            >
              <LogOut className="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
