import { Search, ShoppingCart, Loader2, AlertCircle, Plus, Minus, Trash2, X, CheckCircle2, Package } from "lucide-react";
import { useState, useMemo } from "react";
import ClienteLayout from "./ClienteLayout";
import { usePecas } from "../../hooks/usePecas";
import { useCriarReserva } from "../../hooks/useEncomendaCliente";

const categories = ["Todas", "Eletronica", "Travagem", "Pneu"];

export default function Catalogo() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [reservaConcluida, setReservaConcluida] = useState(false);

  const { data: pecas, isLoading, isError } = usePecas();
  const criarReservaMutation = useCriarReserva();

  const filteredProducts = useMemo(() => {
    if (!pecas) return [];
    return pecas.filter((p) => {
      const matchesCategory = activeFilter === "Todas" || p.Categoria?.toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch = p.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) || p.CodigoEAN?.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [pecas, activeFilter, searchTerm]);

  const totalItens = carrinho.reduce((sum, i) => sum + i.quantidade, 0);
  const totalPreco = carrinho.reduce((sum, i) => sum + i.peca.PVP * i.quantidade, 0);

  const adicionarAoCarrinho = (peca) => {
    setCarrinho(prev => {
      const existente = prev.find(i => i.peca.CodigoEAN === peca.CodigoEAN);
      if (existente) {
        return prev.map(i => i.peca.CodigoEAN === peca.CodigoEAN ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { peca, quantidade: 1 }];
    });
  };

  const alterarQuantidade = (ean, delta) => {
    setCarrinho(prev =>
      prev.map(i => i.peca.CodigoEAN === ean ? { ...i, quantidade: i.quantidade + delta } : i).filter(i => i.quantidade > 0)
    );
  };

  const removerDoCarrinho = (ean) => setCarrinho(prev => prev.filter(i => i.peca.CodigoEAN !== ean));
  const quantidadeNoCarrinho = (ean) => carrinho.find(i => i.peca.CodigoEAN === ean)?.quantidade ?? 0;

  const handleConfirmarReserva = () => {
    const itens = carrinho.map(i => ({
      pecaEAN: i.peca.CodigoEAN,
      quantidade: i.quantidade,
      precoUnitario: i.peca.PVP,
    }));
    criarReservaMutation.mutate(itens, {
      onSuccess: () => {
        setCarrinho([]);
        setCarrinhoAberto(false);
        setReservaConcluida(true);
        setTimeout(() => setReservaConcluida(false), 4000);
      },
    });
  };

  if (isLoading) {
    return (
      <ClienteLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
          <p className="text-slate-500 font-medium">A carregar catálogo...</p>
        </div>
      </ClienteLayout>
    );
  }

  if (isError) {
    return (
      <ClienteLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-900">Erro ao carregar peças</h2>
          <p className="text-slate-500">Verifique a sua ligação ou se o servidor está online.</p>
        </div>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Catálogo de Peças</h1>
          <p className="text-sm text-slate-400">Reserve peças para levantar na loja MobiFix · Pagamento no balcão.</p>
        </div>
        <button
          onClick={() => setCarrinhoAberto(true)}
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg hover:bg-black transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          Reserva ({totalItens})
          {totalItens > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
              {totalItens}
            </span>
          )}
        </button>
      </div>

      {reservaConcluida && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">Reserva confirmada! Levante na loja.</span>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar produto ou EAN..."
            className="w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-5 pl-11 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveFilter(c)}
              className={`text-xs px-4 py-2 rounded-xl font-bold border-[1.5px] whitespace-nowrap transition-all ${
                activeFilter === c
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? filteredProducts.map((p) => {
          const qtd = quantidadeNoCarrinho(p.CodigoEAN);
          const esgotado = p.StockAtual <= 0;
          return (
            <article key={p.CodigoEAN} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={`../../../${p.Imagem}`}
                  alt={p.Nome}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.target.src = "https://placehold.co/400x300?text=Peca"; }}
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {p.Categoria || "Geral"}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">{p.CodigoEAN}</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight mb-1">{p.Nome}</h2>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{p.Descricao}</p>
                <div className="mt-auto">
                  <div className="flex justify-between items-baseline mb-3">
                    <p className="text-lg font-extrabold text-blue-600">€{p.PVP?.toFixed(2)}</p>
                    <p className={`text-[10px] font-bold ${esgotado ? 'text-red-500' : p.StockAtual <= 3 ? 'text-orange-500' : 'text-slate-400'}`}>
                      {esgotado ? 'Esgotado' : `Stock: ${p.StockAtual}`}
                    </p>
                  </div>
                  {esgotado ? (
                    <button disabled className="w-full rounded-xl py-2.5 text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed">
                      Indisponível
                    </button>
                  ) : qtd === 0 ? (
                    <button
                      onClick={() => adicionarAoCarrinho(p)}
                      className="w-full rounded-xl py-2.5 text-xs font-bold bg-slate-900 text-white hover:bg-black transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Reservar
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-2 py-1">
                      <button onClick={() => alterarQuantidade(p.CodigoEAN, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-blue-200 text-blue-600 font-extrabold">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-extrabold text-blue-700 text-sm">{qtd}</span>
                      <button
                        onClick={() => alterarQuantidade(p.CodigoEAN, +1)}
                        disabled={qtd >= p.StockAtual}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="col-span-full text-center py-16 text-slate-400 font-medium">
            <Package className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            Nenhuma peça encontrada com estes critérios.
          </div>
        )}
      </section>

      {/* Cart drawer */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCarrinhoAberto(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">A sua reserva</h3>
                <p className="text-xs text-slate-400 font-medium">Pagamento no balcão ao levantar</p>
              </div>
              <button onClick={() => setCarrinhoAberto(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {carrinho.length === 0 ? (
                <p className="text-center text-slate-300 font-bold py-8">O carrinho está vazio.</p>
              ) : carrinho.map(({ peca, quantidade }) => (
                <div key={peca.CodigoEAN} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    <img src={`../../../${peca.Imagem}`} alt={peca.Nome} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/48x48?text=?"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{peca.Nome}</p>
                    <p className="text-xs text-slate-400">€{peca.PVP?.toFixed(2)} × {quantidade}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 rounded-lg">
                      <button onClick={() => alterarQuantidade(peca.CodigoEAN, -1)} className="w-7 h-7 flex items-center justify-center"><Minus className="w-3 h-3 text-slate-600" /></button>
                      <span className="px-1 font-extrabold text-sm text-slate-900">{quantidade}</span>
                      <button onClick={() => alterarQuantidade(peca.CodigoEAN, +1)} disabled={quantidade >= peca.StockAtual} className="w-7 h-7 flex items-center justify-center disabled:opacity-30"><Plus className="w-3 h-3 text-slate-600" /></button>
                    </div>
                    <button onClick={() => removerDoCarrinho(peca.CodigoEAN)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            {carrinho.length > 0 && (
              <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">Total estimado</span>
                  <span className="font-extrabold text-2xl text-blue-700 font-mono">€{totalPreco.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleConfirmarReserva}
                  disabled={criarReservaMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-extrabold text-sm bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all"
                >
                  {criarReservaMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {criarReservaMutation.isPending ? "A confirmar..." : "Confirmar Reserva"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ClienteLayout>
  );
}
