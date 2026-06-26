import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  Wrench,
  Box,
  LogOut
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../../utils/auth";

const BG = "#080f1e";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT2 = "#475569";
const TEXT3 = "#94a3b8";

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const navigation = [
    { name: "Dashboard", href: "/FixNManage/dashboard", icon: LayoutDashboard },
    { name: "Encomendas", href: "/FixNManage/encomendas", icon: Package },
    { name: "Promoções", href: "/FixNManage/promocoes", icon: Tag },
    { name: "Utilizadores", href: "/FixNManage/users", icon: Users },
    { name: "Catálogo Peças", href: "/FixNManage/pecas", icon: Box },
    { name: "Intervenções", href: "/FixNManage/intervencoes", icon: Wrench },
  ];

  const isActive = (href) => location.pathname.startsWith(href);

  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null;
  const nome = payload?.nome ?? 'Admin';
  const inicial = nome.charAt(0).toUpperCase();

  const handleLogout = () => {
    if (window.confirm("Deseja terminar a sessão?")) {
      logout(queryClient);
    }
  };

  return (
    <div
      className="min-h-screen flex font-sans antialiased relative overflow-hidden"
      // Alterado color para text-white e adicionado colorScheme: dark
      style={{ background: BG, color: '#f8fafc', colorScheme: 'dark' }}
    >
      <style>
        {`
          /* Para Chrome, Edge, Safari */
          .admin-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .admin-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .admin-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border: 2px solid #080f1e;
          }
          .admin-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 211, 238, 0.5);
          }

          /* Para Firefox */
          .admin-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
            color-scheme: dark; /* Força o Firefox a não usar a barra branca padrão */
          }
        `}
      </style>

      {/* Dot-grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col relative z-10"
        style={{
          borderRight: `1px solid ${BORDER}`,
          background: 'rgba(8,15,30,0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #22d3ee, #818cf8)',
                boxShadow: '0 0 16px rgba(34,211,238,0.3)'
              }}
            >
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-extrabold text-[15px] tracking-tight text-slate-100">
                FixN<span style={{ color: '#22d3ee' }}>Manage</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: TEXT2 }}>
                Admin Portal
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3.5 flex flex-col gap-0.5 overflow-y-auto admin-scrollbar">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] relative transition-all"
                style={{
                  background: active ? 'rgba(34,211,238,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
                  color: active ? '#22d3ee' : TEXT2,
                  fontWeight: active ? 700 : 500,
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r"
                    style={{ background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3.5 py-4 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full border flex items-center justify-center text-[13px] font-extrabold shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(129,140,248,0.2))',
                borderColor: 'rgba(255,255,255,0.1)',
                color: TEXT3,
              }}
            >
              {inicial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-100 truncate">{nome}</div>
              <div className="text-[11px]" style={{ color: TEXT2 }}>Administrador</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md transition-all"
              style={{ color: TEXT2 }}
              title="Terminar sessão"
            >
              <LogOut className="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10 bg-[#080f1e] text-white admin-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}