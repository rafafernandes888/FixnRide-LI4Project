import { useState, useMemo } from 'react';
import { Barcode, Scan, Plus, X, Search, LayoutList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePecas } from '../hooks/usePecas';

export function EANScanner({ parts, onAddPart, onRemovePart }) {
  const [eanCode, setEanCode]     = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');

  const { data: pecasApi = [], isLoading: loadingPecas } = usePecas();

  // Mapa EAN → peça para lookup rápido no scan
  const pecaMap = useMemo(() =>
    Object.fromEntries(pecasApi.map(p => [p.CodigoEAN, p])),
    [pecasApi]
  );

  const browsePecas = useMemo(() =>
    pecasApi.filter(p =>
      p.Nome?.toLowerCase().includes(browseSearch.toLowerCase()) ||
      p.CodigoEAN?.includes(browseSearch)
    ).filter(p => p.StockAtual > 0),
    [pecasApi, browseSearch]
  );

  // Simula o scanner escolhendo uma peça aleatória do stock real
  const handleScanSimulation = () => {
    if (pecasApi.length === 0) {
      toast.error('Sem peças carregadas da API');
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      const comStock = pecasApi.filter(p => p.StockAtual > 0);
      const peca = comStock[Math.floor(Math.random() * comStock.length)];
      setEanCode(peca.CodigoEAN);
      setIsScanning(false);
      toast.success(`EAN lido: ${peca.CodigoEAN}`);
    }, 1200);
  };

  const addByEan = (ean) => {
    if (!ean) { toast.error('Insira um código EAN'); return; }
    const peca = pecaMap[ean];
    if (!peca) { toast.error(`Peça ${ean} não encontrada no sistema`); return; }
    if (peca.StockAtual <= 0) { toast.error(`${peca.Nome} está sem stock`); return; }

    const existing = parts.find(p => p.ean === ean);
    const newQty = (existing?.quantity ?? 0) + 1;
    if (newQty > peca.StockAtual) { toast.error(`Stock insuficiente (máx. ${peca.StockAtual})`); return; }

    onAddPart({
      CodigoEAN:      peca.CodigoEAN,
      Nome:     peca.Nome,
      PVP:      peca.PVP,
      StockAtual: newQty,
      timestamp: new Date().toISOString(),
    });
    toast.success(`${peca.Nome} adicionada`);
    setEanCode('');
  };

  const addFromBrowse = (peca) => {
    addByEan(peca.CodigoEAN);
  };

  return (
    <div className="p-6 border-2 border-slate-200 rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Barcode className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900">Peças Utilizadas</h3>
        </div>
        <button
          onClick={() => setShowBrowse(!showBrowse)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all"
        >
          <LayoutList className="w-4 h-4" />
          {showBrowse ? 'Fechar Lista' : 'Ver Catálogo'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Input EAN + botões */}
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Código EAN (ex: 7891234567890)"
            value={eanCode}
            onChange={(e) => setEanCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addByEan(eanCode)}
            className="flex-1 h-14 px-4 text-lg font-mono rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={handleScanSimulation}
              disabled={isScanning || loadingPecas}
              className="flex-1 md:flex-none h-14 px-5 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 active:scale-95"
            >
              <Scan className={`w-5 h-5 ${isScanning ? 'animate-pulse' : ''}`} />
              {isScanning ? 'A Ler...' : 'Scan'}
            </button>
            <button
              onClick={() => addByEan(eanCode)}
              disabled={!eanCode}
              className="flex-1 md:flex-none h-14 px-5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Browse catálogo */}
        {showBrowse && (
          <div className="rounded-xl border-2 border-blue-100 bg-slate-50 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative mb-3">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar peças..."
                value={browseSearch}
                onChange={(e) => setBrowseSearch(e.target.value)}
                className="h-10 w-full rounded-lg border-2 border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {loadingPecas ? (
                <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">A carregar peças...</span>
                </div>
              ) : browsePecas.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Nenhuma peça com stock encontrada.</p>
              ) : (
                browsePecas.map((p) => {
                  const jaAdicionada = parts.find(pt => pt.CodigoEAN === p.CodigoEAN);
                  return (
                    <div
                      key={p.CodigoEAN}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-blue-300 transition-all group cursor-pointer"
                      onClick={() => addFromBrowse(p)}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{p.Nome}</p>
                        <p className="text-[11px] font-mono text-slate-400">{p.CodigoEAN} · Stock: {p.StockAtual} · €{p.PVP?.toFixed(2)}</p>
                      </div>
                      <div className="ml-3 shrink-0 flex items-center gap-2">
                        {jaAdicionada && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            x{jaAdicionada.StockAtual}
                          </span>
                        )}
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Peças adicionadas */}
        {parts.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-700">Peças Instaladas ({parts.length})</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Total: €{parts.reduce((s, p) => s + (p.PVP ?? 0) * p.StockAtual, 0).toFixed(2)}
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {parts.map((part) => (
                <div
                  key={part.CodigoEAN}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900">{part.Nome}</div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {part.CodigoEAN} · €{part.PVP?.toFixed(2)} /un
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-sm">
                      x{part.StockAtual}
                    </span>
                    <button
                      onClick={() => onRemovePart(part.CodigoEAN)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-xl">
            <Barcode className="h-8 w-8 mx-auto mb-2 text-slate-200" />
            <p className="text-slate-400 font-medium text-sm">Nenhuma peça registada nesta intervenção</p>
          </div>
        )}
      </div>
    </div>
  );
}