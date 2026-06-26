const mongoose = require('mongoose');

const trotineteSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Corresponde ao Numero de Serie
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  emServico: { type: Boolean, default: false },
  clienteId: { type: String, ref: 'Cliente', required: true }
}, { versionKey: false });

const Trotinete = mongoose.model('Trotinete', trotineteSchema);
module.exports = Trotinete;