import { useState, useMemo } from 'react';
import {
  FileDown, CalendarCheck, Clock, User, Bike,
  Loader2, AlertCircle, ShieldCheck, Euro, ClipboardList
} from 'lucide-react';
import { RepairList } from '../../components/RepairList';
import { InterventionSelector } from '../../components/SelecionarIntervencao';
import { EANScanner } from '../../components/EANScanner';
import { ScheduleRepairDialog } from '../../components/AgendamentoReparacao';
import { toast, Toaster } from 'sonner';
import { generateDiagnosticPDF } from '../../utils/PDFGuiaReparacao';
import { useAgendas, useCriarAgenda, useAtualizarAgenda } from '../../hooks/useAgenda';
import { useServicos, useAtualizarServico } from '../../hooks/useServicos';
import { useBuscarTrotinete } from '../../hooks/useTrotinetes';

export default function Dashboard() {
  const { data: agendas, isLoading: loadingAgendas, isError: errorAgendas } = useAgendas();
  const { data: servicos, isLoading: loadingServicos } = useServicos();
  const { mutateAsync: criarAgendamento, isPending: isSaving } = useCriarAgenda();
  const { mutateAsync: atualizarAgendamento } = useAtualizarAgenda();
  const { mutateAsync: atualizarServico } = useAtualizarServico();

  const repairs = useMemo(() => {
    if (!agendas || !servicos) return [];
    return agendas
      .filter(a => a.TipoSlot === 'DIAGNOSTICO' && a.Estado === 'RESERVADO')
      .map(a => {
        const s = servicos.find(sv => sv.ServicoID === a.ServicoID);
        return {
          id: a.AgendaID,
          servicoId: a.ServicoID,
          vehiclePlate: s?.TrotineteNumSerie || 'S/N',
          clientName: s?.FeedbackCliente || 'Cliente Registado',
          status: a.Estado,
          scheduledTime: new Date(a.DataHoraInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: s?.DescricaoDiagnostico || '',
        };
      });
  }, [agendas, servicos]);

  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const selectedRepair = repairs.find(r => r.id === selectedRepairId);

  const { data: trotineteInfo } = useBuscarTrotinete(
    selectedRepair?.vehiclePlate !== 'S/N' ? selectedRepair?.vehiclePlate : null
  );

  const displayData = {
    ...selectedRepair,
    vehicleBrand: trotineteInfo?.Marca || '—',
    vehicleModel: trotineteInfo?.Modelo || '—',
    clientNif: trotineteInfo?.ClienteId || 'N/A',
    emServico: trotineteInfo?.EmServico,
  };

  const [selectedInterventions, setSelectedInterventions] = useState([]);
  const [parts, setParts] = useState([]);
  const [notes, setNotes] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const limparFormulario = () => {
    setSelectedInterventions([]);
    setParts([]);
    setNotes('');
  };

  const totalMaoDeObra = selectedInterventions.reduce((s, i) => s + (i.PrecoFixoMaoDeObra ?? 0), 0);
  const totalPecas = parts.reduce((s, p) => s + (p.PVP ?? 0) * p.StockAtual, 0);

  const handleScheduleRepair = async (scheduleData) => {
    if (!selectedRepair) return;
    const agendaOriginal = agendas.find(a => a.AgendaID === selectedRepair.id);
    const payloadUpdate = { ...agendaOriginal, Estado: 'CONCLUIDO' };
    const payloadNovo = {
      servicoID: selectedRepair.servicoId,
      dataHoraInicio: `${scheduleData.date}T${scheduleData.time}:00`,
      tipoSlot: 'REPARACAO',
      mecanicoNumero: agendaOriginal?.MecanicoNumero ?? '',
    };
    const pecasPayload = parts.map(p => ({ PecaEAN: p.CodigoEAN, Quantidade: p.StockAtual ?? 1 }));
    const historicoIntervencoes = selectedInterventions.map((i, idx) => ({
      IntervencaoCatalogoID: i.IntervencaoID,
      MecanicoNumero: agendaOriginal?.MecanicoNumero ?? '',
      PecasUtilizadas: idx === 0 ? pecasPayload : [],
    }));
    const servicoPayload = {
      Estado: 'EXECUCAO',
      DescricaoDiagnostico: notes,
      HistoricoIntervencoes: historicoIntervencoes,
    };

    try {
      await atualizarAgendamento({ id: selectedRepair.id, dados: payloadUpdate });
      await atualizarServico({ id: selectedRepair.servicoId, dados: servicoPayload });
      await criarAgendamento(payloadNovo);
      toast.success('Reparação agendada e diagnóstico concluído!');
      setShowScheduleDialog(false);
      limparFormulario();
      setSelectedRepairId(null);
    } catch {
      toast.error('Erro ao processar agendamento.');
    }
  };

  if (loadingAgendas || loadingServicos) return (
    <div className="flex h-full items-center justify-center bg-slate-50 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="text-base font-bold text-slate-700">A carregar dados do sistema...</span>
    </div>
  );

  if (errorAgendas) return (
    <div className="flex h-full items-center justify-center bg-slate-50 text-red-600 gap-3">
      <AlertCircle className="h-8 w-8" />
      <span className="text-base font-bold">Erro ao carregar a agenda.</span>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50">
      <Toaster position="top-center" richColors />

      {/* Sidebar - Dark Queue */}
      <aside className="w-[340px] bg-[#0f172a] flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Fila de Diagnóstico</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">{repairs.length} {repairs.length === 1 ? 'reservado' : 'reservados'} · Aguardam diagnóstico</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <RepairList
            repairs={repairs}
            selectedRepairId={selectedRepairId}
            onSelectRepair={(id) => {
              setSelectedRepairId(id);
              limparFormulario();
            }}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {selectedRepair ? (
          <div className="mx-auto max-w-4xl p-8 space-y-5">
            {/* Vehicle Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] p-7 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-5 -right-5 w-32 h-32 rounded-full bg-white/[0.04]" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-[11px] text-white/50 font-bold uppercase tracking-[0.12em] mb-1.5">
                    Veículo em Diagnóstico
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                    {displayData.vehicleBrand} {displayData.vehicleModel}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-mono font-semibold">{displayData.vehiclePlate}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold">Agenda #{displayData.id}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Clock size={11} /> {displayData.scheduledTime}
                    </span>
                  </div>
                </div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                  {displayData.status}
                </span>
              </div>
              {displayData.emServico && (
                <span className="mt-4 inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Em Manutenção
                </span>
              )}
            </div>

            {/* Customer complaint */}
            {displayData.description && (
              <div className="rounded-2xl bg-white border border-amber-100 border-l-4 border-l-amber-500 p-4">
                <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider mb-1.5">Queixa do Cliente</p>
                <p className="text-sm text-slate-700 italic leading-relaxed">"{displayData.description}"</p>
              </div>
            )}

            <InterventionSelector
              selectedInterventions={selectedInterventions}
              onAddIntervention={(i) => {
                if (!selectedInterventions.find(s => s.IntervencaoID === i.IntervencaoID))
                  setSelectedInterventions(prev => [...prev, i]);
              }}
              onRemoveIntervention={(id) =>
                setSelectedInterventions(prev => prev.filter(i => i.IntervencaoID !== id))
              }
            />

            <EANScanner
              parts={parts}
              onAddPart={(part) => {
                setParts(prev => {
                  const idx = prev.findIndex(p => p.CodigoEAN === part.CodigoEAN);
                  return idx >= 0 ? prev.map((p, i) => i === idx ? part : p) : [...prev, part];
                });
              }}
              onRemovePart={(ean) => setParts(prev => prev.filter(p => p.CodigoEAN !== ean))}
            />

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-slate-900">Relatório de Diagnóstico</h3>
              <textarea
                placeholder="Escreva aqui o diagnóstico técnico detalhado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border-[1.5px] border-slate-200 p-3.5 text-sm focus:border-blue-500 outline-none transition-all resize-none bg-slate-50"
              />
            </div>

            {(selectedInterventions.length > 0 || parts.length > 0) && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-700">Mão de obra: €{totalMaoDeObra.toFixed(2)}</p>
                  <p className="text-xs font-bold text-emerald-700">Peças: €{totalPecas.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider">Total estimado</p>
                  <p className="text-3xl font-extrabold text-emerald-700 flex items-center gap-1 font-mono">
                    <Euro className="h-5 w-5" />{(totalMaoDeObra + totalPecas).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-12">
              <button
                onClick={() => {
                  generateDiagnosticPDF(displayData, selectedInterventions, parts, notes);
                  toast.success('Guia PDF gerada!');
                }}
                disabled={selectedInterventions.length === 0}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white font-extrabold shadow-lg disabled:opacity-40 disabled:bg-slate-100 disabled:bg-none disabled:text-slate-400 disabled:cursor-not-allowed hover:shadow-xl transition-all"
              >
                <FileDown className="h-5 w-5" /> Gerar Guia PDF
              </button>
              <button
                onClick={() => setShowScheduleDialog(true)}
                disabled={selectedInterventions.length === 0 || isSaving}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-extrabold shadow-lg disabled:opacity-40 disabled:bg-slate-100 disabled:bg-none disabled:text-slate-400 disabled:cursor-not-allowed hover:shadow-xl transition-all"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarCheck className="h-5 w-5" />}
                {isSaving ? 'A guardar...' : 'Agendar Reparação'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-300 gap-3">
            <ClipboardList className="h-16 w-16 opacity-30" />
            <p className="text-base font-bold text-slate-400">Selecione um item da fila</p>
            <p className="text-xs font-medium text-slate-400">{repairs.length} aguardam diagnóstico</p>
          </div>
        )}
      </main>

      {showScheduleDialog && (
        <ScheduleRepairDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          repair={displayData}
          interventions={selectedInterventions}
          parts={parts}
          onConfirmSchedule={handleScheduleRepair}
        />
      )}
    </div>
  );
}
