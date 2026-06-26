import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { ClipboardList, Wrench, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { RepairsProvider } from '../../context/RepairsContext';
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

export default function RepairsLayout() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null;
  const nome = payload?.nome ?? 'Mecânico';

  const handleLogout = () => {
    if (window.confirm('Deseja terminar a sessão?')) {
      logout(queryClient);
    }
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <RepairsProvider>
      <div className="flex h-screen flex-col font-sans antialiased">
        <header className="bg-[#0f172a] text-white shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Wrench className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight">FIXN<span className="text-emerald-400">REPAIR</span></h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">Mecânico · {nome}</p>
              </div>
            </div>

            <nav className="flex gap-1.5 bg-white/5 p-1 rounded-xl">
              <Link
                to="/FixNRepair/diagnosticos"
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-all ${
                  isActive('/diagnosticos')
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Diagnósticos
              </Link>
              <Link
                to="/FixNRepair/reparacoes"
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-all ${
                  isActive('/reparacoes')
                    ? 'bg-emerald-700 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="h-4 w-4" />
                Reparações
              </Link>
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </RepairsProvider>
  );
}
