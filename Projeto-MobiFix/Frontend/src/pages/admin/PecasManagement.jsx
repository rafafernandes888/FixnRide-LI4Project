import { useState, useMemo, useRef } from "react";
import { Plus, Edit, Box, Tags, DollarSign, Layers, Loader2, ArrowUp, ArrowDown, ArrowUpDown, AlertCircle, CheckCircle, XCircle, Info, X, Euro, ImageIcon, Upload, Trash2 } from "lucide-react";
import { usePecas, useCriarPeca, useAtualizarPeca, useAlterarEstadoPeca, useUploadImagemPeca, useEliminarImagemPeca } from "../../hooks/usePecas";
import { pecaService } from "../../services/pecaService";

const TIPOS_IMAGEM_ACEITES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024; // 5 MB

const CATEGORIA_COLORS = {
  BATERIAS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  TRAVOES: "bg-red-500/10 text-red-400 border-red-500/20",
  PNEUS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MOTOR: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  OUTROS: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const FORM_EMPTY = {
  ean: "",
  nome: "",
  categoria: "OUTROS",
  pvp: "",
  custoAquisicao: "",
  stockAtual: "",
  stockMinimo: "5",
  padraoReposicao: "5",
  descricao: "",
  ativo: true,
};

export default function PecasManagement() {
  const { data: pecas = [], isLoading, isError } = usePecas();
  const criarMutation = useCriarPeca();
  const atualizarMutation = useAtualizarPeca();
  const alterarEstadoMutation = useAlterarEstadoPeca();
  const uploadImagemMutation = useUploadImagemPeca();
  const eliminarImagemMutation = useEliminarImagemPeca();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEan, setEditingEan] = useState(null);
  const [formData, setFormData] = useState(FORM_EMPTY);
  const [selectedPeca, setSelectedPeca] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [imagemErro, setImagemErro] = useState(null);
  const [uploadingEan, setUploadingEan] = useState(null);
  const [imagemCacheBuster, setImagemCacheBuster] = useState({});
  const inputFicheiroRef = useRef(null);
  const inputLinhaRef = useRef(null);

  const [sortConfig, setSortConfig] = useState({ key: "Nome", direction: "asc" });

  const isPending = criarMutation.isPending || atualizarMutation.isPending || alterarEstadoMutation.isPending;

  const tocouImagem = (ean) => imagemCacheBuster[ean] ?? null;

  const validarFicheiroImagem = (file) => {
    if (!file) return "Nenhum ficheiro selecionado.";
    if (!TIPOS_IMAGEM_ACEITES.includes(file.type)) {
      return "Tipo não suportado. Use JPG, PNG, WEBP ou GIF.";
    }
    if (file.size > TAMANHO_MAX_IMAGEM) {
      return "A imagem excede o limite de 5 MB.";
    }
    return null;
  };

  const handleSelecionarImagemFormulario = (e) => {
    const file = e.target.files?.[0];
    setImagemErro(null);
    if (!file) {
      setImagemPreview(null);
      return;
    }
    const erro = validarFicheiroImagem(file);
    if (erro) {
      setImagemErro(erro);
      e.target.value = "";
      setImagemPreview(null);
      return;
    }
    if (!editingEan) {
      setImagemErro("Grave a peça primeiro para poder anexar uma imagem.");
      e.target.value = "";
      return;
    }
    setImagemPreview(URL.createObjectURL(file));
    uploadImagemMutation.mutate(
      { ean: editingEan, file },
      {
        onSuccess: () => {
          setImagemCacheBuster(prev => ({ ...prev, [editingEan]: Date.now() }));
          setImagemErro(null);
        },
        onError: (err) => {
          setImagemErro(err?.response?.data?.error || "Falha ao carregar imagem.");
          setImagemPreview(null);
        },
      }
    );
    e.target.value = "";
  };

  const handleEliminarImagemFormulario = () => {
    if (!editingEan) return;
    eliminarImagemMutation.mutate(editingEan, {
      onSuccess: () => {
        setImagemPreview(null);
        setImagemCacheBuster(prev => ({ ...prev, [editingEan]: Date.now() }));
      },
    });
  };

  const handleUploadLinha = (peca, file) => {
    setImagemErro(null);
    const erro = validarFicheiroImagem(file);
    if (erro) {
      alert(erro);
      return;
    }
    setUploadingEan(peca.CodigoEAN);
    uploadImagemMutation.mutate(
      { ean: peca.CodigoEAN, file },
      {
        onSettled: () => setUploadingEan(null),
        onSuccess: () => {
          setImagemCacheBuster(prev => ({ ...prev, [peca.CodigoEAN]: Date.now() }));
        },
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const stockMinimoParsed = parseInt(formData.stockMinimo, 10);
    const padraoReposicaoParsed = parseInt(formData.padraoReposicao, 10);
    const payload = {
        CodigoEAN: formData.ean,
        Nome: formData.nome,
        Categoria: formData.categoria,
        PVP: parseFloat(formData.pvp),
        CustoAquisicao: parseFloat(formData.custoAquisicao),
        StockAtual: parseInt(formData.stockAtual, 10),
        Descricao: formData.descricao,
        Ativo: formData.ativo,
        StockMinimo: Number.isFinite(stockMinimoParsed) ? stockMinimoParsed : 5,
        PadraoReposicao: Number.isFinite(padraoReposicaoParsed) ? padraoReposicaoParsed : 5,
        Imagem: ""
    };

    if (editingEan) {
      atualizarMutation.mutate(
        { ean: editingEan, dados: payload },
        { onSuccess: handleCancel }
      );
    } else {
      criarMutation.mutate(payload, { onSuccess: handleCancel });
    }
  };

  const handleEdit = (peca) => {
    setEditingEan(peca.CodigoEAN);
    setFormData({
      ean: peca.CodigoEAN,
      nome: peca.Nome,
      categoria: peca.Categoria,
      pvp: peca.PVP?.toString() || "",
      custoAquisicao: peca.CustoAquisicao?.toString() || "",
      stockAtual: peca.StockAtual?.toString() || "",
      stockMinimo: (peca.StockMinimo ?? 5).toString(),
      padraoReposicao: (peca.PadraoReposicao ?? 5).toString(),
      descricao: peca.Descricao ?? "",
      ativo: peca.Ativo !== false,
    });
    setImagemPreview(null);
    setImagemErro(null);
    setIsFormOpen(true);
  };

 const handleToggleAtivo = (peca) => {
    // Toggle apenas o estado — não tocar nos restantes campos (evita corromper imagem ao desativar)
    alterarEstadoMutation.mutate({ ean: peca.CodigoEAN, ativo: !peca.Ativo });
  };

  const handleCancel = () => {
    setFormData(FORM_EMPTY);
    setIsFormOpen(false);
    setEditingEan(null);
    setImagemPreview(null);
    setImagemErro(null);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPecas = useMemo(() => {
    let sortableItems = [...pecas];
    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      if (sortConfig.key === "PVP" || sortConfig.key === "StockAtual") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } 
      else if (sortConfig.key === "Ativo") {
         aValue = aValue ? 1 : 0;
         bValue = bValue ? 1 : 0;
      }
      else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [pecas, sortConfig]);

  const field = (label, content) => (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-400">{label}</label>
      {content}
    </div>
  );

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 outline-none focus:border-cyan-500 text-white transition-colors";

  const renderSortableHeader = (label, columnKey) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <th 
        className="px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors group select-none"
        onClick={() => handleSort(columnKey)}
      >
        <div className="flex items-center gap-2">
          {label}
          {isActive ? (
            sortConfig.direction === "asc" ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </th>
    );
  };

  const pecasAtivas = pecas.filter(p => p.Ativo !== false);
  const totalPecas = pecas.length;
  const pecasSemStock = pecasAtivas.filter(p => p.StockAtual === 0).length;
  const valorEmStock = pecasAtivas.reduce((acc, curr) => acc + (curr.PVP * curr.StockAtual), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <input
        type="file"
        ref={inputLinhaRef}
        accept={TIPOS_IMAGEM_ACEITES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const ean = inputLinhaRef.current?.getAttribute('data-ean');
          e.target.value = "";
          if (file && ean) {
            const peca = pecas.find(p => p.CodigoEAN === ean);
            if (peca) handleUploadLinha(peca, file);
          }
        }}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Catálogo de Peças</h1>
          <p className="text-lg font-medium text-slate-400">Gestão de inventário e preçário</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Nova Peça
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total de Referências", value: totalPecas, icon: Box, colors: "bg-cyan-500/20 text-cyan-400" },
          { label: "Ativas Sem Stock", value: pecasSemStock, icon: AlertCircle, colors: pecasSemStock > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400" },
          { label: "Valor em Armazém (Ativo)", value: `${valorEmStock.toFixed(2)}€`, icon: DollarSign, colors: "bg-purple-500/20 text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.colors.split(' ')[0]}`}>
                <stat.icon className={`w-7 h-7 ${stat.colors.split(' ')[1]}`} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 animate-in slide-in-from-top-4">
          <h2 className="text-2xl font-black text-white mb-6">
            {editingEan ? "Atualizar Peça" : "Registar Nova Peça"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {!editingEan && field("Código EAN / Referência",
              <input
                type="text"
                required
                value={formData.ean}
                onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
                placeholder="Ex: EAN590123"
                className={inputClass}
              />
            )}

            {field("Nome da Peça",
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Pastilhas de Travão"
                className={editingEan ? "md:col-span-2 lg:col-span-1 " + inputClass : inputClass}
              />
            )}

            {field("Categoria",
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className={inputClass}
              >
                <option value="BATERIAS">Baterias</option>
                <option value="TRAVOES">Travões</option>
                <option value="PNEUS">Pneus</option>
                <option value="MOTOR">Motor & Transmissão</option>
                <option value="OUTROS">Outros Componentes</option>
              </select>
            )}

            {field("Preço Venda (€)",
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.pvp}
                onChange={(e) => setFormData({ ...formData, pvp: e.target.value })}
                placeholder="0.00"
                className={inputClass}
              />
            )}

            {field("Custo de Aquisição (€)",
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.custoAquisicao}
                onChange={(e) => setFormData({ ...formData, custoAquisicao: e.target.value })}
                placeholder="0.00"
                className={inputClass}
              />
            )}

            {field("Stock Atual",
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.stockAtual}
                onChange={(e) => setFormData({ ...formData, stockAtual: e.target.value })}
                placeholder="Quantidade"
                className={inputClass}
              />
            )}

            {field("Stock Mínimo",
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                placeholder="Limiar para reposição"
                className={inputClass}
              />
            )}

            {field("Padrão de Reposição",
              <input
                type="number"
                min="1"
                step="1"
                required
                value={formData.padraoReposicao}
                onChange={(e) => setFormData({ ...formData, padraoReposicao: e.target.value })}
                placeholder="Qtd. a encomendar"
                className={inputClass}
              />
            )}

            {editingEan && (
              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-black uppercase text-slate-400">Estado no Catálogo</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 h-[52px] transition-colors">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="ativo" className="text-sm font-bold text-slate-300 cursor-pointer">
                    Peça disponível
                  </label>
                </div>
              </div>
            )}

            <div className="md:col-span-2 lg:col-span-3">
              {field("Descrição (Opcional)",
                <textarea
                  rows="2"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Detalhes técnicos, compatibilidades..."
                  className={inputClass + " resize-none"}
                />
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-xs font-black uppercase text-slate-400 block mb-2">Imagem da Peça</label>
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900">
                <div className="w-24 h-24 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {editingEan && pecas.find(p => p.CodigoEAN === editingEan)?.Imagem ? (
                    <img
                      src={imagemPreview ?? pecaService.urlImagem(editingEan, tocouImagem(editingEan))}
                      alt="Pré-visualização"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : imagemPreview ? (
                    <img src={imagemPreview} alt="Pré-visualização" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={inputFicheiroRef}
                    accept={TIPOS_IMAGEM_ACEITES.join(',')}
                    onChange={handleSelecionarImagemFormulario}
                    className="hidden"
                  />
                  {!editingEan ? (
                    <p className="text-xs text-slate-400 font-medium">
                      Guarde a peça primeiro. Depois poderá anexar uma imagem ao editá-la.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => inputFicheiroRef.current?.click()}
                        disabled={uploadImagemMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs disabled:opacity-50"
                      >
                        {uploadImagemMutation.isPending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Upload className="w-4 h-4" />}
                        {uploadImagemMutation.isPending ? "A carregar..." : "Carregar Imagem"}
                      </button>
                      {pecas.find(p => p.CodigoEAN === editingEan)?.Imagem && (
                        <button
                          type="button"
                          onClick={handleEliminarImagemFormulario}
                          disabled={eliminarImagemMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold text-xs disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" /> Remover
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 font-medium">
                    JPG, PNG, WEBP ou GIF · máximo 5 MB.
                  </p>
                  {imagemErro && (
                    <p className="text-[11px] text-red-400 font-bold">{imagemErro}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4 border-t border-slate-700 mt-2">
              <button
                type="submit"
                disabled={isPending}
                className={`flex items-center gap-2 px-8 py-3 text-white font-black rounded-xl active:scale-95 transition-all ${
                  isPending ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
                }`}
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingEan ? "Guardar Alterações" : "Adicionar ao Catálogo"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-cyan-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-bold">A carregar catálogo...</span>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 font-bold">
            Erro ao carregar o catálogo. Verifica a ligação à API.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-900/50 border-b border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  {renderSortableHeader("Peça", "Nome")}
                  {renderSortableHeader("Categoria", "Categoria")}
                  {renderSortableHeader("Preço Unitário", "PVP")}
                  {renderSortableHeader("Disponibilidade", "StockAtual")}
                  {renderSortableHeader("Status", "Ativo")}
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedPecas.map((peca) => {
                  const isAtivo = peca.Ativo !== false; 
                  
                  return (
                    <tr 
                      key={peca.CodigoEAN} 
                      onClick={() => setSelectedPeca(peca)}
                      className={`hover:bg-slate-700/50 transition-colors cursor-pointer ${!isAtivo ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 shadow-sm border overflow-hidden ${isAtivo ? 'bg-slate-900 border-slate-700' : 'bg-slate-800 border-slate-700'}`}>
                            {peca.Imagem ? (
                              <img
                                src={pecaService.urlImagem(peca.CodigoEAN, tocouImagem(peca.CodigoEAN))}
                                alt={peca.Nome}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement('span'), { className: 'text-slate-500 text-[10px] font-bold', textContent: 'N/D' })); }}
                              />
                            ) : (
                              <Box className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">{peca.Nome}</div>
                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Tags className="w-3 h-3" /> {peca.CodigoEAN}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${CATEGORIA_COLORS[peca.Categoria] ?? CATEGORIA_COLORS.OUTROS}`}>
                          <Layers className="w-3 h-3" />
                          {peca.Categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">
                        {Number(peca.PVP).toFixed(2)} €
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-black ${peca.StockAtual > 5 ? 'text-emerald-400' : peca.StockAtual > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                            {peca.StockAtual} un.
                          </span>
                          {peca.StockAtual === 0 && isAtivo && <span className="text-[10px] text-red-400 font-bold uppercase">Esgotado</span>}
                          {peca.StockAtual > 0 && peca.StockAtual <= 5 && isAtivo && <span className="text-[10px] text-amber-500 font-bold uppercase">Baixo Stock</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${isAtivo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                          {isAtivo ? "● Ativo" : "○ Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              inputLinhaRef.current?.setAttribute('data-ean', peca.CodigoEAN);
                              inputLinhaRef.current?.click();
                            }}
                            disabled={uploadImagemMutation.isPending && uploadingEan === peca.CodigoEAN}
                            className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all disabled:opacity-50"
                            title={peca.Imagem ? "Substituir imagem" : "Carregar imagem"}
                          >
                            {uploadImagemMutation.isPending && uploadingEan === peca.CodigoEAN
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <ImageIcon className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(peca); }}
                            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                            title="Editar Peça"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleAtivo(peca); }}
                            disabled={alterarEstadoMutation.isPending}
                            className={`p-2 rounded-lg transition-all ${
                              isAtivo
                                ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                            title={isAtivo ? "Desativar Peça" : "Ativar Peça"}
                          >
                            {isAtivo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Peça */}
      {selectedPeca && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Detalhes da Peça
              </h3>
              <button 
                onClick={() => setSelectedPeca(null)} 
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {selectedPeca.Imagem && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
                  <img
                    src={pecaService.urlImagem(selectedPeca.CodigoEAN, tocouImagem(selectedPeca.CodigoEAN))}
                    alt={selectedPeca.Nome}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">

                <div className="col-span-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nome da Peça</p>
                  <p className="text-lg font-bold text-white">{selectedPeca.Nome}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm font-mono font-bold text-slate-400">EAN: {selectedPeca.CodigoEAN}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border ${selectedPeca.Ativo !== false ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {selectedPeca.Ativo !== false ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Preço Venda (PVP)</p>
                  <p className="text-2xl font-black text-white">
                    {Number(selectedPeca.PVP).toFixed(2)} <Euro className="w-4 h-4 inline text-slate-500 -mt-1" />
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Custo Aquisição</p>
                  <p className="text-2xl font-black text-slate-400">
                    {Number(selectedPeca.CustoAquisicao ?? 0).toFixed(2)} <Euro className="w-4 h-4 inline text-slate-500 -mt-1" />
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock Atual</p>
                  <p className={`text-2xl font-black font-mono ${selectedPeca.StockAtual > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {selectedPeca.StockAtual} un.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock Mínimo</p>
                  <p className="text-2xl font-black font-mono text-slate-300">
                    {selectedPeca.StockMinimo ?? 5} un.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Padrão Reposição</p>
                  <p className="text-2xl font-black font-mono text-slate-300">
                    {selectedPeca.PadraoReposicao ?? 5} un.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Categoria</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 mt-1 rounded-full text-xs font-black border ${CATEGORIA_COLORS[selectedPeca.Categoria] ?? CATEGORIA_COLORS.OUTROS}`}>
                    {selectedPeca.Categoria}
                  </span>
                </div>

                {selectedPeca.Descricao && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descrição</p>
                    <p className="text-sm font-medium text-slate-300 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                      {selectedPeca.Descricao}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
               <button 
                 onClick={() => setSelectedPeca(null)} 
                 className="px-6 py-2.5 bg-slate-700 text-slate-200 font-bold rounded-xl hover:bg-slate-600 transition-colors"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}