const mongoose = require('mongoose');

const agendaSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  mecanicoId: { type: String, ref: 'Funcionario', required: true },
  servicoId: { type: Number, ref: 'Servico', required: true },
  tipoSlot: { 
    type: String, 
    required: true,
    enum: ['DIAGNOSTICO', 'REPARACAO']
  },
  intervencaoId: { type: Number, ref: 'IntervencaoCatalogo', default: null },
  
  dataHoraInicio: { 
    type: String, 
    default: () => new Date().toISOString().substring(0, 16) 
  },
  
  estado: { type: String, default: 'RESERVADO' }
}, { versionKey: false });

const Agenda = mongoose.model('Agenda', agendaSchema, 'agenda');
module.exports = Agenda;