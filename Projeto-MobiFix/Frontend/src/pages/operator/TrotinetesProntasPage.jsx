import React, { useState } from 'react';
import { Bike, User, Euro, CheckCircle2, Clock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Faturacao from '../../components/Faturacao';
import { useTrotinetesProntas, useLevantarTrotinete } from '../../hooks/useOperator';

export default function TrotinetesProntas() {
  const { data: apiData, isLoading, isError, refetch } = useTrotinetesProntas();
  const { mutateAsync: levantarTrotinete } = useLevantarTrotinete();

  const [delivered, setDelivered] = useState([]); // Mantemos para estatísticas de sessão
  const [selectedTrotinete, setSelectedTrotinete] = useState(null);
  const [showFaturacao, setShowFaturacao] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false); // Estado para o loading do botão

  const handleDeliver = (trotinete) => {
    setSelectedTrotinete(trotinete);
    setShowFaturacao(true);
  };

  const handleFaturacaoComplete = async (dadosPagamento) => {
    if (!selectedTrotinete) return;

    try {
      setIsCompleting(true);

      const metodoPagamento = typeof dadosPagamento === 'string'
        ? dadosPagamento
        : (dadosPagamento?.metodoPagamento || 'MULTIBANCO');

      // Emite fatura do serviço + fecha (atómico no backend)
      await levantarTrotinete({
        id: selectedTrotinete.ServicoID,
        metodoPagamento,
      });

      setDelivered((prev) => [...prev, { ...selectedTrotinete, status: 'delivered' }]);
      refetch();
    } catch (error) {
      console.error("Erro ao efetuar levantamento:", error);
      alert("Ocorreu um erro ao registar o levantamento no sistema.");
    } finally {
      setIsCompleting(false);
      setSelectedTrotinete(null);
      setShowFaturacao(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600 mb-2" />
        <p className="text-slate-500 font-medium">A carregar trotinetes...</p>
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

  // Com o refetch(), a API já não nos envia as fechadas, mas mantemos 
  // este filtro por segurança caso a cache do React Query demore a limpar
  const readyTrotinetes = (apiData ?? []).filter(
    (t) => !delivered.some((d) => d.ServicoID === t.ServicoID)
  );

  return (
    <div className="w-full h-full overflow-y-auto p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Trotinetes Prontas</h2>
        <p className="text-sm text-slate-500">Trotinetes reparadas pendentes de levantamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard label="Prontas" value={readyTrotinetes.length} icon={<Clock className="h-8 w-8" />} color="blue" />
        <KpiCard
          label="Entregues Hoje"
          value={delivered.length}
          icon={<CheckCircle2 className="h-8 w-8" />}
          color="green"
        />
        <KpiCard
          label="Total a Receber"
          value={`€${readyTrotinetes.reduce((s, t) => s + (t.TotalFinal ?? t.Preco ?? 0), 0).toFixed(2)}`}
          icon={<Euro className="h-8 w-8" />}
          color="slate"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Bike className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-black text-slate-800">Aguardando Levantamento</h3>
        </div>

        <div className="overflow-x-auto">
          {readyTrotinetes.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bike className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sem trotinetes prontas</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-4 border-b border-slate-100">ID Serv.</th>
                  <th className="px-8 py-4 border-b border-slate-100">Equipamento</th>
                  <th className="px-8 py-4 border-b border-slate-100">Cliente NIF</th>
                  <th className="px-8 py-4 border-b border-slate-100 text-center">Data Conclusão</th>
                  <th className="px-8 py-4 border-b border-slate-100 text-blue-600">Falta Pagar</th>
                  <th className="px-8 py-4 border-b border-slate-100 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {readyTrotinetes.map((t) => (
                  <tr key={t.ServicoID} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-mono text-sm font-bold text-slate-400">#{t.ServicoID}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">
                          {t.Marca} {t.Modelo}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase">
                          Série: {t.TrotineteNumSerie}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{t.ClienteNIF}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {t.DataConclusao ? new Date(t.DataConclusao).toLocaleDateString('pt-PT') : '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-red-600 tabular-nums">
                          €{Number(t.TotalFinal ?? t.Preco ?? 0).toFixed(2)}
                        </span>
                        {Number(t.TotalPecas ?? 0) > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Mão de obra €{Number(t.MaoDeObra ?? t.Preco ?? 0).toFixed(2)} + Peças €{Number(t.TotalPecas).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDeliver(t)}
                        disabled={isCompleting}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-tighter rounded-xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleting ? 'A processar...' : 'Entregar'} <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showFaturacao && selectedTrotinete && (() => {
        const maoDeObra = Number(selectedTrotinete.MaoDeObra ?? selectedTrotinete.Preco ?? 0);
        const pecasItems = (selectedTrotinete.Pecas ?? []).map(p => ({
          name: `Peça: ${p.Nome} (${p.PecaEAN})`,
          price: Number(p.PrecoUnitario ?? 0),
          quantity: Number(p.Quantidade ?? 1),
        }));
        const items = [
          {
            name: `Mão de obra — ${selectedTrotinete.Marca ?? ''} ${selectedTrotinete.Modelo ?? ''} (SN: ${selectedTrotinete.TrotineteNumSerie})`,
            price: maoDeObra,
            quantity: 1,
          },
          ...pecasItems,
        ];
        const totalFinal = Number(
          selectedTrotinete.TotalFinal
          ?? items.reduce((s, i) => s + i.price * i.quantity, 0)
        );
        return (
          <Faturacao
            amount={totalFinal}
            clientNif={selectedTrotinete.ClienteNIF}
            serviceId={selectedTrotinete.ServicoID}
            items={items}
            onClose={() => {
              if (!isCompleting) {
                setSelectedTrotinete(null);
                setShowFaturacao(false);
              }
            }}
            onComplete={handleFaturacaoComplete}
          />
        );
      })()}
    </div>
  );
}

function KpiCard({ label, value, icon, color }) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    slate: 'text-slate-800 bg-slate-100',
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