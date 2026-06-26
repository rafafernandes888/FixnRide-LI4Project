const Trotinete = require('../../models/users/Trotinete');
const { paraTrotineteDto } = require('../../dtos/userDtos/trotineteDto');

exports.listarTrotinetes = async (req, res) => {
    try {
        const { nif, emServico, marca, modelo } = req.query;
        let filtro = {};
        if (nif) filtro.clienteId = nif;
        if(marca) filtro.marca = { $regex: marca, $options: 'i'}
        if(emServico) filtro.emServico = emServico;
        const trotinetes = await Trotinete.find(filtro).lean();
        return res.status(200).json(trotinetes.map(paraTrotineteDto));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterPorNumSerie = async (req, res) => {
    try {
        const trotinete = await Trotinete.findById(req.params.numSerie).lean();
        if (!trotinete) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(200).json(paraTrotineteDto(trotinete));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.criarTrotinete = async (req, res) => {
    try {
        const nova = new Trotinete({
            _id: req.body.NumeroSerie,
            marca: req.body.Marca,
            modelo: req.body.Modelo,
            emServico: req.body.EmServico ?? false,
            clienteId: req.body.ClienteNIF
        });
        await nova.save();
        return res.status(201).json(paraTrotineteDto(nova));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.atualizarTrotinete = async (req, res) => {
    try {
        const dados = {};
        if (req.body.Marca) dados.marca = req.body.Marca;
        if (req.body.Modelo) dados.modelo = req.body.Modelo;
        if (req.body.EmServico !== undefined) dados.emServico = req.body.EmServico;

        const trotinete = await Trotinete.findByIdAndUpdate(req.params.numSerie, dados, { new: true }).lean();
        if (!trotinete) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(200).json(paraTrotineteDto(trotinete));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarTrotinete = async (req, res) => {
    try {
        const resultado = await Trotinete.findByIdAndDelete(req.params.numSerie);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrada." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
