import React, { useState } from 'react';
import { Package, User, CheckCircle2, ArrowRight, Box, Loader2, AlertCircle } from 'lucide-react';
import Faturacao from '../../components/Faturacao';
import { usePecasReservadas, useLevantarPecaReservada } from '../../hooks/useOperator';

export default function PecasReservadas() {
  const { data: apiData, isLoading, isError, refetch } = usePecasReservadas();
  const { mutateAsync: levantarPeca } = useLevantarPecaReservada();

  const [selectedReserva, setSelectedReserva] = useState(null);
  const [showFaturacao, setShowFaturacao] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleConfirmPickup = (reserva) => {
    setSelectedReserva(reserva);
    setShowFaturacao(true);
  };

  const handleFaturacaoComplete = async (dadosPagamento) => {
    if (!selectedReserva) return;
    try {
      setIsCompleting(true);
      const metodoPagamento = typeof dadosPagamento === 'string'
        ? dadosPagamento
        : (dadosPagamento?.metodoPagamento || 'MULTIBANCO');

      await levantarPeca({
        id: selectedReserva.EncomendaClienteID,
        metodoPagamento,
      });
      refetch();
    } catch (err) {
      console.error('Erro ao levantar encomenda:', err);
      alert('Ocorreu um erro ao registar o levantamento.');
    } finally {
      setIsCompleting(false);
      setSelectedReserva(null);
      setShowFaturacao(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600 mb-2" />
        <p className="text-slate-500 font-medium">A carregar...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-xl flex items-center justify-between gap-2 border border-red-100">
        <div className="flex items-center gap-2">
          <AlertCircle /> Erro ao ligar ao servidor.
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs font-black uppercase px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const reservas = apiData ?? [];
  const valorTotalStock = reservas.reduce((s, r) => s + (r.Total ?? 0), 0);

  return (
    <div className="w-full h-full overflow-y-auto p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Peças Reservadas</h2>
        <p className="text-sm text-slate-500">Artigos pagos e validados, aguardando levantamento em loja</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard label="Pendentes" value={reservas.length} icon={<Package className="h-8 w-8" />} color="orange" />
        <KpiCard
          label="Artigos"
          value={reservas.reduce((s, r) => s + (r.Itens?.reduce((x, i) => x + (i.Quantidade ?? 0), 0) ?? 0), 0)}
          icon={<CheckCircle2 className="h-8 w-8" />}
          color="green"
        />
        <KpiCard
          label="Valor Reservado"
          value={`€${valorTotalStock.toFixed(2)}`}
          icon={<Box className="h-8 w-8" />}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Package className="h-6 w-6 text-orange-600" />
          <h3 className="text-xl font-black text-slate-800">Prontas para Entrega</h3>
        </div>

        <div className="overflow-x-auto">
          {reservas.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sem reservas pendentes</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-4 border-b border-slate-100">Referência</th>
                  <th className="px-8 py-4 border-b border-slate-100">Artigos</th>
                  <th className="px-8 py-4 border-b border-slate-100">Cliente NIF</th>
                  <th className="px-8 py-4 border-b border-slate-100 text-center">Reserva</th>
                  <th className="px-8 py-4 border-b border-slate-100">Total</th>
                  <th className="px-8 py-4 border-b border-slate-100 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reservas.map((r) => (
                  <tr key={r.EncomendaClienteID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-mono text-xs font-bold text-slate-400">#{r.EncomendaClienteID}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-0.5">
                        {(r.Itens ?? []).map((i) => (
                          <span key={i.PecaEAN} className="font-bold text-slate-800 text-sm">
                            {i.Quantidade}× {i.Nome ?? i.PecaEAN}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{r.ClienteNIF}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-xs font-bold text-slate-500 tabular-nums">
                        {r.DataEncomenda ? new Date(r.DataEncomenda).toLocaleDateString('pt-PT') : '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">
                        €{Number(r.Total ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleConfirmPickup(r)}
                        disabled={isCompleting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleting ? 'A processar...' : 'Confirmar Levantamento'} <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showFaturacao && selectedReserva && (
        <Faturacao
          amount={selectedReserva.Total ?? 0}
          clientNif={selectedReserva.ClienteNIF}
          items={(selectedReserva.Itens ?? []).map(i => ({
            name: `${i.Quantidade}× ${i.Nome ?? i.PecaEAN}`,
            price: i.PrecoUnitario ?? 0,
            quantity: i.Quantidade,
          }))}
          onClose={() => {
            if (!isCompleting) {
              setSelectedReserva(null);
              setShowFaturacao(false);
            }
          }}
          onComplete={handleFaturacaoComplete}
        />
      )}
    </div>
  );
}

function KpiCard({ label, value, icon, color }) {
  const colorMap = {
    orange: 'text-orange-600 bg-orange-50',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black tabular-nums text-slate-800">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
    </div>
  );
}
