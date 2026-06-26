import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, Toolbox, Receipt, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '../../utils/auth';

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function ScooterIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      <path d="M5 17H3v-4l4-3h8l2 3h1a2 2 0 0 1 0 4h-1" />
      <path d="M9 17V9h4" />
    </svg>
  );
}

export default function Layout() {
  const location = useLocation();
  const queryClient = useQueryClient();

  const tabs = [
    { path: '/FixNSell/vendadireta', label: 'Venda', Icon: ShoppingCart },
    { path: '/FixNSell/trotinetes-prontas', label: 'Trotinetes Prontas', Icon: ScooterIcon },
    { path: '/FixNSell/pecas-reservadas', label: 'Peças Reservadas', Icon: Toolbox },
    { path: '/FixNSell/rececao-encomendas', label: 'Receção Encomendas', Icon: Package },
    { path: '/FixNSell/faturas', label: 'Faturas', Icon: Receipt },
  ];

  const handleLogout = () => {
    if (window.confirm('Deseja terminar a sessão?')) {
      logout(queryClient);
    }
  };

  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null;
  const nome = payload?.nome ?? 'Operador';

  const today = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-7 flex items-center justify-between h-15 py-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-slate-900">FIXN<span className="text-blue-600">SELL</span></div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Operador · {nome}</div>
          </div>
        </div>

        <nav className="flex gap-0.5">
          {tabs.map(t => {
            const active = isActive(t.path);
            return (
              <Link
                key={t.path}
                to={t.path}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'text-slate-500 border-transparent hover:bg-slate-50'
                }`}
              >
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono font-semibold hidden md:block">{today} · {time}</span>
          <button
            onClick={handleLogout}
            title="Terminar sessão"
            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
