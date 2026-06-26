import React, { useMemo, useState } from 'react';
import {
  Package, TruckIcon, CheckCircle, AlertCircle,
  Calendar, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { useEncomendasStockOperator, useConfirmarRececao } from '../../hooks/useOperator';
import { getOperadorNumero } from '../../utils/auth';

const ESTADO_EM_TRANSITO = 'TRANSITO';
const ESTADO_PENDENTE = 'PENDENTE';
const ESTADO_RECECIONADA = 'RECECIONADA';

function normalizarEstado(estado) {
  return (estado ?? '').toUpperCase().trim();
}

function rotuloEstado(estado) {
  const e = normalizarEstado(estado);
  if (e === ESTADO_EM_TRANSITO) return 'Em Trânsito';
  if (e === ESTADO_RECECIONADA) return 'Rececionada';
  if (e === ESTADO_PENDENTE) return 'Pendente';
  return estado ?? '—';
}

export default function RececaoEncomendas() {
  const { data: apiOrders, isLoading, isError, refetch } = useEncomendasStockOperator();
  const { mutate: confirmarRececao, isPending } = useConfirmarRececao();

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const orders = useMemo(() => apiOrders ?? [], [apiOrders]);

  const contadores = useMemo(() => ({
    emTransito: orders.filter((o) => normalizarEstado(o.Estado) === ESTADO_EM_TRANSITO).length,
    pendentes: orders.filter((o) => normalizarEstado(o.Estado) === ESTADO_PENDENTE).length,
    rececionadas: orders.filter((o) => normalizarEstado(o.Estado) === ESTADO_RECECIONADA).length,
  }), [orders]);

  const handleConfirmar = (id) => {
    const operadorNumero = getOperadorNumero();
    if (!operadorNumero) {
      setFeedback({ tipo: 'erro', msg: 'Sessão inválida. Autentica-te novamente.' });
      return;
    }

    confirmarRececao(
      { id, operadorNumero },
      {
        onSuccess: () => {
          setFeedback({ tipo: 'sucesso', msg: `Encomenda #${id} rececionada com sucesso.` });
          setExpandedOrder(null);
        },
        onError: (err) => {
          const msg = err?.response?.data?.mensagem ?? 'Erro ao confirmar receção.';
          setFeedback({ tipo: 'erro', msg });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600 mb-2" />
        <p className="text-slate-500 font-medium">A carregar encomendas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-xl flex items-center justify-between gap-2 border border-red-100">
        <div className="flex items-center gap-2">
          <AlertCircle /> Erro ao carregar dados do servidor.
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
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Receção de Encomendas</h2>
        <p className="text-sm text-slate-500">Apenas encomendas em trânsito podem ser conferidas e rececionadas.</p>
      </div>

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-bold flex items-center justify-between ${
            feedback.tipo === 'sucesso'
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}
        >
          <span>{feedback.msg}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline uppercase tracking-widest"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard
          label="Em Trânsito"
          value={contadores.emTransito}
          icon={<TruckIcon className="text-blue-200 h-8 w-8" />}
          color="blue"
        />
        <KpiCard
          label="Pendentes"
          value={contadores.pendentes}
          icon={<Calendar className="text-orange-200 h-8 w-8" />}
          color="orange"
        />
        <KpiCard
          label="Rececionadas"
          value={contadores.rececionadas}
          icon={<CheckCircle className="text-green-200 h-8 w-8" />}
          color="green"
        />
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sem encomendas no sistema</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <LinhaEncomenda
              key={order.EncomendaID}
              order={order}
              expanded={expandedOrder === order.EncomendaID}
              onToggle={() => setExpandedOrder((prev) => (prev === order.EncomendaID ? null : order.EncomendaID))}
              onConfirmar={() => handleConfirmar(order.EncomendaID)}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon, color }) {
  const textColor = {
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
  }[color];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
        <p className={`text-2xl font-black ${textColor}`}>{value}</p>
      </div>
      {icon}
    </div>
  );
}

function LinhaEncomenda({ order, expanded, onToggle, onConfirmar, isPending }) {
  const estado = normalizarEstado(order.Estado);
  const canReceive = estado === ESTADO_EM_TRANSITO;
  const isCompleted = estado === ESTADO_RECECIONADA;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all ${
        isCompleted
          ? 'border-green-100 bg-green-50/20 opacity-80'
          : canReceive
          ? 'border-blue-200 shadow-sm'
          : 'border-slate-200 opacity-70'
      }`}
    >
      <div
        onClick={onToggle}
        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-black text-slate-800">#ENC-{order.EncomendaID}</span>
            <span
              className={`px-2 py-1 text-[9px] font-black uppercase rounded ${
                estado === ESTADO_EM_TRANSITO
                  ? 'bg-blue-100 text-blue-700'
                  : estado === ESTADO_RECECIONADA
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {rotuloEstado(order.Estado)}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-400 flex flex-wrap gap-4">
            <span>Peça EAN: {order.PecaEAN}</span>
            <span>Qtd Esperada: {order.Quantidade} UN</span>
            <span>
              Pedida em:{' '}
              {order.DataPedido
                ? new Date(order.DataPedido).toLocaleDateString('pt-PT')
                : '—'}
            </span>
            {order.OperadorRececaoNumero && (
              <span>Rececionada por: {order.OperadorRececaoNumero}</span>
            )}
          </div>
        </div>

        {!canReceive && !isCompleted && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">
            <AlertCircle size={12} /> Aguarda confirmação do Administrador
          </div>
        )}

        <div className="p-2 rounded-lg bg-slate-50">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div className="p-6 border-t border-slate-100 bg-white rounded-b-2xl animate-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h4 className="text-sm font-black text-slate-700 mb-1">Conferência de Receção</h4>
              <p className="text-xs text-slate-400">
                Verifique se as {order.Quantidade} unidades do EAN {order.PecaEAN} chegaram em condições. Ao confirmar,
                o stock é automaticamente atualizado.
              </p>
            </div>

            <button
              disabled={!canReceive || isPending}
              onClick={onConfirmar}
              className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all cursor-pointer flex items-center gap-2"
            >
              {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : null}
              Confirmar Receção
            </button>
          </div>

          {!canReceive && !isCompleted && (
            <p className="mt-4 text-[10px] text-slate-400 italic text-center border-t pt-4">
              Esta encomenda está em estado <strong>{rotuloEstado(order.Estado)}</strong>. Só poderá confirmar a receção
              quando o fornecedor alterar para <strong>Em Trânsito</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
