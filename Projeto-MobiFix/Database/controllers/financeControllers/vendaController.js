const Venda = require('../../models/finance/Venda');
const { paraVendaDto } = require('../../dtos/financeDtos/vendaDto');

exports.criarVenda = async (req, res) => {
    try {
        const itensFormatados = req.body.ItensVenda.map(item => ({
            pecaId: item.PecaEAN,
            quantidade: item.Quantidade
        }));

        const novaVenda = new Venda({
            _id: req.body.VendaID,
            operadorId: req.body.OperadorNumero,
            total: req.body.Total,
            itensVenda: itensFormatados,
            dataVenda: new Date()
        });
        await novaVenda.save();
        return res.status(201).json(paraVendaDto(novaVenda.toObject()));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.listarVendas = async (req, res) => {
    try {
        const { operadorId, dataMin, dataMax } = req.query;
        let filtro = {};
        if (operadorId) filtro.operadorId = Number(operadorId);
        if (dataMin || dataMax) {
            filtro.dataVenda = {};
            if (dataMin) filtro.dataVenda.$gte = dataMin;
            if (dataMax) filtro.dataVenda.$lte = dataMax;
        }
        const vendas = await Venda.find(filtro)
            .sort({ dataVenda: -1 })
            .lean();
        return res.status(200).json(vendas.map(v => paraVendaDto(v)));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterVenda = async (req, res) => {
    try {
        const venda = await Venda.findById(req.params.id).lean();
        if (!venda) return res.status(404).json({ mensagem: "Venda não encontrada." });
        return res.status(200).json(paraVendaDto(venda));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.atualizarVenda = async (req, res) => {
    try {
        const dadosAtualizados = { total: req.body.Total };
        if (req.body.ItensVenda) {
            dadosAtualizados.itensVenda = req.body.ItensVenda.map(i => ({ pecaEAN: i.PecaEAN, quantidade: i.Quantidade }));
        }

        const venda = await Venda.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true }).lean();
        if (!venda) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraVendaDto(venda));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarVenda = async (req, res) => {
    try {
        const resultado = await Venda.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};