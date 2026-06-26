import { useState, useMemo } from "react";
import {
  Plus, Edit, Trash2, Wrench, Tag, Euro, Loader2,
  ArrowUp, ArrowDown, ArrowUpDown, AlertCircle, Info,
  X, Search, ShieldAlert,
} from "lucide-react";
import {
  useIntervencoesCatalogo,
  useCriarIntervencaoCatalogo,
  useAtualizarIntervencaoCatalogo,
  useEliminarIntervencaoCatalogo,
} from "../../hooks/useIntervencoesCatalogo";

/* ─── Especialidades disponíveis ─────────────────────────────────── */
const ESPECIALIDADES = [
  { value: "", label: "Todas" },
  { value: "MECANICA GERAL", label: "Mecânica Geral" },
  { value: "ELETRONICA", label: "Eletrónica" },
];

const ESPECIALIDADE_COLORS = {
  "MECANICA GERAL": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "ELETRONICA": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  OUTROS: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

/* ─── Estado inicial do formulário ───────────────────────────────── */
const FORM_EMPTY = {
  descricao: "",
  precoFixoMaoDeObra: "",
  especialidade: "",
};

/* ══════════════════════════════════════════════════════════════════ */
export default function IntervencoesCatalogoManagement() {
  /* Filtro de especialidade usado no query */
  const [filtroEsp, setFiltroEsp] = useState("");
  const [search, setSearch] = useState("");

  const { data: intervencoes = [], isLoading, isError } =
    useIntervencoesCatalogo(filtroEsp || undefined);

  const criarMutation    = useCriarIntervencaoCatalogo();
  const atualizarMutation = useAtualizarIntervencaoCatalogo();
  const eliminarMutation  = useEliminarIntervencaoCatalogo();

  /* ── Estado local ─────────────────────────────────────────────── */
  const [isFormOpen,    setIsFormOpen]    = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [formData,      setFormData]      = useState(FORM_EMPTY);
  const [selectedItem,  setSelectedItem]  = useState(null);   // modal de detalhes
  const [deleteTarget,  setDeleteTarget]  = useState(null);   // modal de confirmação
  const [sortConfig,    setSortConfig]    = useState({ key: "Descricao", direction: "asc" });

  const isPending =
    criarMutation.isPending ||
    atualizarMutation.isPending ||
    eliminarMutation.isPending;

  /* ── Handlers ─────────────────────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      descricao:          formData.descricao.trim(),
      precoFixoMaoDeObra: parseFloat(formData.precoFixoMaoDeObra),
      especialidade:      formData.especialidade || null,
    };

    if (editingId) {
      atualizarMutation.mutate(
        { id: editingId, dados: payload },
        { onSuccess: handleCancel }
      );
    } else {
      criarMutation.mutate(payload, { onSuccess: handleCancel });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.IntervencaoID);
    setFormData({
      descricao:          item.Descricao ?? "",
      precoFixoMaoDeObra: item.PrecoFixoMaoDeObra?.toString() ?? "",
      especialidade:      item.Especialidade ?? "",
    });
    setIsFormOpen(true);
    setSelectedItem(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    eliminarMutation.mutate(deleteTarget.IntervencaoID, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleCancel = () => {
    setFormData(FORM_EMPTY);
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* ── Dados processados ────────────────────────────────────────── */
  const filteredAndSorted = useMemo(() => {
    let items = [...intervencoes];

    // pesquisa por texto
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.Descricao?.toLowerCase().includes(q) ||
          i.Especialidade?.toLowerCase().includes(q)
      );
    }

    // ordenação
    items.sort((a, b) => {
      let aV = a[sortConfig.key] ?? "";
      let bV = b[sortConfig.key] ?? "";
      if (sortConfig.key === "PrecoFixoMaoDeObra") {
        aV = Number(aV);
        bV = Number(bV);
      } else if (typeof aV === "string") {
        aV = aV.toLowerCase();
        bV = bV.toLowerCase();
      }
      if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
      if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [intervencoes, search, sortConfig]);

  /* ── Estatísticas rápidas ─────────────────────────────────────── */
  const totalCount   = intervencoes.length;
  const avgPrice     = totalCount
    ? intervencoes.reduce((s, i) => s + (i.PrecoFixoMaoDeObra ?? 0), 0) / totalCount
    : 0;
  const espUnicas    = new Set(intervencoes.map((i) => i.Especialidade).filter(Boolean)).size;

  /* ── Helpers de UI ───────────────────────────────────────────── */
  const inputClass =
    "w-full px-4 py-3 rounded-xl border-2 border-slate-700 outline-none focus:border-cyan-500 bg-slate-900 transition-colors text-white";

  const field = (label, content) => (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-400">{label}</label>
      {content}
    </div>
  );

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp   className="w-3 h-3 text-cyan-400" />
      : <ArrowDown className="w-3 h-3 text-cyan-400" />;
  };

  const SortTh = ({ label, colKey }) => (
    <th
      className="px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors group select-none"
      onClick={() => handleSort(colKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        {renderSortIcon(colKey)}
      </div>
    </th>
  );

  const EspBadge = ({ esp }) => (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${
        ESPECIALIDADE_COLORS[esp] ?? ESPECIALIDADE_COLORS.OUTROS
      }`}
    >
      <Tag className="w-3 h-3" />
      {esp ?? "Geral"}
    </span>
  );

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">

      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Catálogo de Intervenções
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Gestão de serviços e preçário de mão de obra
          </p>
        </div>
        <button
          onClick={() => { handleCancel(); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all "
        >
          <Plus className="w-5 h-5" /> Nova Intervenção
        </button>
      </div>

      {/* ── Estatísticas ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total de Serviços",    value: totalCount,             icon: Wrench,       colors: "bg-cyan-500/20 text-cyan-400" },
          { label: "Especialidades",        value: espUnicas,              icon: Tag,          colors: "bg-purple-500/20 text-purple-400" },
          { label: "Preço Médio (M.O.)",   value: `${avgPrice.toFixed(2)}€`, icon: Euro,      colors: "bg-emerald-500/20 text-emerald-400" },
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

      {/* ── Filtros ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar por descrição ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-700 outline-none focus:border-cyan-500 bg-slate-900 transition-colors text-sm font-medium text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={filtroEsp}
          onChange={(e) => setFiltroEsp(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-slate-700 outline-none focus:border-cyan-500 bg-slate-900 text-sm font-bold transition-colors text-white"
        >
          {ESPECIALIDADES.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* ── Formulário Inline ─────────────────────────────────── */}
      {isFormOpen && (
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 animate-in slide-in-from-top-4">
          <h2 className="text-2xl font-black text-white mb-6">
            {editingId ? "Atualizar Intervenção" : "Registar Nova Intervenção"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {field("Descrição do Serviço",
              <input
                type="text"
                required
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Substituição de pastilhas de travão"
                className={"lg:col-span-2 " + inputClass}
              />
            )}

            {field("Especialidade",
              <select
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                className={inputClass}
              >
                <option value="">— Nenhuma —</option>
                {ESPECIALIDADES.filter((e) => e.value).map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            )}

            {field("Preço Mão de Obra (€)",
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precoFixoMaoDeObra}
                onChange={(e) => setFormData({ ...formData, precoFixoMaoDeObra: e.target.value })}
                placeholder="0.00"
                className={inputClass}
              />
            )}

            <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4 border-t border-slate-700 mt-2">
              <button
                type="submit"
                disabled={isPending}
                className={`flex items-center gap-2 px-8 py-3 text-white font-black rounded-xl active:scale-95 transition-all ${
                  isPending ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
                }`}
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Guardar Alterações" : "Adicionar ao Catálogo"}
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

      {/* ── Tabela ────────────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-cyan-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-bold">A carregar catálogo...</span>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 font-bold flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            Erro ao carregar o catálogo. Verifica a ligação à API.
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-bold">
            Nenhuma intervenção encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-900/50 border-b border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <SortTh label="Descrição"      colKey="Descricao" />
                  <SortTh label="Especialidade"  colKey="Especialidade" />
                  <SortTh label="Preço M.O."     colKey="PrecoFixoMaoDeObra" />
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredAndSorted.map((item) => (
                  <tr
                    key={item.IntervencaoID}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.Descricao}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">ID #{item.IntervencaoID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <EspBadge esp={item.Especialidade} />
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-white">
                      {Number(item.PrecoFixoMaoDeObra ?? 0).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal de Detalhes ─────────────────────────────────── */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Detalhes da Intervenção
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descrição</p>
                <p className="text-lg font-bold text-white">{selectedItem.Descricao}</p>
                <p className="text-xs font-mono text-slate-500 mt-1">ID #{selectedItem.IntervencaoID}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Preço Mão de Obra</p>
                  <p className="text-2xl font-black text-white">
                    {Number(selectedItem.PrecoFixoMaoDeObra ?? 0).toFixed(2)} <span className="text-slate-500 text-base">€</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Especialidade</p>
                  <EspBadge esp={selectedItem.Especialidade} />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center gap-3">
              <button
                onClick={() => { handleEdit(selectedItem); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-colors text-sm"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-slate-700 text-slate-200 font-bold rounded-xl hover:bg-slate-600 transition-colors text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmação de Eliminação ────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Eliminar Intervenção?</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Tem a certeza que pretende eliminar{" "}
                  <span className="font-bold text-slate-200">"{deleteTarget.Descricao}"</span>?
                  Esta ação é irreversível.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-3 justify-center">
              <button
                onClick={handleDelete}
                disabled={eliminarMutation.isPending}
                className={`flex items-center gap-2 px-6 py-2.5 text-white font-black rounded-xl transition-all active:scale-95 ${
                  eliminarMutation.isPending
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20"
                }`}
              >
                {eliminarMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Sim, eliminar
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-6 py-2.5 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}