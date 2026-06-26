import ClienteLayout from "./ClienteLayout";
import { FileText, Download, Loader2, Wallet } from "lucide-react";
import { useFaturas } from "../../hooks/useFaturas";
import { gerarPDFFatura } from "../../utils/PDFFatura";

export default function Faturas() {
  const { data: faturas, isLoading, isError } = useFaturas();

  const totalPago = faturas?.reduce((acc, f) => acc + f.ValorTotal, 0) || 0;

  if (isLoading) {
    return (
      <ClienteLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </ClienteLayout>
    );
  }

  if (isError) {
    return (
      <ClienteLayout>
        <div className="text-red-500 font-bold">Erro ao carregar faturas. Tente novamente.</div>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Minhas Faturas</h1>
        <p className="text-sm text-slate-400">Histórico completo de pagamentos e faturas emitidas.</p>
      </div>

      {/* Total card */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-blue-200 flex items-center gap-5">
        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] text-blue-100 font-bold uppercase tracking-wider mb-1">Total Pago Acumulado</p>
          <p className="text-4xl font-extrabold font-mono tracking-tight">€{totalPago.toFixed(2)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] text-blue-100 font-bold uppercase tracking-wider mb-1">Faturas</p>
          <p className="text-2xl font-extrabold font-mono">{faturas?.length ?? 0}</p>
        </div>
      </div>

      {faturas?.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium text-sm">Não foram encontradas faturas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">Histórico de Faturas</span>
          </div>
          <div className="divide-y divide-slate-50">
            {faturas?.map((fatura) => (
              <div key={fatura.NumeroFatura} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-all">
                <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 font-mono text-sm">{fatura.NumeroFatura}</h3>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Paga · {fatura.MetodoPagamento}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {fatura.ServicoID ? `Serviço de Manutenção #${fatura.ServicoID}` : `Venda #${fatura.VendaID}`}
                    <span className="text-slate-300 mx-1.5">·</span>
                    {new Date(fatura.DataEmissao).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <p className="text-lg font-extrabold text-slate-900 font-mono">€{fatura.ValorTotal.toFixed(2)}</p>
                <button
                  onClick={() => gerarPDFFatura(fatura)}
                  className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ClienteLayout>
  );
}
