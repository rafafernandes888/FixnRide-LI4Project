const mongoose = require('mongoose');

const vendaSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  operadorId: { type: String, ref: 'Funcionario', required: true },
  dataVenda: { 
    type: String, 
    default: () => new Date().toISOString().substring(0, 16) 
  },
  total: { type: Number, required: true, min: 0 },
  itensVenda: [{
    pecaId: { type: String, ref: 'Peca' },
    quantidade: { type: Number, required: true, min: 1 }
  }]
}, { versionKey: false });

const Venda = mongoose.model('Venda', vendaSchema);
module.exports = Venda;