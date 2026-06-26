import React, { useMemo, useState } from 'react';
import { Receipt, Loader2, AlertCircle, Undo2, CheckCircle2, X } from 'lucide-react';
import { useFaturasOperator, useDevolverFatura } from '../../hooks/useOperator';
import { gerarNotaCredito } from '../../utils/PDFNotaCredito';

export default function FaturasOperatorPage() {
  const { data: faturas, isLoading, isError, refetch } = useFaturasOperator();
  const { mutateAsync: devolverFatura, isPending: isDevolvendo } = useDevolverFatura();

  const [faturaSelecionada, setFaturaSelecionada] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const faturasOrdenadas = useMemo(
    () => [...(faturas ?? [])].sort((a, b) => (b.DataEmissao ?? '').localeCompare(a.DataEmissao ?? '')),
    [faturas]
  );

  const abrirModal = (fatura) => {
    setFaturaSelecionada(fatura);
    setMotivo('');
    setErrorMsg('');
  };

  const fecharModal = () => {
    if (isDevolvendo) return;
    setFaturaSelecionada(null);
    setMotivo('');
    setErrorMsg('');
  };

  const confirmarDevolucao = async () => {
    if (!faturaSelecionada) return;
    const trimmed = motivo.trim();
    if (trimmed.length < 3) {
      setErrorMsg('O motivo deve ter pelo menos 3 caracteres.');
      return;
    }
    try {
      setErrorMsg('');
      await devolverFatura({ numero: faturaSelecionada.NumeroFatura, motivo: trimmed });
      // Gera e faz download do PDF da nota de crédito após confirmação
      gerarNotaCredito(faturaSelecionada, trimmed);
      fecharModal();
    } catch (err) {
      const msg = err?.response?.data?.mensagem ?? 'Erro ao processar devolução.';
      setErrorMsg(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600 mb-2" />
        <p className="text-slate-500 font-medium">A carregar faturas...</p>
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

  return (
    <div className="w-full h-full overflow-y-auto p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Faturas Emitidas</h2>
        <p className="text-sm text-slate-500">Histórico de faturas — processar devoluções</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Receipt className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-black text-slate-800">Listagem</h3>
        </div>

        <div className="overflow-x-auto">
          {faturasOrdenadas.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sem faturas emitidas</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-6 py-4 border-b border-slate-100">Nº Fatura</th>
                  <th className="px-6 py-4 border-b border-slate-100">Cliente NIF</th>
                  <th className="px-6 py-4 border-b border-slate-100">Método</th>
                  <th className="px-6 py-4 border-b border-slate-100">Data</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Total</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-center">Estado</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {faturasOrdenadas.map((f) => {
                  const devolvida = (f.Devolucoes?.length ?? 0) > 0;
                  return (
                    <tr key={f.NumeroFatura} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">{f.NumeroFatura}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{f.ClienteNIF}</td>
                      <td className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        {f.MetodoPagamento}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {f.DataEmissao ? f.DataEmissao.replace('T', ' ') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800 tabular-nums">
                        €{Number(f.ValorTotal ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {devolvida ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded">
                            <CheckCircle2 size={12} /> Devolvida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 px-2 py-1 rounded">
                            Ativa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => abrirModal(f)}
                          disabled={devolvida}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-tighter rounded-xl hover:bg-red-700 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                        >
                          <Undo2 size={14} /> Devolver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {faturaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Processar Devolução</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Fatura <span className="font-mono font-bold">{faturaSelecionada.NumeroFatura}</span>
                </p>
              </div>
              <button
                onClick={fecharModal}
                disabled={isDevolvendo}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 font-medium">Cliente</span>
                <span className="font-bold text-slate-800">{faturaSelecionada.ClienteNIF}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Valor a creditar</span>
                <span className="font-black text-red-600 tabular-nums">
                  €{Number(faturaSelecionada.ValorTotal ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Motivo da devolução
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Ex.: Peça defeituosa, cliente arrependido..."
              disabled={isDevolvendo}
              className="w-full p-3 border border-slate-200 rounded-xl font-medium text-sm focus:outline-none focus:border-blue-600 disabled:opacity-50"
            />

            {errorMsg && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertCircle size={14} /> {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={fecharModal}
                disabled={isDevolvendo}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 text-sm font-black uppercase rounded-xl hover:bg-slate-200 transition-all disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDevolucao}
                disabled={isDevolvendo}
                className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-black uppercase rounded-xl hover:bg-red-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isDevolvendo ? <Loader2 className="animate-spin" size={16} /> : <Undo2 size={16} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}