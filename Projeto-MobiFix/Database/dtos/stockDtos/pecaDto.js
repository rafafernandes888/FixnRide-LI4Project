const paraPecaDto = (p) => {
    if (!p) return null;
    return {
        CodigoEAN: p._id.toString(),
        Nome: p.nome,
        Descricao: p.descricao || null,
        Categoria: p.categoria || null,
        CustoAquisicao: p.custoAquisicao,
        PVP: p.pvp,
        StockAtual: p.stockAtual,
        StockMinimo: p.stockMinimo,
        PadraoReposicao: p.padraoReposicao,
        Imagem: p.imagem || null,
        Ativo: !!p.ativo
    };
};

module.exports = { paraPecaDto };
