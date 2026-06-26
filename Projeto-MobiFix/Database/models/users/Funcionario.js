const mongoose = require('mongoose');

const funcionarioSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Corresponde ao NumeroMecanografico (ex: ADM001)
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contacto: { type: String, required: true },
  cargo: { 
    type: String, 
    required: true,
    enum: ['ADMINISTRADOR', 'OPERADOR', 'MECANICO'] 
  },
  especialidade: { type: String, default: null }, // Apenas para Mecânicos
  passwordHash: { type: String, required: true },
  ativo: { type: Boolean, default: true }
}, { versionKey: false });

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);
module.exports = Funcionario;