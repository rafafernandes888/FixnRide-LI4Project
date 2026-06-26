const paraFaturaDto = (f) => {
    if (!f) return null;
    return {
        NumeroFatura: f._id.toString(),
        ClienteNIF: f.clienteId,
        ServicoID: f.servicoId || null,
        VendaID: f.vendaId || null,
        ValorTotal: f.valorTotal,
        MetodoPagamento: f.metodoPagamento,
        DataEmissao: f.dataEmissao,
        Devolucoes: (f.devolucoes || []).map(d => ({
            DevolucaoID: d._id?.toString() || null,
            DataDevolucao: d.dataDevolucao,
            Motivo: d.motivo,
            NotaCredito: d.notaCredito ? {
                ValorCreditado: d.notaCredito.valorCreditado
            } : null
        }))
    };
};

module.exports = { paraFaturaDto };
