const paraEncomendaClienteDto = (e) => {
    if (!e) return null;
    return {
        EncomendaClienteID: e._id,
        ClienteNIF: e.clienteId,
        DataEncomenda: e.dataEncomenda,
        Estado: e.estado,
        Total: e.total,
        FaturaNumero: e.faturaId || null,
        Itens: (e.itens || []).map(i => ({
            PecaEAN: i.pecaId,
            Quantidade: i.quantidade
        }))
    };
};

module.exports = { paraEncomendaClienteDto };
