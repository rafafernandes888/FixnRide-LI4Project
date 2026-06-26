const mongoose = require('mongoose');

const pecaSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Corresponde ao CodigoEAN
  nome: { type: String, required: true },
  descricao: { type: String, default: null },
  categoria: {type: String, default: null},
  custoAquisicao: { type: Number, required: true, min: 0 },
  pvp: { type: Number, required: true, min: 0 },
  stockAtual: { type: Number, default: 0, min: 0 },
  stockMinimo: { type: Number, default: 5, min: 0 },
  padraoReposicao: { type: Number, default: 5 },
  imagem: { type: String, default: null }, // nome do ficheiro imagem
  ativo: { type: Boolean, default: true }
}, { versionKey: false });

const Peca = mongoose.model('Peca', pecaSchema);
module.exports = Peca;