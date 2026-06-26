import { useState } from "react";
import { Wrench, Plus, Trash2, X, Loader2 } from "lucide-react";
import ClienteLayout from "./ClienteLayout";
import { useTrotinetes, useCriarTrotinete, useEliminarTrotinete } from "../../hooks/useTrotinetes";

const STATUS_CONFIG = {
  true:  { label: "Em Serviço",   color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", iconColor: "text-orange-500" },
  false: { label: "Disponível",   color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", iconColor: "text-slate-400" },
};

const FORM_EMPTY = { numeroSerie: "", marca: "", modelo: "" };

function ScooterIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      <path d="M5 17H3v-4l3-5h8l2 3h2a2 2 0 0 1 2 2v4h-2" />
      <path d="M11 8V5l-2-2" />
    </svg>
  );
}

export default function Trotinetes() {
  const { data: trotinetes = [], isLoading, isError } = useTrotinetes();
  const criarMutation = useCriarTrotinete();
  const eliminarMutation = useEliminarTrotinete();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(FORM_EMPTY);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    criarMutation.mutate(formData, {
      onSuccess: () => {
        setFormData(FORM_EMPTY);
        setIsFormOpen(false);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    eliminarMutation.mutate(confirmDelete, { onSuccess: () => setConfirmDelete(null) });
  };

  return (
    <ClienteLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Minhas Trotinetes</h1>
          <p className="text-sm text-slate-400">Gerencie as suas trotinetes e o estado de cada uma.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Registar Nova
        </button>
      </div>

      {isFormOpen && (
        <section className="bg-white rounded-2xl p-6 shadow-sm border-[1.5px] border-blue-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900">Nova Trotinete</h3>
            <button onClick={() => { setIsFormOpen(false); setFormData(FORM_EMPTY); }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Número de Série", key: "numeroSerie", placeholder: "XM2024-0001" },
              { label: "Marca", key: "marca", placeholder: "Xiaomi" },
              { label: "Modelo", key: "modelo", placeholder: "Mi Pro 4" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1.5 tracking-wider">{label}</label>
                <input
                  type="text"
                  required
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50 text-sm font-medium"
                />
              </div>
            ))}
            <div className="md:col-span-3 flex gap-2 pt-1">
              <button
                type="submit"
                disabled={criarMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-extrabold text-sm bg-slate-900 hover:bg-black transition-all disabled:opacity-50"
              >
                {criarMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {criarMutation.isPending ? "A registar..." : "Registar"}
              </button>
              <button type="button" onClick={() => { setIsFormOpen(false); setFormData(FORM_EMPTY); }} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200">
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium text-sm">A carregar trotinetes...</span>
        </div>
      )}

      {isError && (
        <div className="py-16 text-center text-red-500 font-bold text-sm">Erro ao carregar as trotinetes.</div>
      )}

      {!isLoading && !isError && trotinetes.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <ScooterIcon className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium text-sm">Ainda não tem nenhuma trotinete registada.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trotinetes.map((t) => {
          const config = STATUS_CONFIG[String(t.EmServico)] ?? STATUS_CONFIG["false"];
          return (
            <section
              key={t.NumeroSerie}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <ScooterIcon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{t.Marca} {t.Modelo}</h3>
                    <p className="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">{t.NumeroSerie}</p>
                  </div>
                </div>
                {!t.EmServico && (
                  <button
                    onClick={() => setConfirmDelete(t.NumeroSerie)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border inline-flex items-center"
                style={{ background: config.bg, color: config.color, borderColor: config.border }}
              >
                {config.label}
              </div>

              {t.EmServico && (
                <div className="flex items-center gap-2 py-2 px-3 mt-3 bg-orange-50 rounded-lg border border-orange-100">
                  <Wrench className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs text-orange-800 font-medium">Em serviço — não pode ser removida</span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Remover Trotinete?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Esta ação é permanente. A trotinete <span className="font-mono font-bold text-slate-700">{confirmDelete}</span> será removida da sua conta.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={eliminarMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-extrabold text-sm bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {eliminarMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {eliminarMutation.isPending ? "A remover..." : "Sim, remover"}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </ClienteLayout>
  );
}
