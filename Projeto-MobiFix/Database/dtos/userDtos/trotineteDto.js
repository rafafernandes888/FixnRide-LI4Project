const paraTrotineteDto = (t) => {
    if (!t) return null;
    return {
        NumeroSerie: t._id.toString(),
        Marca: t.marca,
        Modelo: t.modelo,
        EmServico: !!t.emServico,
        ClienteNIF: t.clienteId
    };
};

module.exports = { paraTrotineteDto };
