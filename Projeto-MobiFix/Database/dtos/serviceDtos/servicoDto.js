const paraServicoDto = (s) => {
    if (!s) return null;
    return {
        ServicoID: s._id,
        TrotineteNumSerie: s.trotineteId,
        Estado: s.estado,
        DataAgendamento: s.dataAgendamento,
        DescricaoDiagnostico: s.descricaoDiagnostico || null,
        FeedbackCliente: s.feedbackCliente || null,
        DataConclusao: s.dataConclusao || null,
        Preco: s.preco,
        HistoricoIntervencoes: (s.historicoIntervencoes || []).map(i => ({
            IntervencaoCatalogoID: i.intervencaoCatalogoId,
            MecanicoNumero: i.mecanicoId,
            DataInicio: i.dataInicio,
            DataFim: i.dataFim || null,
            TempoGastoMinutos: i.tempoGastoMinutos || null,
            PecasUtilizadas: (i.pecasUtilizadas || []).map(p => ({
                PecaEAN: p.pecaId,
                Quantidade: p.quantidade
            }))
        }))
    };
};

module.exports = { paraServicoDto };
