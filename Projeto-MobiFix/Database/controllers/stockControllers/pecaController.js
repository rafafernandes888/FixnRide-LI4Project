const Peca = require('../../models/stocks/Peca');
const { paraPecaDto } = require('../../dtos/stockDtos/pecaDto');

exports.listarPecas = async (req, res) => {
    try {
        const { ativo, nome, categoria } = req.query;
        let filtro = {};
        if (ativo !== undefined) filtro.ativo = ativo === 'true';
        if (nome) filtro.nome = { $regex: nome, $options: 'i' };
        if (categoria) filtro.categoria = categoria.toUpperCase();
        const pecas = await Peca.find(filtro)
            .sort({ categoria: 1, nome: 1 })
            .lean();
        return res.status(200).json(pecas.map(paraPecaDto));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterPorEan = async (req, res) => {
    try {
        const peca = await Peca.findById(req.params.ean).lean();
        if (!peca) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(200).json(paraPecaDto(peca));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.criarPeca = async (req, res) => {
    try {
        const nova = new Peca({
            _id: req.body.CodigoEAN,
            nome: req.body.Nome,
            descricao: req.body.Descricao,
            categoria: req.body.Categoria.toUpperCase(),
            custoAquisicao: req.body.CustoAquisicao,
            pvp: req.body.PVP,
            stockAtual: req.body.StockAtual ?? 0,
            stockMinimo: req.body.StockMinimo ?? 5,
            padraoReposicao: req.body.PadraoReposicao ?? 5,
            imagem: req.body.Imagem,
            ativo: req.body.Ativo ?? true
        });
        await nova.save();
        return res.status(201).json(paraPecaDto(nova));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.atualizarPeca = async (req, res) => {
    try {
        const dados = {};
        if (req.body.Nome) dados.nome = req.body.Nome;
        if (req.body.Descricao !== undefined) dados.descricao = req.body.Descricao;
        if (req.body.Categoria !== undefined) dados.categoria = req.body.Categoria.toUpperCase();
        if (req.body.CustoAquisicao !== undefined) dados.custoAquisicao = req.body.CustoAquisicao;
        if (req.body.PVP !== undefined) dados.pvp = req.body.PVP;
        if (req.body.StockAtual !== undefined) dados.stockAtual = req.body.StockAtual;
        if (req.body.StockMinimo !== undefined) dados.stockMinimo = req.body.StockMinimo;
        if (req.body.PadraoReposicao !== undefined) dados.padraoReposicao = req.body.PadraoReposicao;
        if (req.body.Imagem !== undefined) dados.imagem = req.body.Imagem;
        if (req.body.Ativo !== undefined) dados.ativo = req.body.Ativo;

        const peca = await Peca.findByIdAndUpdate(req.params.ean, dados, { new: true }).lean();
        if (!peca) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(200).json(paraPecaDto(peca));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.alterarEstadoPeca = async (req, res) => {
    try {
        const { ean } = req.params;
        const { ativo } = req.body;

        if (typeof ativo !== 'boolean') {
            return res.status(400).json({ error: "O campo 'ativo' deve ser um valor booleano (true ou false)." });
        }

        const peca = await Peca.findByIdAndUpdate(
            ean, 
            { ativo: ativo },
            { new: true }
        ).lean();

        if (!peca) {
            return res.status(404).json({ mensagem: "Peça não encontrada." });
        }

        return res.status(200).json(paraPecaDto(peca));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
