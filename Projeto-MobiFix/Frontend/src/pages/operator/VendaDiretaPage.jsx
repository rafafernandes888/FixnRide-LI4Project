import React, { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Loader2, AlertCircle, Download, Tag } from 'lucide-react';
import Faturacao from '../../components/Faturacao';
import { usePecasOperator, useRegistarVendaDireta } from '../../hooks/useOperator';
import { usePromocoes } from '../../hooks/usePromocao';
import { getOperadorNumero } from '../../utils/auth';
import { gerarPDFFatura } from '../../utils/PDFFatura';

/**
 * Devolve a promoção ativa com maior desconto aplicável a uma peça
 * (válida entre dataInicio/dataFim e Ativa=true).
 */
function promocaoAplicavel(ean, promocoes) {
  if (!promocoes || promocoes.length === 0) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  const candidatas = promocoes.filter(p =>
    p.Ativa &&
    (p.PecasAplicaveisEANs ?? []).includes(ean) &&
    (!p.DataInicio || p.DataInicio.slice(0, 10) <= hoje) &&
    (!p.DataFim    || p.DataFim.slice(0, 10)    >= hoje)
  );
  if (candidatas.length === 0) return null;
  return candidatas.reduce((melhor, atual) =>
    (atual.PercentagemDesconto ?? 0) > (melhor.PercentagemDesconto ?? 0) ? atual : melhor
  );
}

function precoComDesconto(pvp, promo) {
  if (!promo) return pvp;
  const desc = (promo.PercentagemDesconto ?? 0) / 100;
  return Number((pvp * (1 - desc)).toFixed(2));
}

export default function VendaDireta() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showFaturacao, setShowFaturacao] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // ESTADO NOVO: Evita que o utilizador faça duplo-clique
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [clienteNif, setClienteNif] = useState('');

  const { data: pecas, isLoading, isError, refetch } = usePecasOperator();
  const { data: promocoes = [] } = usePromocoes();
  const { mutateAsync: registarVendaDireta } = useRegistarVendaDireta();

  const filteredProducts = useMemo(() => {
    if (!pecas) return [];
    const term = searchTerm.toLowerCase();

    return pecas.filter((p) => {
      if (p.Ativo === false || p.StockAtual <= 0) {
          return false;
      }

      const nome = (p.Nome ?? '').toLowerCase();
      const ean = (p.CodigoEAN ?? '').toString().toLowerCase();
      return nome.includes(term) || ean.includes(term);
    });
  }, [pecas, searchTerm]);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.CodigoEAN === product.CodigoEAN);
    if (existing) return updateQuantity(product.CodigoEAN, existing.quantity + 1);
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const updateQuantity = (ean, qty) => {
    const product = pecas?.find((p) => p.CodigoEAN === ean);
    if (qty <= 0) return removeFromCart(ean);

    setCart((prev) =>
      prev.map((item) =>
        item.CodigoEAN === ean
          ? { ...item, quantity: Math.min(qty, product?.StockAtual ?? qty) }
          : item
      )
    );
  };

  const removeFromCart = (ean) => setCart((prev) => prev.filter((item) => item.CodigoEAN !== ean));

  const cartWithPromo = useMemo(() => cart.map((item) => {
    const promo = promocaoAplicavel(item.CodigoEAN, promocoes);
    const precoOriginal = item.PVP ?? 0;
    const precoFinal = precoComDesconto(precoOriginal, promo);
    return { ...item, promo, precoOriginal, precoFinal };
  }), [cart, promocoes]);

  const totalAmount = cartWithPromo.reduce((sum, item) => sum + item.precoFinal * item.quantity, 0);

  const handleVendaConcluida = async (metodoOuDados) => {
    // PROTEÇÃO 1: Evitar duplos cliques (Se já estiver a submeter, cancela o resto)
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const metodoPagamento = typeof metodoOuDados === 'string' 
        ? metodoOuDados 
        : (metodoOuDados?.metodoPagamento || 'DINHEIRO');

      const operadorNumero = getOperadorNumero();
      if (!operadorNumero) {
        setFeedback({ tipo: 'erro', msg: 'Sessão inválida. Autentica-te novamente.' });
        return; 
      }

      // PROTEÇÃO 2: Gerar um ID curto (FT- + 6 dígitos aleatórios) para não rebentar limites de BD
      const randomPart = Math.floor(100000 + Math.random() * 900000); 
      const numeroFatura = `FT-${randomPart}`; 
      
      const nifFinal = clienteNif.trim() !== '' ? clienteNif.trim() : '000000000';

      const dto = {
        NumeroFatura: numeroFatura,
        ClienteNIF: nifFinal,
        OperadorNumero: operadorNumero,
        ValorTotal: Number(totalAmount.toFixed(2)),
        MetodoPagamento: metodoPagamento,
        ItensVenda: cartWithPromo.map(item => ({
          PecaEAN: item.CodigoEAN,
          Quantidade: item.quantity,
          PrecoUnitario: item.precoFinal
        }))
      };

      const resultado = await registarVendaDireta(dto);
      refetch();

      setFeedback({
        tipo: 'sucesso',
        msg: `Fatura ${resultado?.Fatura?.NumeroFatura ?? numeroFatura} emitida.`,
        faturaData: {
          NumeroFatura:    resultado?.Fatura?.NumeroFatura    ?? numeroFatura,
          DataEmissao:     resultado?.Fatura?.DataEmissao     ?? new Date().toISOString(),
          ClienteNIF:      resultado?.Fatura?.ClienteNIF      ?? nifFinal,
          MetodoPagamento: resultado?.Fatura?.MetodoPagamento ?? dto.MetodoPagamento,
          ValorTotal:      resultado?.Fatura?.ValorTotal      ?? dto.ValorTotal,
          VendaID:         resultado?.Venda?.VendaID          ?? 'Direta',
        }
      });
      
      setCart([]);
      setClienteNif(''); 
      
    } catch (err) {
      console.error("Erro no checkout:", err);
      // Extrai a mensagem real do Node para perceberes o que falhou se voltar a acontecer
      const msg = err?.response?.data?.mensagem ?? err?.message ?? 'Erro ao emitir fatura.';
      setFeedback({ tipo: 'erro', msg });
    } finally {
      setIsSubmitting(false); // Liberta o botão para a próxima
      setShowFaturacao(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-slate-500">A carregar inventário...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-8 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-red-700 font-bold">Erro ao ligar ao servidor</p>
        <button
          onClick={() => refetch()}
          className="mt-4 text-sm text-red-600 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-slate-900 overflow-y-auto p-6 lg:p-8">
      <header className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Venda</h2>
        <p className="text-sm text-slate-500">Gestão de ponto de venda e stock em tempo real</p>
      </header>

      {/* BANNER DE FEEDBACK */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-bold flex items-center justify-between ${
            feedback.tipo === 'sucesso'
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}
        >
          <div className="flex items-center gap-4">
            <span>{feedback.msg}</span>
            {feedback.tipo === 'sucesso' && feedback.faturaData && (
              <button
                onClick={() => gerarPDFFatura(feedback.faturaData)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-700 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Download size={14} />
                Descarregar Fatura
              </button>
            )}
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold mb-4">Produtos em Stock</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou EAN..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => {
                  const promo = promocaoAplicavel(product.CodigoEAN, promocoes);
                  const pvp = Number(product.PVP ?? 0);
                  const precoFinal = precoComDesconto(pvp, promo);
                  return (
                  <div
                    key={product.CodigoEAN}
                    className="p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800">{product.Nome}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-1 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded-md uppercase">
                            {product.Categoria ?? 'Geral'}
                          </span>
                          {promo && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black bg-red-100 text-red-700 rounded-md uppercase">
                              <Tag size={10} /> -{promo.PercentagemDesconto}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {promo ? (
                          <>
                            <span className="block text-xs line-through text-slate-400">€{pvp.toFixed(2)}</span>
                            <span className="text-lg font-black text-red-600">€{precoFinal.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-lg font-black text-blue-600">€{pvp.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Stock: {product.StockAtual}</span> 
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.StockAtual <= 0 || isSubmitting} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-bold ${
                          product.StockAtual > 0
                            ? 'bg-slate-900 text-white hover:bg-blue-600 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
              {filteredProducts.length === 0 && (
                <p className="text-center text-slate-400 py-10">Nenhum produto encontrado em stock.</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="sticky top-8 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-bold">Resumo da Venda</h3>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Trash2 className="h-8 w-8" />
                  </div>
                  <p className="text-slate-400 font-medium">O carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {cartWithPromo.map((item) => (
                      <div
                        key={item.CodigoEAN}
                        className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700 leading-tight">{item.Nome}</span>
                            {item.promo && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black bg-red-100 text-red-700 rounded uppercase">
                                <Tag size={9} /> -{item.promo.PercentagemDesconto}%
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.CodigoEAN)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border bg-white rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.CodigoEAN, item.quantity - 1)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.CodigoEAN, item.quantity + 1)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            {item.promo && (
                              <span className="block text-[10px] line-through text-slate-400">
                                €{(item.precoOriginal * item.quantity).toFixed(2)}
                              </span>
                            )}
                            <span className={`font-bold ${item.promo ? 'text-red-600' : 'text-slate-900'}`}>
                              €{(item.precoFinal * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      NIF do Cliente
                    </label>
                    <input
                      type="text"
                      placeholder="Consumidor Final (Opcional)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm mb-6"
                      value={clienteNif}
                      onChange={(e) => setClienteNif(e.target.value)}
                      maxLength={9}
                      disabled={isSubmitting} // Desativa o input enquanto envia
                    />

                    <div className="flex justify-between items-end mb-6">
                      <span className="text-slate-500 font-medium uppercase text-xs tracking-widest">Total</span>
                      <span className="text-3xl font-black text-blue-600">€{totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => setShowFaturacao(true)}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin h-5 w-5" /> A Processar...</>
                      ) : (
                        'Pagar Agora'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFaturacao && (
        <Faturacao
          amount={totalAmount}
          clientNif={clienteNif.trim() !== '' ? clienteNif.trim() : '000000000'}
          items={cartWithPromo.map((c) => ({
            name: c.Nome,
            price: c.precoFinal,
            quantity: c.quantity,
          }))}
          onClose={() => setShowFaturacao(false)}
          onComplete={handleVendaConcluida}
        />
      )}
    </div>
  );
}