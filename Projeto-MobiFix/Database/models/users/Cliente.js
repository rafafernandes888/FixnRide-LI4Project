const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Corresponde ao NIF (ex: 250123456)
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  morada: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { versionKey: false });

const Cliente = mongoose.model('Cliente', clienteSchema);
module.exports = Cliente;