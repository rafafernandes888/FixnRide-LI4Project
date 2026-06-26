import { useState, useMemo } from "react";
import { Plus, Edit, UserX, UserCheck, Shield, User, Mail, Phone, Wrench, Loader2, ArrowUp, ArrowDown, ArrowUpDown, Info, X } from "lucide-react";
import { useFuncionarios, useCriarFuncionario, useAtualizarFuncionario } from "../../hooks/useFuncionarios";

const CARGO_LABELS = {
  ADMINISTRADOR: "Administrador",
  MECANICO: "Mecânico",
  OPERADOR: "Operador de Loja",
};

const CARGO_COLORS = {
  ADMINISTRADOR: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  MECANICO: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  OPERADOR: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const FORM_EMPTY = {
  numeroMecanografico: "",
  nome: "",
  email: "",
  contacto: "",
  cargo: "MECANICO",
  especialidade: "",
  password: "",
  ativo: true,
};

export default function UserManagement() {
  const { data: funcionarios = [], isLoading, isError } = useFuncionarios();
  const criarMutation = useCriarFuncionario();
  const atualizarMutation = useAtualizarFuncionario();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNumero, setEditingNumero] = useState(null);
  const [formData, setFormData] = useState(FORM_EMPTY);
  
  // Novo estado para controlar o modal de detalhes
  const [selectedFunc, setSelectedFunc] = useState(null);
  
  // Estado para controlo da ordenação (Standard = Nome asc)
  const [sortConfig, setSortConfig] = useState({ key: "Nome", direction: "asc" });

  const isPending = criarMutation.isPending || atualizarMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingNumero) {
      atualizarMutation.mutate(
        { numeroMecanografico: editingNumero, dados: formData },
        { onSuccess: handleCancel }
      );
    } else {
      criarMutation.mutate(formData, { onSuccess: handleCancel });
    }
  };

  const handleEdit = (func) => {
    setEditingNumero(func.NumeroMecanografico);
    setFormData({
      numeroMecanografico: func.NumeroMecanografico,
      nome: func.Nome,
      email: func.Email,
      contacto: func.Contacto,
      cargo: func.Cargo,
      especialidade: func.Especialidade ?? "",
      password: "",
      ativo: func.Ativo,
    });
    setIsFormOpen(true);
  };

  const handleToggleAtivo = (func) => {
    atualizarMutation.mutate({
      numeroMecanografico: func.NumeroMecanografico,
      dados: {
        nome: func.Nome,
        email: func.Email,
        contacto: func.Contacto,
        cargo: func.Cargo,
        especialidade: func.Especialidade ?? "",
        ativo: !func.Ativo,
      },
    });
  };

  const handleCancel = () => {
    setFormData(FORM_EMPTY);
    setIsFormOpen(false);
    setEditingNumero(null);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedFuncionarios = useMemo(() => {
    let sortableItems = [...funcionarios];
    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      if (sortConfig.key === "Ativo") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [funcionarios, sortConfig]);

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
            sortConfig.direction === "asc" ? (
              <ArrowUp className="w-3 h-3 text-cyan-400" />
            ) : (
              <ArrowDown className="w-3 h-3 text-cyan-400" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Equipa MobiFix</h1>
          <p className="text-lg font-medium text-slate-400">Gestão de colaboradores e permissões de acesso</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Adicionar Funcionário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total", value: funcionarios.length, icon: User, colors: "bg-cyan-500/20 text-cyan-400" },
          { label: "Ativos", value: funcionarios.filter((f) => f.Ativo).length, icon: UserCheck, colors: "bg-emerald-500/20 text-emerald-400" },
          { label: "Inativos", value: funcionarios.filter((f) => !f.Ativo).length, icon: UserX, colors: "bg-red-500/20 text-red-400" },
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

      {/* Form */}
      {isFormOpen && (
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 animate-in slide-in-from-top-4">
          <h2 className="text-2xl font-black text-white mb-6">
            {editingNumero ? "Atualizar Colaborador" : "Registar Colaborador"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {!editingNumero && field("Número Mecanográfico",
              <input
                type="text"
                required
                value={formData.numeroMecanografico}
                onChange={(e) => setFormData({ ...formData, numeroMecanografico: e.target.value })}
                placeholder="MECA001"
                className={inputClass}
              />
            )}

            {field("Nome Completo",
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={inputClass}
              />
            )}

            {field("Email Profissional",
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
              />
            )}

            {field("Contacto",
              <input
                type="tel"
                required
                maxLength={9}
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value.replace(/\D/g, "") })}
                placeholder="910000000"
                className={inputClass}
              />
            )}

            {field("Cargo",
              <select
                value={formData.cargo}
                onChange={(e) => {
                  const novoCargo = e.target.value;
                  setFormData({ 
                    ...formData, 
                    cargo: novoCargo,
                    // Se mudar para algo que não seja MECANICO, limpa a especialidade
                    especialidade: novoCargo === "MECANICO" ? formData.especialidade : "" 
                  });
                }}
                className={inputClass}
              >
                <option value="MECANICO">Mecânico</option>
                <option value="OPERADOR">Operador de Loja</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            )} 

            {formData.cargo === "MECANICO" && field("Especialidade (opcional)",
              <input
                type="text"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                placeholder="ex: Baterias, Travões..."
                className={inputClass}
              />
            )}

            {!editingNumero && field("Password",
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className={inputClass}
              />
            )}

            {editingNumero && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Estado</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="ativo" className="text-sm font-bold text-slate-300 cursor-pointer">
                    Colaborador ativo
                  </label>
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex gap-3 pt-4 border-t border-slate-700 mt-2">
              <button
                type="submit"
                disabled={isPending}
                className={`flex items-center gap-2 px-8 py-3 text-white font-black rounded-xl active:scale-95 transition-all ${
                  isPending ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
                }`}
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingNumero ? "Guardar Alterações" : "Registar Colaborador"}
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

      {/* Table */}
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-cyan-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-bold">A carregar colaboradores...</span>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400 font-bold">
            Erro ao carregar funcionários. Verifica a ligação à API.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 border-b border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  {renderSortableHeader("Funcionário", "Nome")}
                  {renderSortableHeader("Cargo", "Cargo")}
                  <th className="px-6 py-4">Contacto</th>
                  {renderSortableHeader("Especialidade", "Especialidade")}
                  {renderSortableHeader("Status", "Ativo")}
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedFuncionarios.map((func) => (
                  <tr 
                    key={func.NumeroMecanografico} 
                    onClick={() => setSelectedFunc(func)}
                    className={`hover:bg-slate-700/50 transition-colors cursor-pointer ${!func.Ativo ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-900 font-black text-xs uppercase shadow-md">
                          {func.Nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{func.Nome}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {func.Email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${CARGO_COLORS[func.Cargo] ?? "bg-slate-800 text-slate-400 border-slate-600"}`}>
                        {func.Cargo === "ADMINISTRADOR" && <Shield className="w-3 h-3" />}
                        {CARGO_LABELS[func.Cargo] ?? func.Cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" /> {func.Contacto}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {func.Especialidade ? (
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-slate-500" /> {func.Especialidade}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${func.Ativo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                        {func.Ativo ? "● Ativo" : "○ Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(func); }}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="Editar Colaborador"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleAtivo(func); }}
                          disabled={atualizarMutation.isPending}
                          className={`p-2 rounded-lg transition-all ${
                            func.Ativo
                              ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                              : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                          title={func.Ativo ? "Desativar Colaborador" : "Ativar Colaborador"}
                        >
                          {func.Ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

      {/* Modal de Detalhes do Funcionário */}
      {selectedFunc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Detalhes do Colaborador
              </h3>
              <button 
                onClick={() => setSelectedFunc(null)} 
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                
                {/* Nome e Mecanográfico */}
                <div className="col-span-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-700 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-900 font-black text-2xl uppercase shadow-md">
                    {selectedFunc.Nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">{selectedFunc.Nome}</p>
                    <p className="text-sm font-mono font-bold text-slate-400">#{selectedFunc.NumeroMecanografico}</p>
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cargo</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${CARGO_COLORS[selectedFunc.Cargo] ?? "bg-slate-800 text-slate-400 border-slate-600"}`}>
                    {selectedFunc.Cargo === "ADMINISTRADOR" && <Shield className="w-3 h-3" />}
                    {CARGO_LABELS[selectedFunc.Cargo] ?? selectedFunc.Cargo}
                  </span>
                </div>

                {/* Estado */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estado</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase border ${selectedFunc.Ativo ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {selectedFunc.Ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* Contactos */}
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contactos</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <div className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg"><Mail className="w-4 h-4" /></div>
                      {selectedFunc.Email}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg"><Phone className="w-4 h-4" /></div>
                      {selectedFunc.Contacto}
                    </div>
                  </div>
                </div>

                {/* Especialidade */}
                {selectedFunc.Especialidade && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Especialidade</p>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-300 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                      <Wrench className="w-4 h-4 text-slate-500" />
                      {selectedFunc.Especialidade}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
               <button 
                 onClick={() => setSelectedFunc(null)} 
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