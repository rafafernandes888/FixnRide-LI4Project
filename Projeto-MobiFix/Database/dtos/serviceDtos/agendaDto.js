const paraAgendaDto = (a) => {
    if (!a) return null;
    return {
        AgendaID: a._id,
        MecanicoNumero: a.mecanicoId,
        ServicoID: a.servicoId,
        TipoSlot: a.tipoSlot,
        IntervencaoID: a.intervencaoId || null,
        DataHoraInicio: a.dataHoraInicio,
        Estado: a.estado
    };
};

module.exports = { paraAgendaDto };
