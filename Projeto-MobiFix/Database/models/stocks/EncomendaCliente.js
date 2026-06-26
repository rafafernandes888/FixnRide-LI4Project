const mongoose = require('mongoose');

const encomendaClienteSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  clienteId: { type: String, ref: 'Cliente', required: true },
  dataEncomenda: { 
    type: String, 
    default: () => new Date().toISOString().substring(0, 16) 
  },
  estado: { 
    type: String, 
    default: 'PRONTO PARA LEVANTAMENTO',
    enum: ['ENTREGUE', 'PRONTO PARA LEVANTAMENTO', 'LEVANTADA']
  },
  total: { type: Number, required: true, min: 0 },
  faturaId: { type: String, ref: 'Fatura', default: null },
  itens: [{
    pecaId: { type: String, ref: 'Peca', required: true },
    quantidade: { type: Number, required: true, min: 1 }
  }]
}, { versionKey: false });

const EncomendaCliente = mongoose.model('EncomendaCliente', encomendaClienteSchema, 'encomendas_cliente');
module.exports = EncomendaCliente;