const Fatura = require('../../models/finance/Fatura');
const { paraFaturaDto } = require('../../dtos/financeDtos/faturaDto');

exports.criarFatura = async (req, res) => {
    try {
        const novaFatura = new Fatura({
            _id: req.body.NumeroFatura,
            
            clienteId: req.body.ClienteNIF || req.body.clienteId, 
            
            servicoId: req.body.ServicoID || null,
            
            vendaId: req.body.VendaID || null,     
            
            valorTotal: req.body.ValorTotal,
            metodoPagamento: req.body.MetodoPagamento,
            devolucoes: []
            
        });

        await novaFatura.save();
        
        return res.status(201).json(paraFaturaDto(novaFatura.toObject()));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.listarFaturas = async (req, res) => {
    try {
        const { nif, metodoPagamento, dataMin, dataMax } = req.query;
        let filtro = {};

        if (nif) filtro.clienteId = nif;

        if (metodoPagamento) filtro.metodoPagamento = metodoPagamento.toUpperCase();

        if (dataMin || dataMax) {
            filtro.dataEmissao = {};
            if (dataMin) filtro.dataEmissao.$gte = dataMin; 
            if (dataMax) filtro.dataEmissao.$lte = dataMax; 
        }

        const faturas = await Fatura.find(filtro)
            .sort({ dataEmissao: -1 })
            .lean();

        return res.status(200).json(faturas.map(f => paraFaturaDto(f)));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.obterFatura = async (req, res) => {
    try {
        const fatura = await Fatura.findById(req.params.numero).lean();
        if (!fatura) return res.status(404).json({ mensagem: "Fatura não encontrada." });
        return res.status(200).json(paraFaturaDto(fatura));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.atualizarFatura = async (req, res) => {
    try {
        // Tratar devoluções
        let devolucoesFormatadas = [];
        if (req.body.Devolucoes) {
            devolucoesFormatadas = req.body.Devolucoes.map(dev => ({
                motivo: dev.Motivo,
                notaCredito: { valorCreditado: dev.NotaCredito.ValorCreditado }
            }));
        }

        const fatura = await Fatura.findByIdAndUpdate(req.params.numero, { devolucoes: devolucoesFormatadas }, { new: true }).lean();
        if (!fatura) return res.status(404).json({ mensagem: "Fatura não encontrada." });
        return res.status(200).json(paraFaturaDto(fatura));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarFatura = async (req, res) => {
    try {
        const resultado = await Fatura.findByIdAndDelete(req.params.numero);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};