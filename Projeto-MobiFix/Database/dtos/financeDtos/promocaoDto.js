const paraPromocaoDto = (p) => {
    if (!p) return null;
    return {
        PromocaoID: p._id,
        Descricao: p.descricao,
        PercentagemDesconto: p.percentagemDesconto,
        DataInicio: p.dataInicio,
        DataFim: p.dataFim,
        AdministradorNumero: p.administradorId,
        Ativa: p.ativa,
        PecasAplicaveisEANs: p.pecasAplicaveisIds || []
    };
};

module.exports = { paraPromocaoDto };
