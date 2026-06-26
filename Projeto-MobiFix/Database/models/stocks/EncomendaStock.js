const mongoose = require('mongoose');

const encomendaStockSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  pecaId: { type: String, ref: 'Peca', required: true },
  quantidade: { type: Number, required: true, min: 1 },
  estado: { 
    type: String, 
    default: 'PENDENTE',
    enum: ['PENDENTE', 'TRANSITO', 'RECECIONADA']
  },
  dataPedido: { 
    type: String, 
    default: () => new Date().toISOString().substring(0, 16) 
  },
  operadorRececaoId: { type: String, ref: 'Funcionario', default: null },
  adminValidadorId: { type: String, ref: 'Funcionario', default: null }
}, { versionKey: false });

const EncomendaStock = mongoose.model('EncomendaStock', encomendaStockSchema, 'encomendas_stock');
module.exports = EncomendaStock;