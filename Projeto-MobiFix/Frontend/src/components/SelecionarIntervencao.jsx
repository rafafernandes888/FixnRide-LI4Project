import { useState, useMemo } from 'react';
import { ClipboardList, Plus, X, Search, Loader2, Euro, Wrench } from 'lucide-react';
import { useIntervencoesCatalogo } from '../hooks/useIntervencoesCatalogo';

export function InterventionSelector({ selectedInterventions, onAddIntervention, onRemoveIntervention }) {
  const [searchTerm, setSearchTerm]          = useState('');
  const [selectedEspecialidade, setSelected] = useState('Todas');
  const [showCatalog, setShowCatalog]        = useState(false);

  const { data: catalogo = [], isLoading } = useIntervencoesCatalogo();

  // Especialidades únicas extraídas da API — substitui o mockData categories
  const especialidades = useMemo(() => {
    const uniq = [...new Set(catalogo.map(i => i.Especialidade).filter(Boolean))];
    return ['Todas', ...uniq.sort()];
  }, [catalogo]);

  const filtered = useMemo(() => catalogo.filter(i => {
    const matchSearch = i.Descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEsp    = selectedEspecialidade === 'Todas' || i.Especialidade === selectedEspecialidade;
    const notSelected = !selectedInterventions.find(s => s.IntervencaoID === i.IntervencaoID);
    return matchSearch && matchEsp && notSelected;
  }), [catalogo, searchTerm, selectedEspecialidade, selectedInterventions]);

  const totalMaoDeObra = selectedInterventions.reduce((sum, i) => sum + (i.PrecoFixoMaoDeObra ?? 0), 0);

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900">Intervenções Selecionadas</h3>
        </div>
        <button
          onClick={() => setShowCatalog(!showCatalog)}
          className="flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Adicionar Intervenção
        </button>
      </div>

      {/* Intervenções já selecionadas */}
      {selectedInterventions.length > 0 ? (
        <div className="mb-4 space-y-3">
          {selectedInterventions.map((i) => (
            <div
              key={i.IntervencaoID}
              className="flex items-center justify-between rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50 p-4"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-3">
                  <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs text-white">
                    #{i.IntervencaoID}
                  </span>
                  <span className="text-base font-bold text-slate-900">{i.Descricao}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {i.Especialidade && (
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5" /> {i.Especialidade}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Euro className="h-3.5 w-3.5" /> {i.PrecoFixoMaoDeObra?.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemoveIntervention(i.IntervencaoID)}
                className="ml-4 flex h-9 w-9 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between border-t-2 border-slate-200 pt-4">
            <span className="font-semibold text-slate-700">Mão de Obra Total:</span>
            <span className="rounded-full bg-emerald-600 px-4 py-2 text-lg font-bold text-white">
              €{totalMaoDeObra.toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 text-slate-400">
          <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
          <p>Nenhuma intervenção selecionada</p>
        </div>
      )}

      {/* Catálogo expansível */}
      {showCatalog && (
        <div className="mt-4 rounded-lg border-2 border-blue-200 bg-slate-50 p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900">Catálogo de Intervenções</h4>
            <button onClick={() => setShowCatalog(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar intervenção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filtros de especialidade vindos da API */}
          <div className="mb-3 flex flex-wrap gap-2">
            {especialidades.map((esp) => (
              <button
                key={esp}
                onClick={() => setSelected(esp)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  selectedEspecialidade === esp
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {esp}
              </button>
            ))}
          </div>

          <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">A carregar catálogo...</span>
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Nenhuma intervenção encontrada.</p>
            ) : (
              filtered.map((i) => (
                <div
                  key={i.IntervencaoID}
                  onClick={() => onAddIntervention(i)}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-blue-400 hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500 shrink-0">
                        #{i.IntervencaoID}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">{i.Descricao}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {i.Especialidade && <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{i.Especialidade}</span>}
                      <span className="font-bold text-emerald-600">€{i.PrecoFixoMaoDeObra?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}