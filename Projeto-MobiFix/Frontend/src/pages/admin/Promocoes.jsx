import { useState, useEffect } from "react";
import { Plus, Edit, Power, Trash2, FileDown, Tag, Sparkles, X, Loader2, AlertCircle, Package } from "lucide-react";
import { gerarPDFPromocao } from "../../utils/PDFPromocao";
import { usePromocoes, useCriarPromocao, useAtualizarPromocao, useAlterarEstadoPromocao, useEliminarPromocao } from "../../hooks/usePromocao";
import { usePecas } from "../../hooks/usePecas";

export default function Promotions() {
  const { data: apiPromocoes, isLoading, isError } = usePromocoes();
  const { data: apiPecas } = usePecas();

  const criarMutation = useCriarPromocao();
  const atualizarMutation = useAtualizarPromocao();
  const alterarEstadoMutation = useAlterarEstadoPromocao();
  const eliminarMutation = useEliminarPromocao();

  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    if (apiPromocoes) {
      const mappedPromos = apiPromocoes.map(p => ({
        id: p.PromocaoID.toString(),
        nome: p.Descricao,
        desconto: p.PercentagemDesconto,
        dataInicio: p.DataInicio.split('T')[0],
        dataFim: p.DataFim.split('T')[0],
        ativa: p.Ativa,
        pecas: p.PecasAplicaveisEANs || []
      }));
      setPromotions(mappedPromos);
    }
  }, [apiPromocoes]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    desconto: "",
    dataInicio: "",
    dataFim: "",
    pecasSelecionadas: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      atualizarMutation.mutate({
        id: editingId,
        dados: {
          Descricao: formData.nome,
          PercentagemDesconto: Number(formData.desconto),
          DataFim: formData.dataFim,
        }
      });
    } else {
      const maxId = promotions.length > 0
        ? Math.max(...promotions.map(p => Number(p.id)))
        : 0;
      criarMutation.mutate({
        PromocaoID: maxId + 1,
        Descricao: formData.nome,
        PercentagemDesconto: Number(formData.desconto),
        DataInicio: formData.dataInicio,
        DataFim: formData.dataFim,
        PecasAplicaveisEANs: formData.pecasSelecionadas,
      });
    }
    handleCancel();
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setFormData({
      nome: promo.nome,
      desconto: promo.desconto.toString(),
      dataInicio: promo.dataInicio,
      dataFim: promo.dataFim,
      pecasSelecionadas: promo.pecas || [],
    });
    setIsFormOpen(true);
  };

  const handleDelete = (promo) => {
    if (window.confirm("Deseja eliminar permanentemente esta campanha?")) {
      eliminarMutation.mutate(promo.id);
    }
  };

  const handleToggleEstado = (promo) => {
    const novoEstado = !promo.ativa;
    const msg = novoEstado ? "Deseja ativar esta campanha?" : "Deseja desativar esta campanha?";
    if (window.confirm(msg)) {
      alterarEstadoMutation.mutate({ id: promo.id, ativa: novoEstado });
    }
  };

  const handleExportPDF = (promo) => {
    const pecasPromo = (promo.pecas || [])
      .map(ean => apiPecas?.find(p => p.CodigoEAN === ean))
      .filter(Boolean);
    gerarPDFPromocao(promo, pecasPromo);
  };

  const handleCancel = () => {
    setFormData({ nome: "", desconto: "", dataInicio: "", dataFim: "", pecasSelecionadas: [] });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const togglePeca = (ean) => {
    setFormData(prev => ({
      ...prev,
      pecasSelecionadas: prev.pecasSelecionadas.includes(ean)
        ? prev.pecasSelecionadas.filter(e => e !== ean)
        : [...prev.pecasSelecionadas, ean]
    }));
  };

  const pecasDisponiveis = apiPecas?.filter(p => p.Ativo) || [];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
      <p className="text-slate-400 font-bold">A carregar campanhas...</p>
    </div>
  );

  if (isError) return (
    <div className="p-8 bg-red-900/20 border border-red-800/50 text-red-400 rounded-2xl flex items-center gap-3">
      <AlertCircle />
      <p className="font-bold">Erro ao carregar promoções da base de dados.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Marketing & Promoções</h1>
          <p className="text-lg font-medium text-slate-400">Gestão de campanhas da MobiFix</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Nova Promoção
          </button>
        )}
      </div>

      {/* Formulário */}
      {isFormOpen && (
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              {editingId ? "Editar Campanha" : "Nova Campanha"}
            </h2>
            <button onClick={handleCancel} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Nome</label>
                <input
                  type="text" required value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl focus:border-cyan-500 outline-none text-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Desconto (%)</label>
                <input
                  type="number" required min="1" max="100" value={formData.desconto}
                  onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl focus:border-cyan-500 outline-none text-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Início</label>
                <input
                  type="date" required value={formData.dataInicio}
                  disabled={!!editingId}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl focus:border-cyan-500 outline-none disabled:opacity-50 text-white transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Fim</label>
                <input
                  type="date" required value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl focus:border-cyan-500 outline-none text-white transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* Seleção de Peças */}
            {!editingId && (
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Peças em Campanha
                </label>
                {pecasDisponiveis.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhuma peça disponível.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1 pr-2 custom-scrollbar">
                    {pecasDisponiveis.map((peca) => {
                      const selected = formData.pecasSelecionadas.includes(peca.CodigoEAN);
                      return (
                        <button
                          key={peca.CodigoEAN}
                          type="button"
                          onClick={() => togglePeca(peca.CodigoEAN)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                              : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selected ? 'bg-cyan-500 border-cyan-500 text-slate-900' : 'border-slate-600'
                          }`}>
                            {selected && <span className="text-xs font-black">&#10003;</span>}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-bold truncate ${selected ? 'text-cyan-400' : 'text-slate-200'}`}>{peca.Nome}</p>
                            <p className="text-[10px] text-slate-500">{peca.CodigoEAN} &middot; {peca.PVP.toFixed(2)}€</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {formData.pecasSelecionadas.length > 0 && (
                  <p className="text-xs font-bold text-cyan-400">
                    {formData.pecasSelecionadas.length} peça(s) selecionada(s)
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-slate-700">
              <button
                type="submit"
                disabled={criarMutation.isPending || atualizarMutation.isPending}
                className="px-8 py-3 bg-cyan-600 text-white font-black rounded-xl hover:bg-cyan-500 disabled:opacity-50 transition-colors"
              >
                {(criarMutation.isPending || atualizarMutation.isPending) ? "A guardar..." : editingId ? "Atualizar" : "Lançar"}
              </button>
              <button type="button" onClick={handleCancel} className="px-8 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Promoções */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {promotions.length === 0 ? (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-700 rounded-3xl text-slate-500 font-bold">
            Sem campanhas registadas.
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className={`bg-slate-800 rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all ${!promo.ativa ? 'border-slate-700 opacity-60' : 'border-slate-600 hover:border-slate-500'}`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${promo.ativa ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    <Tag size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{promo.nome}</h3>
                    <span className={`inline-block mt-1 text-[9px] font-black uppercase px-2 py-1 rounded border ${promo.ativa ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {promo.ativa ? "● Ativa" : "○ Desativada"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleExportPDF(promo)} className="p-2 text-slate-400 hover:text-emerald-400 transition-colors" title="Exportar PDF"><FileDown size={18}/></button>
                  <button onClick={() => handleEdit(promo)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors" title="Editar"><Edit size={18}/></button>
                  <button
                    onClick={() => handleToggleEstado(promo)}
                    disabled={alterarEstadoMutation.isPending}
                    className={`p-2 transition-colors ${promo.ativa ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-emerald-400'}`}
                    title={promo.ativa ? "Desativar" : "Ativar"}
                  >
                    <Power size={18}/>
                  </button>
                  <button
                    onClick={() => handleDelete(promo)}
                    disabled={eliminarMutation.isPending}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400">Desconto</p>
                  <p className="text-xl font-black text-cyan-400">{promo.desconto}%</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400">Validade</p>
                  <p className="text-[11px] font-bold text-slate-300">{new Date(promo.dataInicio).toLocaleDateString()} - {new Date(promo.dataFim).toLocaleDateString()}</p>
                </div>
              </div>

              {promo.pecas && promo.pecas.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {promo.pecas.map(ean => {
                    const peca = apiPecas?.find(p => p.CodigoEAN === ean);
                    return (
                      <span key={ean} className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                        {peca ? peca.Nome : ean}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}