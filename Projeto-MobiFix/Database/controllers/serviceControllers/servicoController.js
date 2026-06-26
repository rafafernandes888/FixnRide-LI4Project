const Servico = require('../../models/service/Servico');
const { paraServicoDto } = require('../../dtos/serviceDtos/servicoDto');

exports.criarServico = async (req, res) => {
    try {
        const servico = new Servico({
            _id: req.body.ServicoID,
            trotineteId: req.body.TrotineteNumSerie,
            estado: req.body.Estado,
            feedbackCliente: req.body.FeedbackCliente,
            preco: req.body.Preco,
            dataAgendamento: new Date(),
            historicoIntervencoes: []
        });
        await servico.save();
        return res.status(201).json(paraServicoDto(servico.toObject()));
    } catch (error) { return res.status(400).json({ error: error.message }); }
};

exports.listarServicos = async (req, res) => {
    try {
        const { estado, trotineteId, dataMin, dataMax } = req.query;
        let filtro = {};
        if (estado) filtro.estado = estado.toUpperCase();
        if (trotineteId) filtro.trotineteId = trotineteId;
        if (dataMin || dataMax) {
            filtro.dataAgendamento = {};
            if (dataMin) filtro.dataAgendamento.$gte = new Date(dataMin);
            if (dataMax) filtro.dataAgendamento.$lte = new Date(dataMax);
        }
        const servicos = await Servico.find(filtro)
            .sort({ dataAgendamento: -1 })
            .lean();
        return res.status(200).json(servicos.map(s => paraServicoDto(s)));
    } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.obterServico = async (req, res) => {
    try {
        const servico = await Servico.findById(req.params.id).lean();
        if (!servico) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraServicoDto(servico));
    } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.atualizarServico = async (req, res) => {
    try {
        const update = {};
        if (req.body.Estado !== undefined) update.estado = req.body.Estado;
        if (req.body.DescricaoDiagnostico !== undefined) update.descricaoDiagnostico = req.body.DescricaoDiagnostico;
        if (req.body.Preco !== undefined) update.preco = req.body.Preco;
        if (req.body.DataConclusao !== undefined) {
            update.dataConclusao = req.body.DataConclusao ? new Date(req.body.DataConclusao) : null;
        }
        if (Array.isArray(req.body.HistoricoIntervencoes)) {
            update.historicoIntervencoes = req.body.HistoricoIntervencoes.map(h => ({
                intervencaoCatalogoId: h.IntervencaoCatalogoID,
                mecanicoId: h.MecanicoNumero,
                dataInicio: h.DataInicio ? new Date(h.DataInicio) : undefined,
                dataFim: h.DataFim ? new Date(h.DataFim) : undefined,
                tempoGastoMinutos: h.TempoGastoMinutos ?? null,
                pecasUtilizadas: (h.PecasUtilizadas || []).map(p => ({
                    pecaId: p.PecaEAN,
                    quantidade: p.Quantidade
                }))
            }));
        }

        const atualizado = await Servico.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
        if (!atualizado) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraServicoDto(atualizado));
    } catch (error) { return res.status(400).json({ error: error.message }); }
};

exports.eliminarServico = async (req, res) => {
    try {
        const removido = await Servico.findByIdAndDelete(req.params.id);
        if (!removido) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(204).send();
    } catch (error) { return res.status(500).json({ error: error.message }); }
};