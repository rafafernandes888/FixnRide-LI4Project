const Agenda = require('../../models/service/Agenda');
const { paraAgendaDto } = require('../../dtos/serviceDtos/agendaDto');

exports.criarSlot = async (req, res) => {
    try {
        const novoSlot = new Agenda({
            _id: req.body.AgendaID, 
            mecanicoId: req.body.MecanicoNumero, // O teu Schema quer "mecanicoId"
            servicoId: req.body.ServicoID,
            tipoSlot: req.body.TipoSlot,
            intervencaoID: req.body.IntervencaoID, 
            dataHoraInicio: req.body.DataHoraInicio,
            estado: req.body.Estado
        });
        await novoSlot.save();
        return res.status(201).json(paraAgendaDto(novoSlot.toObject()));
    } catch (error) {
        return res.status(400).json({ error: "Erro ao criar slot de agenda.", detalhes: error.message });
    }
};

exports.listarAgenda = async (req, res) => {
    try {
        const { mecanicoId, servicoId, estado, tipoSlot } = req.query;
        let filtro = {};
        if (mecanicoId) filtro.mecanicoId = mecanicoId;
        if (servicoId) filtro.servicoId = Number(servicoId);
        if (estado) filtro.estado = estado.toUpperCase();
        if (tipoSlot) filtro.tipoSlot = tipoSlot.toUpperCase();
        const agenda = await Agenda.find(filtro)
            .sort({ dataHoraInicio: 1 })
            .lean();
        return res.status(200).json(agenda.map(a => paraAgendaDto(a)));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterSlot = async (req, res) => {
    try {
        const slot = await Agenda.findById(req.params.id).lean();
        if (!slot) return res.status(404).json({ mensagem: "Slot não encontrado." });
        return res.status(200).json(paraAgendaDto(slot));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.atualizarSlot = async (req, res) => {
    try {
        const dadosAtualizados = {
            mecanicoId: req.body.MecanicoNumero,
            servicoId: req.body.ServicoID,
            tipoSlot: req.body.TipoSlot,
            dataHoraInicio: req.body.DataHoraInicio,
            estado: req.body.Estado
        };
        const slot = await Agenda.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true, runValidators: true }).lean();
        if (!slot) return res.status(404).json({ mensagem: "Slot não encontrado." });
        return res.status(200).json(paraAgendaDto(slot));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarSlot = async (req, res) => {
    try {
        const resultado = await Agenda.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};