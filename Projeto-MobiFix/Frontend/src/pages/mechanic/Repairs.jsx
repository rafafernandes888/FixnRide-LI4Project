import { useState, useMemo } from 'react';
import {
  CheckCircle2, Clock, Bike,
  Package, Wrench, Loader2, AlertCircle, Euro
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAgendas, useAtualizarAgenda } from '../../hooks/useAgenda';
import { useServicos, useAtualizarServico } from '../../hooks/useServicos';
import { useIntervencoesCatalogo } from '../../hooks/useIntervencoesCatalogo';

function getMecanicoIdFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.id ?? null;
  } catch {
    return null;
  }
}

export default function Repairs() {
  const { mutateAsync: atualizarAgenda } = useAtualizarAgenda();
  const { mutateAsync: atualizarServico } = useAtualizarServico();
  const { data: agendas = [], isLoading: loadingAgendas, isError: errorAgendas } = useAgendas();
  const { data: servicos = [], isLoading: loadingServicos, isError: errorServicos } = useServicos();
  const { data: catalogo = [], isLoading: loadingCatalogo } = useIntervencoesCatalogo();

  const mecanicoId = getMecanicoIdFromToken();

  const repairs = useMemo(() => {
    if (!agendas.length || !servicos.length || !catalogo.length) return [];
    return agendas
      .filter(a => a.TipoSlot === 'REPARACAO' && a.Estado === 'RESERVADO')
      .map(agenda => {
        const servico = servicos.find(s => s.ServicoID === agenda.ServicoID);
        const intervencoes = (servico?.HistoricoIntervencoes ?? []).map(hiv => {
          const cat = catalogo.find(c => c.IntervencaoID === hiv.IntervencaoCatalogoID);
          return {
            id: hiv.IntervencaoCatalogoID,
            descricao: cat?.Descricao ?? `Intervenção #${hiv.IntervencaoCatalogoID}`,
            especialidade: cat?.Especialidade ?? '—',
            preco: cat?.PrecoFixoMaoDeObra ?? 0,
            pecas: hiv.PecasUtilizadas ?? [],
          };
        });
        return {
          agendaId: agenda.AgendaID,
          servicoId: agenda.ServicoID,
          dataHoraInicio: agenda.DataHoraInicio,
          trotineteNumSerie: servico?.TrotineteNumSerie ?? 'S/N',
          feedbackCliente: servico?.FeedbackCliente ?? '',
          descricaoDiagnostico: servico?.DescricaoDiagnostico ?? '',
          estado: agenda.Estado,
          intervencoes,
        };
      });
  }, [agendas, servicos, catalogo, mecanicoId]);

  const [registos, setRegistos] = useState({});
  const [inicioPorAgenda, setInicioPorAgenda] = useState({});
  const [activeTimer, setActiveTimer] = useState(null);

  const getConcluidas = (agendaId) => new Set(Object.keys(registos[agendaId] ?? {}).map(Number));

  const iniciarIntervencao = (agendaId, intervencaoId) => {
    setActiveTimer(`${agendaId}-${intervencaoId}`);
  };

  const marcarConcluida = async (agendaId, intervencaoId, descricao, todasIntervencoes) => {
    const agora = new Date();
    const agoraIso = agora.toISOString();
    const dataInicioRep = inicioPorAgenda[agendaId] ?? agoraIso;
    if (!inicioPorAgenda[agendaId]) {
      setInicioPorAgenda(prev => ({ ...prev, [agendaId]: dataInicioRep }));
    }
    const jaRegistadas = registos[agendaId] ?? {};
    const tempos = Object.values(jaRegistadas).map(r => new Date(r.dataFim).getTime());
    const inicioIntervencao = tempos.length > 0 ? new Date(Math.max(...tempos)).toISOString() : dataInicioRep;
    const tempoGastoMinutos = Math.max(1, Math.round((agora.getTime() - new Date(inicioIntervencao).getTime()) / 60000));

    const novosRegistos = {
      ...jaRegistadas,
      [intervencaoId]: { dataInicio: inicioIntervencao, dataFim: agoraIso, tempoGastoMinutos }
    };

    setRegistos(prev => ({ ...prev, [agendaId]: novosRegistos }));
    setActiveTimer(null);
    toast.success(`Intervenção concluída (${tempoGastoMinutos} min)`, { description: descricao });

    if (Object.keys(novosRegistos).length === todasIntervencoes.length) {
      const agendaOriginal = agendas.find(a => a.AgendaID === agendaId);
      const servicoOriginal = servicos.find(s => s.ServicoID === agendaOriginal?.ServicoID);
      if (!agendaOriginal || !servicoOriginal) {
        toast.error('Erro: Dados originais não encontrados.');
        return;
      }
      const precoTotal = todasIntervencoes.reduce((sum, i) => sum + (i.preco ?? 0), 0);
      const historicoPayload = todasIntervencoes.map(i => {
        const reg = novosRegistos[i.id];
        return {
          IntervencaoCatalogoID: i.id,
          MecanicoNumero: mecanicoId,
          DataInicio: reg.dataInicio,
          DataFim: reg.dataFim,
          TempoGastoMinutos: reg.tempoGastoMinutos,
          PecasUtilizadas: (i.pecas ?? []).map(p => ({ PecaEAN: p.PecaEAN, Quantidade: p.Quantidade }))
        };
      });
      const payloadServico = {
        Estado: 'CONCLUIDO',
        Preco: precoTotal,
        DataConclusao: agoraIso,
        HistoricoIntervencoes: historicoPayload
      };
      toast.promise(
        Promise.all([
          atualizarAgenda({ id: agendaId, dados: { ...agendaOriginal, Estado: 'CONCLUIDO' } }),
          atualizarServico({ id: servicoOriginal.ServicoID, dados: payloadServico })
        ]),
        {
          loading: 'A finalizar reparação no servidor...',
          success: `Reparação concluída — €${precoTotal.toFixed(2)} faturáveis.`,
          error: 'Erro ao fechar a reparação no servidor.'
        }
      );
    }
  };

  const getProgress = (agendaId, intervencoes) => {
    if (!intervencoes.length) return { completed: 0, total: 0, pct: 0 };
    const set = getConcluidas(agendaId);
    const completed = intervencoes.filter(i => set.has(i.id)).length;
    return { completed, total: intervencoes.length, pct: Math.round((completed / intervencoes.length) * 100) };
  };

  const [selectedAgendaId, setSelectedAgendaId] = useState(null);
  const selectedRepair = repairs.find(r => r.agendaId === selectedAgendaId);

  const formatHora = (iso) => {
    try { return new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); }
    catch { return '--:--'; }
  };

  const isLoading = loadingAgendas || loadingServicos || loadingCatalogo;
  const isError = errorAgendas || errorServicos;

  if (isLoading) return (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
        <p className="mt-3 font-bold text-slate-600">A carregar a sua agenda...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex h-full items-center justify-center bg-slate-50 p-6">
      <div className="rounded-2xl bg-white p-8 shadow-xl text-center border border-red-100">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" />
        <h2 className="text-lg font-extrabold text-slate-900">Erro de Sincronização</h2>
        <p className="text-slate-500 mt-1 text-sm">Não foi possível carregar os agendamentos.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 px-5 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50">
      <Toaster position="top-right" richColors />

      {/* Dark sidebar */}
      <aside className="w-[340px] bg-[#0f172a] flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Minhas Reparações</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {repairs.length} {repairs.length !== 1 ? 'atribuídas' : 'atribuída'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {repairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <Clock className="mb-3 h-12 w-12 opacity-20" />
              <p className="text-sm font-bold">Sem reparações atribuídas</p>
            </div>
          ) : (
            repairs.map((repair) => {
              const prog = getProgress(repair.agendaId, repair.intervencoes);
              const isSelected = selectedAgendaId === repair.agendaId;
              const concluiuTudo = prog.pct === 100;
              const urgColor = '#3b82f6';

              return (
                <div
                  key={repair.agendaId}
                  onClick={() => setSelectedAgendaId(repair.agendaId)}
                  className={`cursor-pointer rounded-xl p-3.5 transition-all border ${
                    isSelected
                      ? 'bg-emerald-900/30 border-emerald-500/40'
                      : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                  style={{ borderLeft: `3px solid ${urgColor}` }}
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-[13px] font-bold text-white">{repair.trotineteNumSerie}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">Serviço #{repair.servicoId}</div>
                    </div>
                    <div className="text-[11px] font-bold font-mono text-slate-400">{formatHora(repair.dataHoraInicio)}</div>
                  </div>

                  <div className="flex justify-between text-[10px] font-semibold mb-1.5" style={{ color: concluiuTudo ? '#4ade80' : '#64748b' }}>
                    <span>{prog.completed}/{prog.total} intervenções</span>
                    <span>{prog.pct}%</span>
                  </div>
                  <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${prog.pct}%`,
                        background: concluiuTudo ? '#4ade80' : '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {selectedRepair ? (() => {
          const prog = getProgress(selectedRepair.agendaId, selectedRepair.intervencoes);
          const concluiuTudo = prog.pct === 100;
          const set = getConcluidas(selectedRepair.agendaId);
          const regs = registos[selectedRepair.agendaId] ?? {};
          const totalMaoDeObra = selectedRepair.intervencoes.reduce((s, i) => s + i.preco, 0);
          const tempoTotalMin = Object.values(regs).reduce((s, r) => s + (r.tempoGastoMinutos ?? 0), 0);

          return (
            <div className="mx-auto max-w-4xl p-8 space-y-5">
              {/* Vehicle Card */}
              <div className="rounded-3xl bg-gradient-to-br from-[#064e3b] to-[#065f46] p-7 text-white shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] text-white/50 font-bold uppercase tracking-[0.12em] mb-1.5">
                      Trabalho em Curso
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-3">
                      {selectedRepair.trotineteNumSerie}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5">
                        <Bike size={12} /> {selectedRepair.trotineteNumSerie}
                      </span>
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <Clock size={12} /> {formatHora(selectedRepair.dataHoraInicio)}
                      </span>
                      <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <Euro size={12} /> M.O. €{totalMaoDeObra.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/50 mb-1">Progresso</div>
                    <div className="text-3xl font-extrabold font-mono">{prog.pct}%</div>
                    <div className="text-[11px] text-white/60">{prog.completed}/{prog.total} tarefas</div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${prog.pct}%`,
                      background: concluiuTudo ? '#4ade80' : '#34d399'
                    }}
                  />
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedRepair.feedbackCliente && (
                  <div className="rounded-xl bg-white border border-amber-100 border-l-[3px] border-l-amber-500 p-4">
                    <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider mb-1">Queixa</p>
                    <p className="text-xs text-slate-700 italic">"{selectedRepair.feedbackCliente}"</p>
                  </div>
                )}
                {selectedRepair.descricaoDiagnostico && (
                  <div className="rounded-xl bg-white border border-blue-100 border-l-[3px] border-l-blue-500 p-4">
                    <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mb-1">Diagnóstico</p>
                    <p className="text-xs text-slate-700">{selectedRepair.descricaoDiagnostico}</p>
                  </div>
                )}
              </div>

              {/* Interventions Checklist */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                  Intervenções a Realizar
                  <span className="ml-auto text-xs font-bold text-slate-400">{set.size}/{selectedRepair.intervencoes.length}</span>
                </h3>

                {selectedRepair.intervencoes.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">Sem intervenções registadas neste serviço.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedRepair.intervencoes.map((interv, idx) => {
                      const feita = set.has(interv.id);
                      const isActive = activeTimer === `${selectedRepair.agendaId}-${interv.id}`;
                      const prevsDone = selectedRepair.intervencoes.slice(0, idx).every(i => set.has(i.id));
                      const canStart = prevsDone && !feita;

                      return (
                        <div
                          key={interv.id}
                          className={`rounded-xl border-[1.5px] p-4 transition-all ${
                            feita ? 'bg-emerald-50 border-emerald-200' :
                            isActive ? 'bg-blue-50 border-blue-200' :
                            'bg-white border-slate-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                background: feita ? '#10b981' : isActive ? '#3b82f6' : '#e2e8f0'
                              }}
                            >
                              {feita ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                              ) : (
                                <span className={`text-[11px] font-extrabold ${isActive ? 'text-white' : 'text-slate-400'}`}>{idx + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-bold ${feita ? 'text-emerald-800 line-through' : 'text-slate-900'}`}>
                                    {interv.descricao}
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {interv.especialidade !== '—' && (
                                      <span className="text-[11px] text-slate-400 font-semibold">{interv.especialidade}</span>
                                    )}
                                    <span className="text-[11px] text-emerald-600 font-bold">€{interv.preco.toFixed(2)}</span>
                                    {regs[interv.id]?.tempoGastoMinutos && (
                                      <span className="text-[11px] text-blue-600 font-bold">⏱ {regs[interv.id].tempoGastoMinutos} min</span>
                                    )}
                                  </div>
                                  {interv.pecas.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {interv.pecas.map((p, pi) => (
                                        <span key={pi} className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Package className="h-2.5 w-2.5" /> {p.PecaEAN} ×{p.Quantidade}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {!feita && (
                                  canStart ? (
                                    isActive ? (
                                      <button
                                        onClick={() => marcarConcluida(selectedRepair.agendaId, interv.id, interv.descricao, selectedRepair.intervencoes)}
                                        className="ml-3 shrink-0 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-all"
                                      >
                                        Concluir
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => iniciarIntervencao(selectedRepair.agendaId, interv.id)}
                                        className="ml-3 shrink-0 px-4 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-extrabold hover:bg-blue-800 transition-all"
                                      >
                                        Iniciar
                                      </button>
                                    )
                                  ) : (
                                    <span className="ml-3 shrink-0 text-[11px] text-slate-400 font-semibold">Aguarda anterior</span>
                                  )
                                )}
                                {feita && <span className="ml-3 shrink-0 text-[11px] text-emerald-600 font-bold">Feito</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {concluiuTudo && (
                  <div className="mt-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 text-center text-white">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2" strokeWidth={2.5} />
                    <h3 className="text-lg font-extrabold">Reparação Concluída!</h3>
                    <p className="text-emerald-100 text-xs mt-1">
                      Todas as intervenções validadas · €{totalMaoDeObra.toFixed(2)} faturáveis · {tempoTotalMin} min
                    </p>
                  </div>
                )}
              </div>

              <div className="pb-12" />
            </div>
          );
        })() : (
          <div className="flex h-full flex-col items-center justify-center text-slate-300 gap-3">
            <Wrench className="h-16 w-16 opacity-20" />
            <p className="text-base font-bold text-slate-400">Selecione uma reparação na fila</p>
            <p className="text-xs font-medium text-slate-400">{repairs.length} atribuída{repairs.length !== 1 ? 's' : ''} a si</p>
          </div>
        )}
      </main>
    </div>
  );
}
