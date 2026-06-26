const paraEncomendaStockDto = (e) => {
    if (!e) return null;
    return {
        EncomendaID: e._id,
        PecaEAN: e.pecaId,
        Quantidade: e.quantidade,
        Estado: e.estado,
        DataPedido: e.dataPedido,
        OperadorRececaoNumero: e.operadorRececaoId || null,
        AdminValidadorNumero: e.adminValidadorId || null
    };
};

module.exports = { paraEncomendaStockDto };
