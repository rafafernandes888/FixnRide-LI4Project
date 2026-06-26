const paraVendaDto = (v) => {
    if (!v) return null;
    return {
        VendaID: v._id,
        OperadorNumero: v.operadorId,
        DataVenda: v.dataVenda,
        Total: v.total,
        ItensVenda: (v.itensVenda || []).map(i => ({
            PecaEAN: i.pecaId,
            Quantidade: i.quantidade
        }))
    };
};

module.exports = { paraVendaDto };
