import { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';

export function ScheduleRepairDialog({
  open,
  onOpenChange,
  repair,
  interventions,
  parts,
  onConfirmSchedule,
}) {
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [mechanicNotes, setMechanicNotes] = useState('');

  if (!open) return null;

  const totalEstimatedTime = interventions.reduce(
    (sum, intervention) => sum + intervention.estimatedTime,
    0
  );

  const handleConfirm = () => {
    if (!scheduleDate || !scheduleTime) return;

    onConfirmSchedule({
      date: scheduleDate,
      time: scheduleTime,
      mechanicNotes,
    });

    setScheduleDate('');
    setScheduleTime('');
    setMechanicNotes('');
    onOpenChange(false);
  };

  const suggestDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setScheduleDate(dateStr);
    setScheduleTime('09:00');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Agendar Reparação</h2>
            <p className="text-slate-500 text-sm">
              Defina a data e hora para a reparação da trotinete {repair?.vehiclePlate}
            </p>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info do Veículo */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block">Trotinete:</span>
              <span className="font-bold text-slate-900">{repair?.vehicleBrand} {repair?.vehicleModel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Matrícula/ID:</span>
              <span className="font-bold text-slate-900">{repair?.vehiclePlate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cliente:</span>
              <span className="font-bold text-slate-900">{repair?.clientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tempo Estimado:</span>
              <span className="font-bold text-blue-600">{totalEstimatedTime} min</span>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                Intervenções ({interventions.length})
              </h4>
              <ul className="space-y-1 text-sm text-slate-600">
                {interventions.map((i) => (
                  <li key={i.IntervencaoID} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span> {i.Descricao}
                  </li>
                ))}
              </ul>
            </div>
            {parts.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Peças ({parts.length})</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {parts.map((p) => (
                    <li key={p.CodigoEAN}>• {p.Nome} (x{p.StockAtual})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Data</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 outline-hidden transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Hora</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={suggestDate}
              className="w-full py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Sugerir Próximo Dia Útil (09:00)
            </button>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Notas para o Mecânico</label>
              <textarea
                placeholder="Instruções especiais..."
                value={mechanicNotes}
                onChange={(e) => setMechanicNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 outline-hidden transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!scheduleDate || !scheduleTime}
            className="px-6 py-2.5 font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-green-200 transition-all active:scale-95"
          >
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}