const mongoose = require('mongoose');

const intervencaoCatalogoSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  descricao: { type: String, required: true },
  precoFixoMaoDeObra: { type: Number, required: true, min: 0 },
  especialidade: { type: String, required: true }
}, { versionKey: false });

const IntervencaoCatalogo = mongoose.model('IntervencaoCatalogo', intervencaoCatalogoSchema, 'intervencoes_catalogo');
module.exports = IntervencaoCatalogo;