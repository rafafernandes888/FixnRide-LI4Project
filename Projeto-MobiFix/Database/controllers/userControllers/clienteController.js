const Cliente = require('../../models/users/Cliente');
const { paraClienteDto } = require('../../dtos/userDtos/clienteDto');

exports.obterPorNifSistema = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
            return res.status(403).json({ error: "Acesso Negado." });
        }
        const cliente = await Cliente.findById(req.params.nif).lean();
        if (!cliente) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraClienteDto(cliente));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.listarClientes = async (req, res) => {
    try {
        const { nome, email } = req.query;
        let filtro = {};
        if (nome) filtro.nome = { $regex: nome, $options: 'i' };
        if (email) filtro.email = email;
        const clientes = await Cliente.find(filtro)
            .sort({ nome: 1 })
            .lean();
        return res.status(200).json(clientes.map(paraClienteDto));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.obterPorNif = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.nif).lean();
        if (!cliente) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraClienteDto(cliente));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.criarCliente = async (req, res) => {
    try {
        const novo = new Cliente({
            _id: req.body.NIF,
            nome: req.body.Nome,
            telefone: req.body.Telefone,
            morada: req.body.Morada,
            email: req.body.Email,
            passwordHash: req.body.PasswordHash
        });
        await novo.save();

        const clienteLimpo = novo.toObject();

        delete clienteLimpo.passwordHash;

        return res.status(201).json(paraClienteDto(clienteLimpo));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.atualizarCliente = async (req, res) => {
    try {
        const dados = {};
        if (req.body.Nome) dados.nome = req.body.Nome;
        if (req.body.Telefone) dados.telefone = req.body.Telefone;
        if (req.body.Morada !== undefined) dados.morada = req.body.Morada;
        if (req.body.Email) dados.email = req.body.Email;

        const cliente = await Cliente.findByIdAndUpdate(req.params.nif, dados, { new: true }).lean();
        if (!cliente) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(200).json(paraClienteDto(cliente));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminarCliente = async (req, res) => {
    try {
        const resultado = await Cliente.findByIdAndDelete(req.params.nif);
        if (!resultado) return res.status(404).json({ mensagem: "Não encontrado." });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
