import { Calendar, Clock, AlertCircle, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClienteLayout from "./ClienteLayout";
import { useTrotinetes } from "../../hooks/useTrotinetes";
import { useCriarServico } from "../../hooks/useServicos";
import { useCriarAgenda } from "../../hooks/useAgenda";

export default function AgendarDiagnostico() {
  const navigate = useNavigate();

  const { data: scooters = [], isLoading: loadingScooters } = useTrotinetes();
  const criarServico = useCriarServico();
  const criarAgenda = useCriarAgenda();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedScooter, setSelectedScooter] = useState("");
  const [problem, setProblem] = useState("");

  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const servicoObj = await criarServico.mutateAsync({
        trotineteNumSerie: selectedScooter,
        descricao: problem
      });
      const dataHoraIso = `${selectedDate}T${selectedTime}:00`;
      await criarAgenda.mutateAsync({
        servicoID: servicoObj.ServicoID,
        dataHoraInicio: dataHoraIso,
        tipoSlot: 'DIAGNOSTICO'
      });
      alert("Diagnóstico agendado com sucesso! O mecânico foi atribuído automaticamente.");
      navigate("/FixNRide/");
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar o agendamento. Por favor, tente novamente.");
    }
  };

  const isPending = criarServico.isPending || criarAgenda.isPending;
  const isFormValid = selectedDate && selectedTime && selectedScooter && problem && !isPending;

  return (
    <ClienteLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Agendar Diagnóstico</h1>
        <p className="text-sm text-slate-400">Marque a data, hora e descreva o problema da sua trotinete.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-800 leading-relaxed">
              Agende um diagnóstico gratuito. Os nossos técnicos (atribuídos automaticamente) irão avaliar o seu veículo e fornecer um orçamento detalhado em 24h.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
            {/* Trotinete */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-wider">
                Selecione a Trotinete
              </label>
              <select
                value={selectedScooter}
                onChange={(e) => setSelectedScooter(e.target.value)}
                required
                disabled={loadingScooters || isPending}
                className="w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="">{loadingScooters ? "A carregar veículos..." : "Escolha um veículo..."}</option>
                {scooters.filter((s) => !s.EmServico).map((s) => (
                  <option key={s.NumeroSerie} value={s.NumeroSerie}>
                    {s.Marca} {s.Modelo} ({s.NumeroSerie})
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-wider">
                <Calendar className="inline mr-1.5" size={12} /> Data do Diagnóstico
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                disabled={isPending}
                className="w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Horários */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 mb-3 uppercase tracking-wider">
                <Clock className="inline mr-1.5" size={12} /> Horário Disponível
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    disabled={isPending}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedTime === time
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Problema */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-wider">
                Descrição do Problema
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
                placeholder="Ex: O travão traseiro faz barulho..."
                required
                disabled={isPending}
                className="w-full bg-slate-50 border-[1.5px] border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-blue-700 text-white rounded-xl py-3.5 font-extrabold text-sm shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isPending ? (<><Loader2 className="animate-spin" size={18} /> A processar...</>) : "Confirmar Agendamento"}
            </button>
          </form>
        </div>

        {/* Apoio */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-extrabold text-slate-400 mb-4 uppercase tracking-wider">Apoio ao Cliente</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Phone size={14} className="text-blue-600" />
                </div>
                +351 912 345 678
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Mail size={14} className="text-blue-600" />
                </div>
                contacto@fixnride.pt
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin size={14} className="text-blue-600" />
                </div>
                Rua das Trotinetes, 123, Lisboa
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-sm mb-1">Diagnóstico em 24h</h3>
            <p className="text-xs opacity-90 leading-relaxed">Receba um orçamento detalhado por e-mail no próximo dia útil após a entrega da trotinete.</p>
          </div>
        </aside>
      </div>
    </ClienteLayout>
  );
}
