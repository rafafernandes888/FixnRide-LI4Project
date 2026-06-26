const EncomendaCliente = require('../../models/stocks/EncomendaCliente');
const { paraEncomendaClienteDto } = require('../../dtos/stockDtos/encomendaClienteDto');

exports.criarEncomendaCliente = async (req, res) => {
    try {
        const itensFormatados = req.body.Itens.map(item => ({
            pecaId: item.PecaEAN, 
            quantidade: item.Quantidade
        }));

        const novaEncomenda = new EncomendaCliente({
            _id: req.body.EncomendaClienteID,
            clienteId: req.body.ClienteNIF,
            total: req.body.Total,
            itens: itensFormatados,
            faturaId: req.body.faturaId || null,
            estado: req.body.Estado || "PRONTO PARA LEVANTAMENTO",
            dataEncomenda: new Date()
        });
        await novaEncomenda.save();
        return res.status(201).json(paraEncomendaClienteDto(novaEncomenda.toObject()));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.listarEncomendasCliente = async (req, res) => {
    try {
        const { clienteId, estado } = req.query;
        let filtro = {};
        if (clienteId) filtro.clienteId = clienteId;
        if (estado) filtro.estado = estado.toUpperCase();
        const encomendas = await EncomendaCliente.find(filtro)
            .sort({ dataEncomenda: -1 })
            .lean();
        return res.status(200).json(encomendas.map(e => paraEncomendaClienteDto(e)));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterEncomendaCliente = async (req, res) => {
    try {
        const encomenda = await EncomendaCliente.findById(req.params.id).lean();
        if (!encomenda) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(200).json(paraEncomendaClienteDto(encomenda));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.atualizarEncomendaCliente = async (req, res) => {
    try {
        const dadosAtualizados = {};
        if (req.body.Estado !== undefined) dadosAtualizados.estado = req.body.Estado;
        if (req.body.FaturaNumero !== undefined) dadosAtualizados.faturaId = req.body.FaturaNumero;
        const encomenda = await EncomendaCliente.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true }).lean();
        if (!encomenda) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(200).json(paraEncomendaClienteDto(encomenda));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarEncomendaCliente = async (req, res) => {
    try {
        const resultado = await EncomendaCliente.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};