const Promocao = require('../../models/finance/Promocao');
const { paraPromocaoDto } = require('../../dtos/financeDtos/promocaoDto');

exports.criarPromocao = async (req, res) => {
    try {
        const novaPromocao = new Promocao({
            _id: req.body.PromocaoID,
            descricao: req.body.Descricao,
            percentagemDesconto: req.body.PercentagemDesconto,
            dataInicio: req.body.DataInicio,
            dataFim: req.body.DataFim,
            
            administradorId: req.body.AdministradorNumero || req.body.administradorId,
            
            ...(req.body.Ativa !== undefined && { ativa: req.body.Ativa }),

            pecasAplicaveisIds: req.body.PecasAplicaveisEANs || req.body.pecasAplicaveisIds || []
        });

        await novaPromocao.save();
        
        return res.status(201).json(paraPromocaoDto(novaPromocao.toObject()));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.listarPromocoes = async (req, res) => {
    try {
        const { ativa, pecaEan, dataMin, dataMax } = req.query;
        let filtro = {};

        if (ativa !== undefined) filtro.ativa = ativa; 

        if (pecaEan) filtro.pecasAplicaveisIds = pecaEan;

        if (dataMin || dataMax) {
            filtro.dataInicio = {};
            if (dataMin) filtro.dataInicio.$gte = dataMin;
            if (dataMax) filtro.dataInicio.$lte = dataMax;
        }

        const promocoes = await Promocao.find(filtro)
            .sort({ dataFim: -1 })
            .lean();
            
        return res.status(200).json(promocoes.map(p => paraPromocaoDto(p)));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterPromocao = async (req, res) => {
    try {
        const promocao = await Promocao.findById(req.params.id).lean();
        if (!promocao) return res.status(404).json({ mensagem: "Promoção não encontrada." });
        return res.status(200).json(paraPromocaoDto(promocao));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.atualizarPromocao = async (req, res) => {
    try {
        const dadosAtualizados = {
            descricao: req.body.Descricao,
            percentagemDesconto: req.body.PercentagemDesconto,
            dataFim: req.body.DataFim
        };

        const promocao = await Promocao.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true }).lean();
        if (!promocao) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(200).json(paraPromocaoDto(promocao));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


// Método para Ativar/Desativar Promoção
exports.alterarEstadoPromocao = async (req, res) => {
    try {
        const { id } = req.params;
        const { ativa } = req.body;

        if (typeof ativa !== 'boolean') {
            return res.status(400).json({ error: "O campo 'ativa' deve ser um valor booleano (true ou false)." });
        }
        const promocaoAtualizada = await Promocao.findByIdAndUpdate(
            Number(id), 
            { ativa: ativa },
            { new: true } 
        ).lean();

        if (!promocaoAtualizada) {
            return res.status(404).json({ error: "Promoção não encontrada." });
        }

        return res.status(200).json(paraPromocaoDto(promocaoAtualizada));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.eliminarPromocao = async (req, res) => {
    try {
        const resultado = await Promocao.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};