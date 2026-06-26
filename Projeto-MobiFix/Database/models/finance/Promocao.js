const mongoose = require('mongoose');

const promocaoSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  descricao: { type: String, required: true },
  percentagemDesconto: { type: Number, required: true, min: 0, max: 100 },
  dataInicio: { 
    type: String, 
    required: true 
  },
  dataFim: { 
    type: String, 
    required: true 
  },
  administradorId: { type: String, ref: 'Funcionario', required: true },
  ativa: {type: Boolean ,default: true},
  pecasAplicaveisIds: [{ type: String, ref: 'Peca' }]
}, { versionKey: false });

const Promocao = mongoose.model('Promocao', promocaoSchema, 'promocoes');
module.exports = Promocao;