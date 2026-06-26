import { useMemo } from 'react';
import { Loader2, Wrench, CheckCircle2, Clock, Bike, Euro, AlertCircle, Hourglass, Package } from 'lucide-react';
import ClienteLayout from './ClienteLayout';
import { useTrotinetes } from '../../hooks/useTrotinetes';
import { useServicos } from '../../hooks/useServicos';
import { useIntervencoesCatalogo } from '../../hooks/useIntervencoesCatalogo';

const ESTADO_META = {
  AGENDADO:  { label: 'Agendado',   color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  pct: 10,  step: 1, Icon: Hourglass },
  EXECUCAO:  { label: 'Em Oficina', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  pct: 55,  step: 2, Icon: Wrench },
  CONCLUIDO: { label: 'Pronta',    color: '#10b981', bg: 'rgba(16,185,129,0.10)',  pct: 100, step: 3, Icon: CheckCircle2 },
  FECHADO:   { label: 'Entregue',  color: '#64748b', bg: 'rgba(100,116,139,0.10)', pct: 100, step: 3, Icon: CheckCircle2 },
};

function formatDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return '—'; }
}

export default function AcompanharReparacoes() {
  const { data: trotinetes = [], isLoading: loadingTrot, isError: errorTrot } = useTrotinetes();
  const { data: servicos = [], isLoading: loadingServ, isError: errorServ } = useServicos();
  const { data: catalogo = [] } = useIntervencoesCatalogo();

  const reparacoes = useMemo(() => {
    if (!trotinetes.length || !servicos.length) return [];
    const seriesCliente = new Set(trotinetes.map(t => t.NumeroSerie));
    return servicos
      .filter(s => seriesCliente.has(s.TrotineteNumSerie))
      .sort((a, b) => new Date(b.DataAgendamento) - new Date(a.DataAgendamento))
      .map(s => {
        const trot = trotinetes.find(t => t.NumeroSerie === s.TrotineteNumSerie);
        const intervencoes = (s.HistoricoIntervencoes ?? []).map(h => {
          const cat = catalogo.find(c => c.IntervencaoID === h.IntervencaoCatalogoID);
          return {
            id: h.IntervencaoCatalogoID,
            descricao: cat?.Descricao ?? `Intervenção #${h.IntervencaoCatalogoID}`,
            preco: cat?.PrecoFixoMaoDeObra ?? 0,
            tempo: h.TempoGastoMinutos ?? null,
            dataFim: h.DataFim,
            pecas: h.PecasUtilizadas ?? [],
          };
        });
        return { ...s, trot, intervencoes };
      });
  }, [trotinetes, servicos, catalogo]);

  const ativas = reparacoes.filter(r => ['AGENDADO', 'EXECUCAO', 'CONCLUIDO'].includes(r.Estado));
  const historico = reparacoes.filter(r => r.Estado === 'FECHADO');

  if (loadingTrot || loadingServ) {
    return (
      <ClienteLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </ClienteLayout>
    );
  }

  if (errorTrot || errorServ) {
    return (
      <ClienteLayout>
        <div className="flex flex-col items-center justify-center gap-3 h-96">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="font-bold text-slate-700">Erro ao carregar reparações.</p>
        </div>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Minhas Reparações</h1>
        <p className="text-sm text-slate-400">Acompanhe o estado de todas as suas reparações em curso e o histórico.</p>
      </div>

      <section className="mb-10">
        <h2 className="text-base font-bold text-slate-900 mb-4">Reparações Ativas <span className="text-slate-400 font-medium">({ativas.length})</span></h2>
        {ativas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <Bike className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium text-sm">Nenhuma reparação em curso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ativas.map(r => <ServicoCard key={r.ServicoID} servico={r} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-bold text-slate-900 mb-4">Histórico <span className="text-slate-400 font-medium">({historico.length})</span></h2>
        {historico.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-medium text-sm">Ainda sem reparações concluídas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {historico.map(r => <ServicoCard key={r.ServicoID} servico={r} compact />)}
          </div>
        )}
      </section>
    </ClienteLayout>
  );
}

function ServicoCard({ servico, compact = false }) {
  const meta = ESTADO_META[servico.Estado] ?? ESTADO_META.AGENDADO;
  const Icon = meta.Icon;
  const total = servico.intervencoes.reduce((s, i) => s + (i.preco ?? 0), 0);
  const tempoTotal = servico.intervencoes.reduce((s, i) => s + (i.tempo ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900">
            {servico.trot?.Marca ?? 'Trotinete'} {servico.trot?.Modelo ?? ''}
          </h3>
          <p className="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">{servico.TrotineteNumSerie}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Serviço #{servico.ServicoID} · {formatDate(servico.DataAgendamento)}
          </p>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1"
          style={{ background: meta.bg, color: meta.color, borderColor: meta.color + '30' }}
        >
          <Icon size={10} /> {meta.label}
        </span>
      </div>

      {!compact && (
        <div className="flex items-center gap-0 my-4">
          {["Agendado", "Em Oficina", "Pronto"].map((step, idx) => {
            const done = meta.step > idx;
            const active = meta.step === idx + 1;
            const stepColor = (done || active) ? meta.color : '#e2e8f0';
            return (
              <div key={idx} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: stepColor }}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'white' : '#cbd5e1' }} />}
                  </div>
                  <span className="text-[9px] font-semibold whitespace-nowrap" style={{ color: (done || active) ? meta.color : '#cbd5e1' }}>{step}</span>
                </div>
                {idx < 2 && <div className="flex-1 h-0.5 mb-4 transition-all" style={{ background: done ? meta.color : '#e2e8f0' }} />}
              </div>
            );
          })}
        </div>
      )}

      {servico.FeedbackCliente && (
        <p className="text-xs text-slate-500 italic mb-2 line-clamp-2">"{servico.FeedbackCliente}"</p>
      )}

      {servico.DescricaoDiagnostico && (
        <div className="text-xs bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
          <p className="font-bold text-blue-700 mb-0.5 text-[10px] uppercase tracking-wider">Diagnóstico</p>
          <p className="text-slate-700">{servico.DescricaoDiagnostico}</p>
        </div>
      )}

      {servico.intervencoes.length > 0 && (
        <div className="border-t border-slate-100 pt-3 mt-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Intervenções realizadas</p>
          <div className="space-y-1.5">
            {servico.intervencoes.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  <span className="font-medium text-slate-700 truncate">{i.descricao}</span>
                  {i.pecas.length > 0 && (
                    <span className="flex items-center gap-0.5 text-blue-500">
                      <Package size={10} /> {i.pecas.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-400 shrink-0 ml-2">
                  {i.tempo && <span className="flex items-center gap-0.5"><Clock size={10} />{i.tempo}m</span>}
                  <span className="font-bold text-emerald-600">€{i.preco.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} /> {tempoTotal} min
            </div>
            <div className="flex items-center gap-1 font-extrabold text-slate-900">
              <Euro size={13} /> {total.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
