import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, CheckCircle, Loader2 } from 'lucide-react';

export default function Faturacao({ amount, items, onClose, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [multibancoReference, setMultibancoReference] = useState('');

  const handlePayment = () => {
    setProcessing(true);
    if (paymentMethod === 'multibanco') {
      setMultibancoReference(`11249 ${Math.floor(100000000 + Math.random() * 900000000)}`);
    }
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      // Mapeia para o enum aceite pelo backend (Fatura.metodoPagamento)
      const metodoPagamento = paymentMethod === 'mbway' ? 'MBWAY' : 'MULTIBANCO';
      setTimeout(() => onComplete({ metodoPagamento }), 2500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Checkout</h2>
          </div>
          {!completed && (
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="h-6 w-6 text-slate-400" />
            </button>
          )}
        </div>

        <div className="p-8">
          {completed ? (
            <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">Venda Concluída!</h3>
              <p className="text-slate-500 mb-6">O recibo foi gerado com sucesso.</p>
              <div className="inline-block px-8 py-3 bg-slate-900 text-white rounded-full font-mono text-2xl font-bold">
                €{amount.toFixed(2)}
              </div>
            </div>
          ) : (
            <>
              {/* Resumo Rápido */}
              <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="max-h-32 overflow-y-auto mb-4 space-y-2 pr-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">{item.name} (x{item.quantity})</span>
                      <span className="text-slate-900 font-bold italic">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                  <span className="text-slate-400 font-bold uppercase text-xs">Total Final</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">€{amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Seleção de Pagamento */}
              <div className="space-y-4 mb-8">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Método de Recebimento</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('mbway')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group cursor-pointer ${
                      paymentMethod === 'mbway' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Smartphone className={`h-8 w-8 ${paymentMethod === 'mbway' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className={`font-bold ${paymentMethod === 'mbway' ? 'text-blue-900' : 'text-slate-500'}`}>MB WAY</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('multibanco')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group cursor-pointer ${
                      paymentMethod === 'multibanco' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Building2 className={`h-8 w-8 ${paymentMethod === 'multibanco' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className={`font-bold ${paymentMethod === 'multibanco' ? 'text-blue-900' : 'text-slate-500'}`}>Referência</span>
                  </button>
                </div>
              </div>

              {/* Inputs Dinâmicos */}
              {paymentMethod === 'mbway' && (
                <div className="mb-8 p-6 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100 animate-in slide-in-from-top-2">
                  <label className="block text-sm font-bold mb-2 opacity-80">Número de Telemóvel</label>
                  <input
                    type="tel"
                    placeholder="9xx xxx xxx"
                    className="w-full h-14 rounded-xl bg-white text-slate-900 text-2xl font-black text-center outline-none focus:ring-4 focus:ring-blue-300 transition-all placeholder:text-slate-200"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}

              {paymentMethod === 'multibanco' && multibancoReference && (
                <div className="mb-8 p-6 bg-slate-900 text-white rounded-2xl font-mono shadow-xl animate-in zoom-in-95">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-tighter">Entidade: 11249</p>
                  <div className="text-center">
                    <p className="text-slate-400 text-xs mb-1">Referência de Pagamento</p>
                    <p className="text-3xl font-bold tracking-widest text-blue-400">{multibancoReference.split(' ')[1]}</p>
                  </div>
                </div>
              )}

              {/* Botões Finais */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 h-14 rounded-xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all"
                  disabled={processing}
                >
                  Voltar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!paymentMethod || (paymentMethod === 'mbway' && phoneNumber.length < 9) || processing}
                  className="flex-[2] h-14 bg-slate-900 text-white rounded-xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-blue-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <><Loader2 className="h-6 w-6 animate-spin" /> Processando</>
                  ) : paymentMethod === 'multibanco' && !multibancoReference ? (
                    'Gerar Referência'
                  ) : (
                    'Finalizar Pagamento'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}