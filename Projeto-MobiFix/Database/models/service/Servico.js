const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  trotineteId: { type: String, ref: 'Trotinete', required: true },
  estado: { 
    type: String, 
    required: true,
    enum: ['AGENDADO', 'EXECUCAO', 'CONCLUIDO', 'FECHADO'] 
  },
  dataAgendamento: { type: Date, default: Date.now },
  descricaoDiagnostico: { type: String, default: null },
  feedbackCliente: { type: String, default: null },
  dataConclusao: { type: Date, default: null },
  preco: { type: Number, default: 0, min: 0 },
  
  historicoIntervencoes: [{
    intervencaoCatalogoId: { type: Number, ref: 'IntervencaoCatalogo' },
    mecanicoId: { type: String, ref: 'Funcionario' },
    dataInicio: { type: Date },
    dataFim: { type: Date },
    tempoGastoMinutos: { type: Number },
    pecasUtilizadas: [{
      pecaId: { type: String, ref: 'Peca' },
      quantidade: { type: Number, default: 1, min: 1 }
    }]
  }]
}, { versionKey: false });

const Servico = mongoose.model('Servico', servicoSchema);
module.exports = Servico;