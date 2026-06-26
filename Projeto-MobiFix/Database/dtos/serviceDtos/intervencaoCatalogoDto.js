const paraIntervencaoCatalogoDto = (i) => {
    if (!i) return null;
    return {
        IntervencaoID: i._id,
        Descricao: i.descricao,
        PrecoFixoMaoDeObra: i.precoFixoMaoDeObra,
        Especialidade: i.especialidade
    };
};

module.exports = { paraIntervencaoCatalogoDto };
