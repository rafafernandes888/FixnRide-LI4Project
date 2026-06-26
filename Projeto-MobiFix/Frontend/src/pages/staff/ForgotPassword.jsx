import { useState } from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';

const ForgotPassword = ({ isOpen, onClose }) => {
  const [mecanografico, setMecanografico] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setMecanografico('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: 'rgba(8,15,30,0.7)' }}
    >
      <div
        className="rounded-3xl w-full max-w-md overflow-hidden border"
        style={{
          background: '#0f172a',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Glow accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #22d3ee, #818cf8)' }} />

        <div className="p-7">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                  style={{ background: 'rgba(34,211,238,0.15)' }}
                >
                  <KeyRound className="w-6 h-6" style={{ color: '#22d3ee' }} />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-100 mb-1">Recuperar Acesso</h2>
                <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                  Introduza o seu <b className="text-slate-200">Número Mecanográfico</b>. Enviaremos as instruções para o seu e-mail profissional MobiFix.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Nº Mecanográfico
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: 104004"
                    value={mecanografico}
                    onChange={(e) => setMecanografico(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm font-semibold outline-none transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: '#f1f5f9',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full font-extrabold py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee, #818cf8)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(34,211,238,0.3)',
                  }}
                >
                  Enviar Instruções
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-3">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                style={{ background: 'rgba(52,211,153,0.15)' }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: '#34d399' }} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-100">Pedido Enviado!</h2>
              <p className="mt-2 text-xs" style={{ color: '#94a3b8' }}>
                Se o número <b className="text-slate-200">{mecanografico}</b> estiver correto, receberá um link de recuperação em breve.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 text-sm font-bold transition-colors"
                style={{ color: '#22d3ee' }}
              >
                Voltar ao Login
              </button>
            </div>
          )}

          {!isSubmitted && (
            <div className="mt-5 text-center">
              <button
                onClick={handleClose}
                className="text-xs font-medium transition-colors"
                style={{ color: '#475569' }}
              >
                Cancelar e voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
