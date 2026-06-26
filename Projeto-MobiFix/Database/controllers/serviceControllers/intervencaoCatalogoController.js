const IntervencaoCatalogo = require('../../models/service/IntervencaoCatalogo');
const { paraIntervencaoCatalogoDto } = require('../../dtos/serviceDtos/intervencaoCatalogoDto');

exports.criarIntervencao = async (req, res) => {
    try {
        const nova = new IntervencaoCatalogo({
            _id: req.body.IntervencaoID, 
            descricao: req.body.Descricao,
            precoFixoMaoDeObra: req.body.PrecoFixoMaoDeObra, 
            especialidade: req.body.Especialidade
        });
        await nova.save();
        return res.status(201).json(paraIntervencaoCatalogoDto(nova.toObject()));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.listarIntervencoes = async (req, res) => {
    try {
        const { especialidade, descricao } = req.query;
        let filtro = {};
        if (especialidade) filtro.especialidade = especialidade.toUpperCase();
        if (descricao) filtro.descricao = { $regex: descricao, $options: 'i' };
        const lista = await IntervencaoCatalogo.find(filtro)
            .sort({ especialidade: 1, descricao: 1 })
            .lean();
        return res.status(200).json(lista.map(i => paraIntervencaoCatalogoDto(i)));
    } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.obterPorId = async (req, res) => {
    try {
        const item = await IntervencaoCatalogo.findById(req.params.id).lean();
        if (!item) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraIntervencaoCatalogoDto(item));
    } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.atualizarIntervencao = async (req, res) => {
    try {
        const atualizado = await IntervencaoCatalogo.findByIdAndUpdate(req.params.id, {
            descricao: req.body.Descricao,
            precoFixoMaoDeObra: req.body.PrecoFixoMaoDeObra,
            especialidade: req.body.Especialidade
        }, { new: true }).lean();
        if (!atualizado) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraIntervencaoCatalogoDto(atualizado));
    } catch (error) { return res.status(400).json({ error: error.message }); }
};

exports.eliminarIntervencao = async (req, res) => {
    try {
        const removido = await IntervencaoCatalogo.findByIdAndDelete(req.params.id);
        if (!removido) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(204).send();
    } catch (error) { return res.status(500).json({ error: error.message }); }
};