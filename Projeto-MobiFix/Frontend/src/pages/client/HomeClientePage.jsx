import { Calendar, ShoppingCart, Wrench, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import ClienteLayout from "./ClienteLayout";
import { useTrotinetes } from "../../hooks/useTrotinetes";
import { useServicos } from "../../hooks/useServicos";

const STATUS_MAP = {
  AGENDADO:  { label: "Agendado",   color: "#3b82f6", bg: "rgba(59,130,246,0.10)",  step: 1 },
  EXECUCAO:  { label: "Em Oficina", color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  step: 2 },
  CONCLUIDO: { label: "Pronto",     color: "#10b981", bg: "rgba(16,185,129,0.10)",  step: 3 },
};

export default function HomeClientePage() {
  const navigate = useNavigate();
  const { data: trotinetes = [] } = useTrotinetes();
  const { data: servicos = [] } = useServicos();

  function parseJwt(token) {
    try {
      const base64Payload = token.split('.')[1];
      const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null;
  const nome = payload?.nome ?? 'Cliente';
  const primeiroNome = nome.split(' ')[0];

  const reparacoesAtivas = useMemo(() => {
    if (!trotinetes.length || !servicos.length) return [];
    const series = new Set(trotinetes.map(t => t.NumeroSerie));
    return servicos
      .filter(s => series.has(s.TrotineteNumSerie))
      .filter(s => ['AGENDADO', 'EXECUCAO', 'CONCLUIDO'].includes(s.Estado))
      .sort((a, b) => new Date(b.DataAgendamento) - new Date(a.DataAgendamento))
      .slice(0, 3)
      .map(s => ({ ...s, trot: trotinetes.find(t => t.NumeroSerie === s.TrotineteNumSerie) }));
  }, [trotinetes, servicos]);

  const ativasCount = reparacoesAtivas.filter(r => r.Estado !== 'CONCLUIDO').length;
  const prontasCount = reparacoesAtivas.filter(r => r.Estado === 'CONCLUIDO').length;

  const kpis = [
    { label: "Reparações Ativas", value: ativasCount, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", Icon: Wrench },
    { label: "Prontas p/ Levantar", value: prontasCount, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", Icon: CheckCircle2 },
    { label: "Peças Reservadas", value: 0, color: "#8b5cf6", bg: "#faf5ff", border: "#ddd6fe", Icon: ShoppingCart },
  ];

  const quickActions = [
    { label: "Agendar Diagnóstico", desc: "Marcar data e hora para avaliação", color: "#2563eb", bg: "rgba(37,99,235,0.07)", border: "rgba(37,99,235,0.15)", Icon: Calendar, path: "/FixNRide/agendar" },
    { label: "Ver Reparações",       desc: "Acompanhar estado e histórico",   color: "#7c3aed", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.15)", Icon: Wrench, path: "/FixNRide/reparacoes" },
    { label: "Catálogo de Peças",    desc: "Reserve peças para levantar",     color: "#0891b2", bg: "rgba(8,145,178,0.07)",  border: "rgba(8,145,178,0.15)",  Icon: ShoppingCart, path: "/FixNRide/catalogo" },
  ];

  return (
    <ClienteLayout activePage="home">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Bem-vindo, {primeiroNome}</h1>
          <p className="text-sm text-slate-400">Aqui está o resumo das suas trotinetes e serviços ativos.</p>
        </div>
        <button
          onClick={() => navigate('/FixNRide/agendar')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all active:scale-[0.98]"
        >
          <Calendar className="w-4 h-4" />
          Agendar Diagnóstico
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-5 flex items-center gap-4 border"
            style={{ background: k.bg, borderColor: k.border }}
          >
            <div className="w-11 h-11 rounded-xl bg-white border flex items-center justify-center shrink-0 shadow-sm" style={{ borderColor: k.border, color: k.color }}>
              <k.Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.label}</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reparações Ativas */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-slate-900">Reparações Ativas</h2>
          {reparacoesAtivas.length > 0 && (
            <button
              onClick={() => navigate('/FixNRide/reparacoes')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Ver histórico completo →
            </button>
          )}
        </div>

        {reparacoesAtivas.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
            <Wrench className="w-10 h-10 mx-auto text-slate-200 mb-2" />
            <p className="text-slate-400 font-medium text-sm">Sem reparações em curso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reparacoesAtivas.map(r => {
              const st = STATUS_MAP[r.Estado] ?? STATUS_MAP.AGENDADO;
              return (
                <button
                  key={r.ServicoID}
                  onClick={() => navigate('/FixNRide/reparacoes')}
                  className="text-left bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-slate-900">
                        {r.trot?.Marca ?? 'Trotinete'} {r.trot?.Modelo ?? ''}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 font-semibold mt-0.5">{r.TrotineteNumSerie}</div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
                      style={{ background: st.bg, color: st.color, borderColor: st.color + '30' }}
                    >
                      {st.label}
                    </span>
                  </div>

                  {r.DescricaoDiagnostico && (
                    <div className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{r.DescricaoDiagnostico}</div>
                  )}

                  {/* Steps timeline */}
                  <div className="flex items-center gap-0 mb-3">
                    {["Agendado", "Em Oficina", "Pronto"].map((step, idx) => {
                      const done = st.step > idx;
                      const active = st.step === idx + 1;
                      const stepColor = (done || active) ? st.color : '#e2e8f0';
                      return (
                        <div key={idx} className="flex items-center flex-1 last:flex-initial">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ background: stepColor }}
                            >
                              {done ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'white' : '#cbd5e1' }} />
                              )}
                            </div>
                            <span className="text-[9px] font-semibold whitespace-nowrap" style={{ color: (done || active) ? st.color : '#cbd5e1' }}>{step}</span>
                          </div>
                          {idx < 2 && (
                            <div className="flex-1 h-0.5 mb-4 transition-all" style={{ background: done ? st.color : '#e2e8f0' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {r.Estado === 'CONCLUIDO' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                      <span className="text-xs font-semibold text-emerald-600">Pronta para levantamento · Contacte a loja</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-base font-bold text-slate-900 mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 border hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
              style={{ borderColor: a.border }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: a.bg, color: a.color }}>
                <a.Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900 mb-0.5">{a.label}</div>
                <div className="text-xs text-slate-400">{a.desc}</div>
              </div>
              <span className="text-slate-300 text-lg">›</span>
            </button>
          ))}
        </div>
      </section>
    </ClienteLayout>
  );
}
