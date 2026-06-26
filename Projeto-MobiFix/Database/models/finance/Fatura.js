const mongoose = require('mongoose');

const faturaSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // NumeroFatura
  clienteId: { type: String, ref: 'Cliente', required: true },
  servicoId: { type: Number, ref: 'Servico', default: null },
  vendaId: { type: Number, ref: 'Venda', default: null },
  valorTotal: { type: Number, required: true, min: 0 },
  metodoPagamento: { 
    type: String, 
    required: true,
    enum: ['MBWAY', 'MULTIBANCO', 'NUMERARIO'] 
  },
  
  dataEmissao: { 
    type: String, 
    default: () => new Date().toISOString().substring(0, 16) 
  },
  
  devolucoes: [{
    dataDevolucao: { 
      type: String, 
      default: () => new Date().toISOString().substring(0, 16) 
    },
    motivo: { type: String, required: true },
    notaCredito: {
      valorCreditado: { type: Number, required: true, min: 0 }
    }
  }]
}, { versionKey: false });

const Fatura = mongoose.model('Fatura', faturaSchema);
module.exports = Fatura;