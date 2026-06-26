const EncomendaStock = require('../../models/stocks/EncomendaStock');
const { paraEncomendaStockDto } = require('../../dtos/stockDtos/encomendaStockDto');

exports.criarEncomenda = async (req, res) => {
    try {
        const novaEncomenda = new EncomendaStock({
            _id: req.body.EncomendaID,
            pecaId: req.body.PecaEAN,
            quantidade: req.body.Quantidade,
            estado: req.body.Estado, // PENDENTE
            adminValidadorId: req.body.AdminValidadorNumero,
            dataPedido: new Date()
        });
        await novaEncomenda.save();
        return res.status(201).json(paraEncomendaStockDto(novaEncomenda.toObject()));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.listarEncomendas = async (req, res) => {
    try {
        const { estado, pecaId } = req.query;
        let filtro = {};
        if (estado) filtro.estado = estado.toUpperCase();
        if (pecaId) filtro.pecaId = pecaId;
        const encomendas = await EncomendaStock.find(filtro)
            .sort({ dataPedido: -1 })
            .lean();
        return res.status(200).json(encomendas.map(e => paraEncomendaStockDto(e)));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterEncomenda = async (req, res) => {
    try {
        const encomenda = await EncomendaStock.findById(req.params.id).lean();
        if (!encomenda) return res.status(404).json({ mensagem: "Encomenda não encontrada." });
        return res.status(200).json(paraEncomendaStockDto(encomenda));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.atualizarEncomenda = async (req, res) => {
    try {
        const dadosAtualizados = { estado: req.body.Estado };
        if (req.body.OperadorRececaoNumero) {
            dadosAtualizados.operadorRececaoId = req.body.OperadorRececaoNumero;
        }

        const encomenda = await EncomendaStock.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true, runValidators: true }).lean();
        if (!encomenda) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraEncomendaStockDto(encomenda));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarEncomenda = async (req, res) => {
    try {
        const resultado = await EncomendaStock.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};