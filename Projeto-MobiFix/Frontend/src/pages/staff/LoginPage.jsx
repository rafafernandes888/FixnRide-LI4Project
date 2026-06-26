import { useState } from "react";
import { User, Lock, Eye, EyeOff, Loader2, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLoginFuncionario } from "../../hooks/useAuth";
import ForgotPassword from "./ForgotPassword";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { mutate, isPending } = useLoginFuncionario();

  function parseJwt(token) {
    try {
      const base64Payload = token.split('.')[1];
      const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(
      { numeroMecanografico: username, password },
      {
        onSuccess: () => {
          const token = localStorage.getItem('token');
          const payload = parseJwt(token);
          const role = payload?.cargo ?? null;
          if (role === 'ADMINISTRADOR') navigate('/FixNManage/dashboard');
          else if (role === 'OPERADOR') navigate('/FixNSell/vendadireta');
          else if (role === 'MECANICO') navigate('/FixNRepair/diagnosticos');
          else navigate('/');
        }
      }
    );
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 font-sans antialiased"
      style={{ background: '#080f1e', color: '#f1f5f9' }}
    >
      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(34,211,238,0.12)' }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(129,140,248,0.12)' }} />

      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8 backdrop-blur-md border"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #22d3ee, #818cf8)',
              boxShadow: '0 0 32px rgba(34,211,238,0.4)',
            }}
          >
            <Wrench className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <header className="mb-7 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 mb-1">
            Fix<span style={{ color: '#22d3ee' }}>N</span>Staff
          </h1>
          <p className="text-xs uppercase tracking-[0.15em] font-bold" style={{ color: '#475569' }}>Staff Portal · MobiFix</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
              Número Mecanográfico
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
              <input
                type="text"
                id="username"
                disabled={isPending}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-xl border py-3 pr-3 pl-11 text-sm font-semibold outline-none transition-all"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: '#f1f5f9',
                }}
                placeholder="Ex: ADM001"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border py-3 pr-11 pl-11 text-sm font-semibold outline-none transition-all"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: '#f1f5f9',
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5"
                style={{ color: '#475569' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs font-bold transition-colors"
              style={{ color: '#22d3ee' }}
            >
              Esqueceu a password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-all"
            style={{
              background: isPending ? 'rgba(34,211,238,0.3)' : 'linear-gradient(135deg, #22d3ee, #818cf8)',
              color: 'white',
              cursor: isPending ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(34,211,238,0.3)',
            }}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> A entrar...</>
            ) : (
              "Entrar no Dashboard"
            )}
          </button>
        </form>

        <footer className="mt-7 text-center">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: '#475569' }}>
            © {new Date().getFullYear()} MobiFix Lda
          </p>
        </footer>

        <ForgotPassword isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
}
