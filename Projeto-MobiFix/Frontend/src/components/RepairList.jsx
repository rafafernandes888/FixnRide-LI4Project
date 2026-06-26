import { Clock, AlertCircle, Wrench, Battery, TestTubeDiagonal, Scooter } from 'lucide-react';

export function RepairList({ repairs, selectedRepairId, onSelectRepair }) {
  
  const getStatusClasses = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'diagnosed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scheduled':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'AGENDADO',
      completed: 'CONCLUIDO'
    };
    return labels[status] || status;
  };

  const getBatteryColor = (level) => {
    if (level === undefined) return 'text-slate-400';
    if (level <= 20) return 'text-red-500';
    if (level <= 50) return 'text-amber-500';
    return 'text-green-600';
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Cabeçalho do Card Lateral */}
      <div className="border-b bg-linear-to-br from-slate-50 to-slate-100 p-6">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
          <TestTubeDiagonal className="h-7 w-7 text-blue-600" />
          Diagnósticos do Dia
        </h2>
        <p className="mt-1 text-slate-600">
          {repairs.filter(r => r.status !== 'AGENDADO').length} trotinetes para diagnóstico
        </p>
      </div>

      {/* Lista com Scroll */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="space-y-3">
          {repairs.map((repair) => (
            <div
              key={repair.id}
              onClick={() => onSelectRepair(repair.id)}
              className={`group relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg ${
                selectedRepairId === repair.id
                  ? 'border-blue-600 bg-blue-50/50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 font-bold text-white shadow-inner">
                    <Scooter className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {repair.vehiclePlate}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-500">Cliente:</span>{' '}
                  <span className="font-semibold text-slate-900">{repair.clientName}</span>
                </div>
                
                {repair.serialNumber && (
                  <div className="rounded bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-500">
                    Nº Série: {repair.serialNumber}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="font-bold text-slate-900">{repair.scheduledTime}</span>
                    <span className="text-xs text-slate-500">({repair.estimatedDuration} min)</span>
                  </div>
                  
                  <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${getStatusClasses(repair.status)}`}>
                    {getStatusLabel(repair.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}